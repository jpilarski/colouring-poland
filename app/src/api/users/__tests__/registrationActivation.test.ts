import { generateActivationToken, hashTokenSha256 } from '../../common/tokens';
import * as userDataAccess from '../../dataAccess/user';
import { transporter } from '../services/emailService';
import {
    activateUser,
    ACTIVATION_TOKEN_EXPIRY_HOURS,
    createUser,
    INVALID_ACTIVATION_TOKEN_ERROR
} from '../services/userService';
import userController from '../userController';

jest.mock('../../dataAccess/user', () => ({
    insertUser: jest.fn(),
    activateUserByToken: jest.fn(),
    deleteUnactivatedUserById: jest.fn(),
    selectUserAuthData: jest.fn(),
    verifyDummyPassword: jest.fn(),
    recordFailedLoginAttempt: jest.fn(),
    recordSuccessfulLogin: jest.fn(),
    selectUserById: jest.fn(),
    selectUserByEmail: jest.fn(),
    updateUserAPIKey: jest.fn(),
    selectUserIdByAPIKey: jest.fn(),
    revokeAllUserSessions: jest.fn(),
    softDeleteUserById: jest.fn(),
    invalidateUserPasswordResetTokens: jest.fn(),
    insertPasswordResetToken: jest.fn(),
    consumePasswordResetToken: jest.fn(),
    purgeExpiredPasswordResetTokens: jest.fn(),
    updateUserPassword: jest.fn()
}));

jest.mock('../services/emailService', () => ({
    transporter: { sendMail: jest.fn() }
}));

const mockedDA = userDataAccess as jest.Mocked<typeof userDataAccess>;
const mockedSendMail = transporter.sendMail as jest.Mock;

describe('User Registration Domain Whitelist & Email Activation', () => {
    const originalOrigin = process.env.WEBAPP_ORIGIN;
    const originalDomains = process.env.ALLOWED_EMAIL_DOMAINS;
    const originalMailFrom = process.env.MAIL_FROM;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.ALLOWED_EMAIL_DOMAINS = 'example.edu,student.example.edu,institute.org';
        process.env.WEBAPP_ORIGIN = 'https://example.org';
        process.env.MAIL_FROM = 'no-reply@example.org';
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        if (originalOrigin === undefined) {
            delete process.env.WEBAPP_ORIGIN;
        } else {
            process.env.WEBAPP_ORIGIN = originalOrigin;
        }
        if (originalDomains === undefined) {
            delete process.env.ALLOWED_EMAIL_DOMAINS;
        } else {
            process.env.ALLOWED_EMAIL_DOMAINS = originalDomains;
        }
        if (originalMailFrom === undefined) {
            delete process.env.MAIL_FROM;
        } else {
            process.env.MAIL_FROM = originalMailFrom;
        }
    });

    it('generates 64-char hex activation tokens', () => {
        const t1 = generateActivationToken();
        const t2 = generateActivationToken();
        expect(t1).toMatch(/^[0-9a-f]{64}$/);
        expect(t1).not.toBe(t2);
    });

    it('rejects registration with disallowed email domain before DB insert or mail send', async () => {
        await expect(
            createUser(
                {
                    username: 'test_user',
                    email: 'user@gmail.com',
                    password: 'ExamplePass2026!'
                },
                'https://example.org'
            )
        ).rejects.toEqual(
            expect.objectContaining({
                error: expect.stringContaining('Rejestracja jest dostępna wyłącznie dla adresów e-mail w domenach')
            })
        );

        expect(mockedDA.insertUser).not.toHaveBeenCalled();
        expect(mockedSendMail).not.toHaveBeenCalled();
    });

    it('normalizes email, stores SHA-256 activation hash, and emails raw activation link', async () => {
        mockedDA.insertUser.mockResolvedValue({ user_id: '00000000-0000-4000-8000-000000000010' });
        mockedSendMail.mockResolvedValue({ messageId: 'msg-1' });

        const res = await createUser(
            {
                username: 'test_user',
                email: '  Test.User@STUDENT.EXAMPLE.EDU  ',
                password: 'ExamplePass2026!'
            },
            'https://example.org'
        );

        expect(res.error).toBeUndefined();
        expect(res.requires_activation).toBe(true);
        expect(res.user_id).toBe('00000000-0000-4000-8000-000000000010');

        expect(mockedDA.insertUser).toHaveBeenCalledTimes(1);
        const [username, normalizedEmail, password, storedHash, expiryHours] = mockedDA.insertUser.mock.calls[0];
        expect(username).toBe('test_user');
        expect(normalizedEmail).toBe('test.user@student.example.edu');
        expect(password).toBe('ExamplePass2026!');
        expect(storedHash).toMatch(/^[0-9a-f]{64}$/);
        expect(expiryHours).toBe(ACTIVATION_TOKEN_EXPIRY_HOURS);

        expect(mockedSendMail).toHaveBeenCalledTimes(1);
        const mailOptions = mockedSendMail.mock.calls[0][0];
        expect(mailOptions.to).toBe('test.user@student.example.edu');
        expect(mailOptions.from).toBe('no-reply@example.org');
        const match = (mailOptions.text as string).match(/\/api\/users\/activate\?token=([0-9a-f]{64})/);
        expect(match).not.toBeNull();
        const rawTokenInEmail = match![1];
        expect(rawTokenInEmail).not.toBe(storedHash);
        expect(hashTokenSha256(rawTokenInEmail)).toBe(storedHash);
    });

    it('rolls back unactivated user when SMTP sending fails', async () => {
        mockedDA.insertUser.mockResolvedValue({ user_id: '00000000-0000-4000-8000-000000000011' });
        mockedSendMail.mockRejectedValue(new Error('SMTP connection refused'));
        mockedDA.deleteUnactivatedUserById.mockResolvedValue(undefined);

        const res = await createUser(
            {
                username: 'test_user',
                email: 'user@example.edu',
                password: 'ExamplePass2026!'
            },
            'https://example.org'
        );

        expect(res.user_id).toBeUndefined();
        expect(res.error).toContain('Nie udało się wysłać wiadomości aktywacyjnej');
        expect(mockedDA.deleteUnactivatedUserById).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000011');
    });

    it('hashes raw activation token and activates user', async () => {
        const rawToken = 'b'.repeat(64);
        mockedDA.activateUserByToken.mockResolvedValue('00000000-0000-4000-8000-000000000012');

        const res = await activateUser(`  ${rawToken}  `);

        expect(mockedDA.activateUserByToken).toHaveBeenCalledWith(hashTokenSha256(rawToken));
        expect(res).toEqual({ success: true, user_id: '00000000-0000-4000-8000-000000000012' });
    });

    it('rejects empty or unknown activation token', async () => {
        expect(await activateUser('')).toEqual({ error: INVALID_ACTIVATION_TOKEN_ERROR });
        expect(mockedDA.activateUserByToken).not.toHaveBeenCalled();

        mockedDA.activateUserByToken.mockResolvedValue(undefined);
        expect(await activateUser('c'.repeat(64))).toEqual({ error: INVALID_ACTIVATION_TOKEN_ERROR });
    });

    const flushAsync = () => new Promise(resolve => setTimeout(resolve, 0));

    it('userController.createUser rejects missing or mismatched email confirmation', async () => {
        const reqMissing: any = {
            session: {},
            body: { username: 'test_user', password: 'ExamplePass2026!' }
        };
        const resMissing: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        userController.createUser(reqMissing, resMissing, jest.fn());
        await flushAsync();
        expect(resMissing.status).toHaveBeenCalledWith(400);
        expect(resMissing.send).toHaveBeenCalledWith({ error: 'Adres e-mail jest wymagany.' });

        const reqMismatch: any = {
            session: {},
            body: {
                username: 'test_user',
                email: 'user1@institute.org',
                confirm_email: 'user2@institute.org',
                password: 'ExamplePass2026!'
            }
        };
        const resMismatch: any = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        userController.createUser(reqMismatch, resMismatch, jest.fn());
        await flushAsync();
        expect(resMismatch.status).toHaveBeenCalledWith(400);
        expect(resMismatch.send).toHaveBeenCalledWith({ error: 'Podane adresy e-mail nie są identyczne.' });
    });

    it('userController.createUser requires email confirmation and does not create session when activation is required', async () => {
        mockedDA.insertUser.mockResolvedValue({ user_id: '00000000-0000-4000-8000-000000000013' });
        mockedSendMail.mockResolvedValue({ messageId: 'msg-2' });

        const req: any = {
            session: {},
            body: {
                username: 'test_user',
                email: 'User@institute.org',
                confirm_email: 'user@institute.org ',
                password: 'ExamplePass2026!'
            }
        };
        const res: any = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        userController.createUser(req, res, jest.fn());
        await flushAsync();

        expect(req.session.user_id).toBeUndefined();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                requires_activation: true
            })
        );
    });

    it('userController.activateUser redirects browser requests and returns JSON for API clients', async () => {
        const rawToken = 'd'.repeat(64);
        mockedDA.activateUserByToken.mockResolvedValueOnce('00000000-0000-4000-8000-000000000014');

        const browserReq: any = {
            query: { token: rawToken },
            accepts: jest.fn().mockReturnValue('html')
        };
        const browserRes: any = {
            redirect: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        userController.activateUser(browserReq, browserRes, jest.fn());
        await flushAsync();
        expect(browserRes.redirect).toHaveBeenCalledWith('/login.html?activated=1');

        mockedDA.activateUserByToken.mockResolvedValueOnce(undefined);
        const jsonReq: any = {
            query: { token: 'invalid', format: 'json' },
            accepts: jest.fn().mockReturnValue('json')
        };
        const jsonRes: any = {
            redirect: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        userController.activateUser(jsonReq, jsonRes, jest.fn());
        await flushAsync();
        expect(jsonRes.status).toHaveBeenCalledWith(400);
        expect(jsonRes.send).toHaveBeenCalledWith({ error: INVALID_ACTIVATION_TOKEN_ERROR });
    });
});
