import { generateApiKey, generatePasswordResetToken, hashTokenSha256 } from '../../common/tokens';
import * as userDataAccess from '../../dataAccess/user';
import { transporter } from '../services/emailService';
import { authAPIUser, getNewUserAPIKey } from '../services/userService';
import {
    cleanupExpiredPasswordResetTokens,
    resetPassword,
    sendPasswordResetToken,
    TokenVerificationError
} from '../services/passwordResetService';

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

describe('SHA-256 Hashing for API Keys and Password Reset Tokens', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('generates prefixed API keys, 64-char reset tokens, and deterministic SHA-256 digests', () => {
        const k1 = generateApiKey();
        const k2 = generateApiKey();
        expect(k1).toMatch(/^cp_[0-9a-f]{48}$/);
        expect(k1).not.toBe(k2);

        const hash = hashTokenSha256(k1);
        expect(hash).toMatch(/^[0-9a-f]{64}$/);
        expect(hash).toBe(hashTokenSha256(k1));
        expect(hash).not.toBe(k1);

        const t1 = generatePasswordResetToken();
        const t2 = generatePasswordResetToken();
        expect(t1).toMatch(/^[0-9a-f]{64}$/);
        expect(t1).not.toBe(t2);
    });

    it('stores only SHA-256 hash in DB and returns raw API key once', async () => {
        mockedDA.updateUserAPIKey.mockResolvedValue({ success: true });

        const res = await getNewUserAPIKey('00000000-0000-4000-8000-000000000001');

        expect(res.error).toBeUndefined();
        expect(res.api_key).toMatch(/^cp_[0-9a-f]{48}$/);

        const storedHash = mockedDA.updateUserAPIKey.mock.calls[0][1];
        expect(storedHash).toBe(hashTokenSha256(res.api_key as string));
        expect(storedHash).not.toBe(res.api_key);
    });

    it('propagates DB error without returning raw API key', async () => {
        mockedDA.updateUserAPIKey.mockResolvedValue({ error: 'Failed to generate new API key.' });
        expect(await getNewUserAPIKey('00000000-0000-4000-8000-000000000001')).toEqual({
            error: 'Failed to generate new API key.'
        });
    });

    it('hashes incoming raw API key before DB lookup and rejects blank values', async () => {
        mockedDA.selectUserIdByAPIKey.mockResolvedValue('00000000-0000-4000-8000-000000000001');

        const rawKey = 'cp_0123456789abcdef0123456789abcdef0123456789abcdef';
        expect(await authAPIUser(rawKey)).toBe('00000000-0000-4000-8000-000000000001');
        expect(mockedDA.selectUserIdByAPIKey).toHaveBeenCalledWith(hashTokenSha256(rawKey));

        expect(await authAPIUser('')).toBeUndefined();
        expect(await authAPIUser('   ')).toBeUndefined();
    });

    it('stores SHA-256 hash in DB, emails raw reset token, and purges expired tokens', async () => {
        mockedDA.purgeExpiredPasswordResetTokens.mockResolvedValue(2);
        mockedDA.selectUserByEmail.mockResolvedValue({
            user_id: '00000000-0000-4000-8000-000000000001',
            username: 'test_user',
            email: 'user@example.com'
        });
        mockedDA.insertPasswordResetToken.mockResolvedValue(undefined);
        mockedSendMail.mockResolvedValue(undefined);

        await sendPasswordResetToken('user@example.com', 'https://example.org');

        expect(mockedDA.purgeExpiredPasswordResetTokens).toHaveBeenCalledTimes(1);
        const [savedUserId, savedTokenHash] = mockedDA.insertPasswordResetToken.mock.calls[0];
        expect(savedUserId).toBe('00000000-0000-4000-8000-000000000001');
        expect(savedTokenHash).toMatch(/^[0-9a-f]{64}$/);

        const mailText: string = mockedSendMail.mock.calls[0][0].text;
        const tokenMatch = mailText.match(/\?token=([0-9a-f]{64})/);
        expect(tokenMatch).not.toBeNull();
        expect(tokenMatch![1]).not.toBe(savedTokenHash);
        expect(hashTokenSha256(tokenMatch![1])).toBe(savedTokenHash);
    });

    it('hashes provided reset token before consuming, updates password, and revokes all user sessions', async () => {
        const rawToken = generatePasswordResetToken();
        mockedDA.consumePasswordResetToken.mockResolvedValue('00000000-0000-4000-8000-000000000001');
        mockedDA.updateUserPassword.mockResolvedValue(undefined);
        mockedDA.revokeAllUserSessions.mockResolvedValue(3);
        mockedDA.purgeExpiredPasswordResetTokens.mockResolvedValue(1);

        const resetUserId = await resetPassword(rawToken, 'ExamplePass2026!');

        expect(resetUserId).toBe('00000000-0000-4000-8000-000000000001');
        expect(mockedDA.consumePasswordResetToken).toHaveBeenCalledWith(hashTokenSha256(rawToken));
        expect(mockedDA.updateUserPassword).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000001', 'ExamplePass2026!');
        expect(mockedDA.revokeAllUserSessions).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000001');
        expect(mockedDA.purgeExpiredPasswordResetTokens).toHaveBeenCalledTimes(1);
    });

    it('throws TokenVerificationError for empty or unknown reset token without revoking sessions', async () => {
        await expect(resetPassword('', 'ExamplePass2026!')).rejects.toThrow(TokenVerificationError);
        mockedDA.consumePasswordResetToken.mockResolvedValue(undefined);
        await expect(resetPassword('invalid_token', 'ExamplePass2026!')).rejects.toThrow(TokenVerificationError);
        expect(mockedDA.revokeAllUserSessions).not.toHaveBeenCalled();
    });

    it('delegates token cleanup to purgeExpiredPasswordResetTokens', async () => {
        mockedDA.purgeExpiredPasswordResetTokens.mockResolvedValue(5);
        expect(await cleanupExpiredPasswordResetTokens(7)).toBe(5);
        expect(mockedDA.purgeExpiredPasswordResetTokens).toHaveBeenCalledWith(7);
    });
});
