import {
    authUser,
    MAX_FAILED_LOGIN_ATTEMPTS,
    ACCOUNT_LOCKOUT_MINUTES,
    INVALID_CREDENTIALS_ERROR,
    ACCOUNT_NOT_ACTIVATED_ERROR
} from '../services/userService';
import * as userDataAccess from '../../dataAccess/user';

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

const mockedUserDA = userDataAccess as jest.Mocked<typeof userDataAccess>;

describe('User Authentication & Brute-Force Protection (authUser)', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('rejects empty or non-string credentials without hitting the database', async () => {
        expect(await authUser('', 'ExamplePass2026!')).toEqual({ error: INVALID_CREDENTIALS_ERROR, statusCode: 401 });
        expect(await authUser('test_user', '')).toEqual({ error: INVALID_CREDENTIALS_ERROR, statusCode: 401 });
        expect(await authUser(undefined as any, 'ExamplePass2026!')).toEqual({ error: INVALID_CREDENTIALS_ERROR, statusCode: 401 });

        expect(mockedUserDA.selectUserAuthData).not.toHaveBeenCalled();
        expect(mockedUserDA.verifyDummyPassword).not.toHaveBeenCalled();
    });

    it('runs dummy password verification and returns uniform 401 error when user does not exist', async () => {
        mockedUserDA.selectUserAuthData.mockResolvedValue(undefined);
        mockedUserDA.verifyDummyPassword.mockResolvedValue(undefined);

        const result = await authUser('nonexistent_user', 'WrongPass123!');

        expect(mockedUserDA.verifyDummyPassword).toHaveBeenCalledWith('WrongPass123!');
        expect(result).toEqual({ error: INVALID_CREDENTIALS_ERROR, statusCode: 401 });
        expect(mockedUserDA.recordFailedLoginAttempt).not.toHaveBeenCalled();
        expect(mockedUserDA.recordSuccessfulLogin).not.toHaveBeenCalled();
    });

    it('increments failed attempts and returns uniform 401 error on failed attempts 1..4', async () => {
        mockedUserDA.selectUserAuthData.mockResolvedValue({
            user_id: '00000000-0000-4000-8000-000000000001',
            auth_ok: false,
            is_active: true,
            is_blocked: false,
            failed_login_attempts: 2,
            lockout_until: null
        });
        mockedUserDA.recordFailedLoginAttempt.mockResolvedValue({
            failed_login_attempts: 3,
            lockout_until: null
        });

        const result = await authUser('test_user', 'WrongPass123!');

        expect(mockedUserDA.recordFailedLoginAttempt).toHaveBeenCalledWith(
            '00000000-0000-4000-8000-000000000001',
            MAX_FAILED_LOGIN_ATTEMPTS,
            ACCOUNT_LOCKOUT_MINUTES
        );
        expect(result).toEqual({ error: INVALID_CREDENTIALS_ERROR, statusCode: 401 });
        expect(mockedUserDA.recordSuccessfulLogin).not.toHaveBeenCalled();
        expect(mockedUserDA.revokeAllUserSessions).not.toHaveBeenCalled();
    });

    it('locks account for 15 minutes with 429 and retryAfterSeconds on the 5th consecutive failed attempt', async () => {
        const lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
        mockedUserDA.selectUserAuthData.mockResolvedValue({
            user_id: '00000000-0000-4000-8000-000000000001',
            auth_ok: false,
            is_active: true,
            is_blocked: false,
            failed_login_attempts: 4,
            lockout_until: null
        });
        mockedUserDA.recordFailedLoginAttempt.mockResolvedValue({
            failed_login_attempts: 5,
            lockout_until: lockoutUntil
        });
        mockedUserDA.revokeAllUserSessions.mockResolvedValue(2);

        const result = await authUser('test_user', 'WrongPass123!');

        expect(mockedUserDA.recordFailedLoginAttempt).toHaveBeenCalledWith(
            '00000000-0000-4000-8000-000000000001',
            5,
            15
        );
        expect(mockedUserDA.revokeAllUserSessions).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000001');
        expect(result.user_id).toBeUndefined();
        expect(result.statusCode).toBe(429);
        expect(result.retryAfterSeconds).toBe(15 * 60);
        expect(result.error).toContain('Przekroczono limit 5 nieudanych prób logowania');
        expect(result.error).toContain('15 minut');
    });

    it('blocks login during active temporary lockout with 429 and retryAfterSeconds even if password is valid', async () => {
        const activeLockout = new Date(Date.now() + 10 * 60 * 1000);
        mockedUserDA.selectUserAuthData.mockResolvedValue({
            user_id: '00000000-0000-4000-8000-000000000001',
            auth_ok: true,
            is_active: true,
            is_blocked: false,
            failed_login_attempts: 5,
            lockout_until: activeLockout
        });

        const result = await authUser('test_user', 'ExamplePass2026!');

        expect(result.user_id).toBeUndefined();
        expect(result.statusCode).toBe(429);
        expect(result.retryAfterSeconds).toBeGreaterThanOrEqual(590);
        expect(result.retryAfterSeconds).toBeLessThanOrEqual(600);
        expect(result.error).toContain('Konto zostało tymczasowo zablokowane');
        expect(mockedUserDA.recordSuccessfulLogin).not.toHaveBeenCalled();
        expect(mockedUserDA.recordFailedLoginAttempt).not.toHaveBeenCalled();
    });

    it('allows login and resets attempts after lockout expires', async () => {
        const expiredLockout = new Date(Date.now() - 60 * 1000);
        mockedUserDA.selectUserAuthData.mockResolvedValue({
            user_id: '00000000-0000-4000-8000-000000000001',
            auth_ok: true,
            is_active: true,
            is_blocked: false,
            failed_login_attempts: 5,
            lockout_until: expiredLockout
        });
        mockedUserDA.recordSuccessfulLogin.mockResolvedValue(undefined);

        const result = await authUser('test_user', 'ExamplePass2026!');

        expect(mockedUserDA.recordSuccessfulLogin).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000001');
        expect(result).toEqual({ user_id: '00000000-0000-4000-8000-000000000001' });
    });

    it('blocks login for unactivated account with 403 only after password verification succeeds', async () => {
        mockedUserDA.selectUserAuthData.mockResolvedValue({
            user_id: '00000000-0000-4000-8000-000000000003',
            auth_ok: true,
            is_active: false,
            is_blocked: false,
            failed_login_attempts: 0,
            lockout_until: null
        });

        const result = await authUser('test_user', 'ExamplePass2026!');

        expect(result).toEqual({ error: ACCOUNT_NOT_ACTIVATED_ERROR, statusCode: 403 });
        expect(mockedUserDA.recordSuccessfulLogin).not.toHaveBeenCalled();
    });

    it('returns uniform 401 credentials error when unactivated account receives wrong password', async () => {
        mockedUserDA.selectUserAuthData.mockResolvedValue({
            user_id: '00000000-0000-4000-8000-000000000003',
            auth_ok: false,
            is_active: false,
            is_blocked: false,
            failed_login_attempts: 0,
            lockout_until: null
        });
        mockedUserDA.recordFailedLoginAttempt.mockResolvedValue({
            failed_login_attempts: 1,
            lockout_until: null
        });

        const result = await authUser('test_user', 'WrongPass123!');

        expect(result).toEqual({ error: INVALID_CREDENTIALS_ERROR, statusCode: 401 });
    });

    it('blocks administratively blocked account with 403 after valid password without resetting attempts', async () => {
        mockedUserDA.selectUserAuthData.mockResolvedValue({
            user_id: '00000000-0000-4000-8000-000000000001',
            auth_ok: true,
            is_active: true,
            is_blocked: true,
            blocked_reason: 'Policy violation',
            failed_login_attempts: 0,
            lockout_until: null
        });

        mockedUserDA.revokeAllUserSessions.mockResolvedValue(1);

        const result = await authUser('test_user', 'ExamplePass2026!');

        expect(mockedUserDA.revokeAllUserSessions).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000001');
        expect(result.user_id).toBeUndefined();
        expect(result.statusCode).toBe(403);
        expect(result.error).toBe('Account temporarily blocked. Reason: Policy violation');
        expect(mockedUserDA.recordSuccessfulLogin).not.toHaveBeenCalled();
    });

    it('authenticates valid user and resets login attempt counters', async () => {
        mockedUserDA.selectUserAuthData.mockResolvedValue({
            user_id: '00000000-0000-4000-8000-000000000002',
            auth_ok: true,
            is_active: true,
            is_blocked: false,
            failed_login_attempts: 2,
            lockout_until: null
        });
        mockedUserDA.recordSuccessfulLogin.mockResolvedValue(undefined);

        const result = await authUser('test_user', 'ExamplePass2026!');

        expect(mockedUserDA.recordSuccessfulLogin).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000002');
        expect(result).toEqual({ user_id: '00000000-0000-4000-8000-000000000002' });
    });
});
