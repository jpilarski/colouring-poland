import authController from '../authController';
import userController from '../../users/userController';
import * as userService from '../../users/services/userService';
import * as passwordResetService from '../../users/services/passwordResetService';
import { SESSION_COOKIE_NAME } from '../../common/sessionConfig';

jest.mock('../../users/services/userService', () => ({
    authUser: jest.fn(),
    getNewUserAPIKey: jest.fn(),
    logout: jest.fn(),
    deleteUser: jest.fn(),
    createUser: jest.fn(),
    activateUser: jest.fn(),
    getUserById: jest.fn()
}));

jest.mock('../../users/services/passwordResetService', () => ({
    sendPasswordResetToken: jest.fn(),
    resetPassword: jest.fn()
}));

const mockedUserService = userService as jest.Mocked<typeof userService>;
const mockedPasswordResetService = passwordResetService as jest.Mocked<typeof passwordResetService>;

const flushAsync = () => new Promise(resolve => setTimeout(resolve, 0));

function createMockRes() {
    const res: any = {
        statusCode: 200,
        body: undefined,
        setHeader: jest.fn(),
        clearCookie: jest.fn(),
        status: jest.fn(),
        send: jest.fn()
    };
    res.status.mockImplementation((code: number) => {
        res.statusCode = code;
        return res;
    });
    res.send.mockImplementation((payload: any) => {
        res.body = payload;
        return res;
    });
    return res;
}

describe('Session Lifecycle & Cookie Clearing Controllers', () => {
    let consoleErrorSpy: jest.SpyInstance;
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });

    it('destroys session and clears cp.session cookie on logout (development)', async () => {
        mockedUserService.logout.mockResolvedValue(undefined);
        const req: any = {
            session: { user_id: '00000000-0000-4000-8000-000000000001' },
            app: { get: jest.fn().mockReturnValue('development') }
        };
        const res = createMockRes();
        const next = jest.fn();

        authController.logout(req, res, next);
        await flushAsync();

        expect(mockedUserService.logout).toHaveBeenCalledWith(req.session);
        expect(res.clearCookie).toHaveBeenCalledWith(SESSION_COOKIE_NAME, {
            path: '/',
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });
        expect(res.body).toEqual({ success: true });
        expect(next).not.toHaveBeenCalled();
    });

    it('clears cp.session cookie with secure: true in production on logout', async () => {
        mockedUserService.logout.mockResolvedValue(undefined);
        const req: any = {
            session: { user_id: '00000000-0000-4000-8000-000000000001' },
            app: { get: jest.fn().mockReturnValue('production') }
        };
        const res = createMockRes();

        authController.logout(req, res, jest.fn());
        await flushAsync();

        expect(res.clearCookie).toHaveBeenCalledWith(SESSION_COOKIE_NAME, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'lax'
        });
        expect(res.body).toEqual({ success: true });
    });

    it('returns HTTP 500 and does not clear cookie when session destroy fails', async () => {
        mockedUserService.logout.mockRejectedValue(new Error('Store failure'));
        const req: any = {
            session: { user_id: '00000000-0000-4000-8000-000000000001' },
            app: { get: jest.fn().mockReturnValue('development') }
        };
        const res = createMockRes();

        authController.logout(req, res, jest.fn());
        await flushAsync();

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.clearCookie).not.toHaveBeenCalled();
        expect(res.body).toEqual({ error: 'Failed to end session' });
    });

    it('clears cp.session cookie after deleting current user account', async () => {
        mockedUserService.deleteUser.mockResolvedValue({ success: true });
        mockedUserService.logout.mockResolvedValue(undefined);
        const req: any = {
            session: { user_id: '00000000-0000-4000-8000-000000000001' },
            app: { get: jest.fn().mockReturnValue('production') }
        };
        const res = createMockRes();

        userController.deleteCurrentUser(req, res, jest.fn());
        await flushAsync();

        expect(mockedUserService.deleteUser).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000001');
        expect(mockedUserService.logout).toHaveBeenCalledWith(req.session);
        expect(res.clearCookie).toHaveBeenCalledWith(SESSION_COOKIE_NAME, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'lax'
        });
        expect(res.body).toEqual({ success: true });
    });

    it('clears current session and cookie when password reset targets the signed-in user', async () => {
        mockedPasswordResetService.resetPassword.mockResolvedValue('00000000-0000-4000-8000-000000000001');
        mockedUserService.logout.mockResolvedValue(undefined);
        const req: any = {
            body: { token: 'valid_token', password: 'ExamplePass2026!' },
            session: { user_id: '00000000-0000-4000-8000-000000000001' },
            app: { get: jest.fn().mockReturnValue('development') }
        };
        const res = createMockRes();

        userController.resetPassword(req, res, jest.fn());
        await flushAsync();

        expect(mockedUserService.logout).toHaveBeenCalledWith(req.session);
        expect(res.clearCookie).toHaveBeenCalledWith(SESSION_COOKIE_NAME, {
            path: '/',
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });
        expect(res.body).toEqual({ success: true });
    });

    it('leaves another signed-in user session untouched when resetting a different user password', async () => {
        mockedPasswordResetService.resetPassword.mockResolvedValue('00000000-0000-4000-8000-000000000099');
        const req: any = {
            body: { token: 'valid_token', password: 'ExamplePass2026!' },
            session: { user_id: '00000000-0000-4000-8000-000000000001' },
            app: { get: jest.fn().mockReturnValue('development') }
        };
        const res = createMockRes();

        userController.resetPassword(req, res, jest.fn());
        await flushAsync();

        expect(mockedUserService.logout).not.toHaveBeenCalled();
        expect(res.clearCookie).not.toHaveBeenCalled();
        expect(res.body).toEqual({ success: true });
    });

    it('responds immediately with HTTP 202 for password reset email request without awaiting SMTP', async () => {
        const originalOrigin = process.env.WEBAPP_ORIGIN;
        process.env.WEBAPP_ORIGIN = 'https://example.org';

        let rejectSend: ((err: Error) => void) | undefined;
        mockedPasswordResetService.sendPasswordResetToken.mockImplementation(
            () => new Promise<void>((_resolve, reject) => {
                rejectSend = reject;
            })
        );

        const req: any = {
            body: { email: 'user@example.org' },
            session: {},
            app: { get: jest.fn().mockReturnValue('development') }
        };
        const res = createMockRes();
        const next = jest.fn();

        try {
            userController.resetPassword(req, res, next);
            await flushAsync();

            expect(res.status).toHaveBeenCalledWith(202);
            expect(res.body).toEqual({ success: true });
            expect(mockedPasswordResetService.sendPasswordResetToken).toHaveBeenCalledWith(
                'user@example.org',
                'https://example.org'
            );
            expect(next).not.toHaveBeenCalled();

            // Simulate background SMTP failure after response was already sent
            rejectSend!(new Error('SMTP timeout'));
            await flushAsync();
            expect(consoleErrorSpy).toHaveBeenCalled();
        } finally {
            if (originalOrigin === undefined) {
                delete process.env.WEBAPP_ORIGIN;
            } else {
                process.env.WEBAPP_ORIGIN = originalOrigin;
            }
        }
    });
});
