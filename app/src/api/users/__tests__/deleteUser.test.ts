import db from '../../../db';
import { revokeAllUserSessions, softDeleteUserById } from '../../dataAccess/user';
import * as userService from '../services/userService';
import userController from '../userController';

jest.mock('../../../db', () => ({
    __esModule: true,
    default: {
        result: jest.fn(),
        tx: jest.fn(),
        none: jest.fn(),
        one: jest.fn(),
        oneOrNone: jest.fn()
    }
}));

const mockedDb = db as unknown as {
    result: jest.Mock;
    tx: jest.Mock;
};

describe('User Soft-Delete & Session Revocation', () => {
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

    describe('revokeAllUserSessions (dataAccess)', () => {
        it('deletes all sessions matching sess->>user_id and returns rowCount', async () => {
            mockedDb.result.mockResolvedValue({ rowCount: 3 });

            const removed = await revokeAllUserSessions('00000000-0000-4000-8000-000000000001');

            expect(removed).toBe(3);
            expect(mockedDb.result).toHaveBeenCalledWith(
                expect.stringContaining("DELETE FROM user_sessions"),
                ['00000000-0000-4000-8000-000000000001']
            );
            expect(mockedDb.result.mock.calls[0][0]).toContain("sess->>'user_id' = $1::text");
        });
    });

    describe('softDeleteUserById (dataAccess)', () => {
        it('anonymizes account, revokes sessions, and cleans reset tokens inside a single transaction', async () => {
            const txTask = {
                oneOrNone: jest.fn().mockResolvedValue({ user_id: '00000000-0000-4000-8000-000000000001' }),
                result: jest.fn().mockResolvedValue({ rowCount: 2 }),
                none: jest.fn().mockResolvedValue(undefined)
            };
            mockedDb.tx.mockImplementation(async (cb: (t: any) => Promise<any>) => cb(txTask));

            const res = await softDeleteUserById('00000000-0000-4000-8000-000000000001');

            expect(res).toEqual({ success: true });
            expect(mockedDb.tx).toHaveBeenCalledTimes(1);

            const updateSql: string = txTask.oneOrNone.mock.calls[0][0];
            expect(updateSql).toContain('email = null');
            expect(updateSql).toContain('pass = null');
            expect(updateSql).toContain('api_key = null');
            expect(updateSql).toContain('is_active = false');
            expect(updateSql).toContain('activation_token = null');
            expect(updateSql).toContain('activation_expires_on = null');
            expect(updateSql).toContain('failed_login_attempts = 0');
            expect(updateSql).toContain('lockout_until = null');
            expect(updateSql).toContain('is_deleted = true');
            expect(updateSql).toContain('AND NOT is_deleted');

            expect(txTask.result).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM user_sessions'),
                ['00000000-0000-4000-8000-000000000001']
            );
            expect(txTask.none).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM user_password_reset_tokens'),
                ['00000000-0000-4000-8000-000000000001']
            );
        });

        it('returns error when user does not exist or is already deleted', async () => {
            const txTask = {
                oneOrNone: jest.fn().mockResolvedValue(null),
                result: jest.fn().mockResolvedValue({ rowCount: 0 }),
                none: jest.fn().mockResolvedValue(undefined)
            };
            mockedDb.tx.mockImplementation(async (cb: (t: any) => Promise<any>) => cb(txTask));

            const res = await softDeleteUserById('00000000-0000-4000-8000-000000000099');

            expect(res).toEqual({ error: 'User not found or already deleted' });
        });

        it('catches database errors without leaking raw error details', async () => {
            mockedDb.tx.mockRejectedValue({ code: '23514', message: 'check violation' });

            const res = await softDeleteUserById('00000000-0000-4000-8000-000000000001');

            expect(res).toEqual({ error: 'Database error' });
        });
    });

    describe('deleteCurrentUser (userController)', () => {
        function createMockRes() {
            const res: any = {
                statusCode: 200,
                body: undefined,
                headers: {} as Record<string, string>,
                setHeader: jest.fn((name: string, value: string) => {
                    res.headers[name.toLowerCase()] = value;
                }),
                clearCookie: jest.fn()
            };
            res.status = jest.fn((code: number) => {
                res.statusCode = code;
                return res;
            });
            res.send = jest.fn((payload: any) => {
                res.body = payload;
                return res;
            });
            return res;
        }

        const flushAsync = () => new Promise(resolve => setTimeout(resolve, 0));

        it('returns HTTP 401 Must be logged in when session has no user_id', async () => {
            const req: any = { session: {} };
            const res = createMockRes();
            const next = jest.fn();

            userController.deleteCurrentUser(req, res, next);
            await flushAsync();

            expect(res.statusCode).toBe(401);
            expect(res.headers['cache-control']).toBe('no-store');
            expect(res.body).toEqual({ error: 'Must be logged in' });
        });

        it('deletes user and destroys session on success', async () => {
            const deleteSpy = jest.spyOn(userService, 'deleteUser').mockResolvedValue({ success: true });
            const logoutSpy = jest.spyOn(userService, 'logout').mockResolvedValue(undefined);

            const req: any = { session: { user_id: '00000000-0000-4000-8000-000000000001' } };
            const res = createMockRes();
            const next = jest.fn();

            userController.deleteCurrentUser(req, res, next);
            await flushAsync();

            expect(deleteSpy).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000001');
            expect(logoutSpy).toHaveBeenCalledWith(req.session);
            expect(res.clearCookie).toHaveBeenCalledWith('cp.session', {
                path: '/',
                httpOnly: true,
                secure: false,
                sameSite: 'lax'
            });
            expect(res.statusCode).toBe(200);
            expect(res.headers['cache-control']).toBe('no-store');
            expect(res.body).toEqual({ success: true });

            deleteSpy.mockRestore();
            logoutSpy.mockRestore();
        });

        it('returns HTTP 404 and clears stale session when user is not found or already deleted', async () => {
            const deleteSpy = jest.spyOn(userService, 'deleteUser').mockResolvedValue({ error: 'User not found or already deleted' });
            const logoutSpy = jest.spyOn(userService, 'logout').mockResolvedValue(undefined);

            const req: any = { session: { user_id: '00000000-0000-4000-8000-000000000099' } };
            const res = createMockRes();
            const next = jest.fn();

            userController.deleteCurrentUser(req, res, next);
            await flushAsync();

            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual({ error: 'User not found or already deleted' });
            expect(logoutSpy).toHaveBeenCalledWith(req.session);
            expect(res.clearCookie).toHaveBeenCalled();

            deleteSpy.mockRestore();
            logoutSpy.mockRestore();
        });

        it('returns HTTP 500 and skips logout when deleteUser returns a database error', async () => {
            const deleteSpy = jest.spyOn(userService, 'deleteUser').mockResolvedValue({ error: 'Database error' });
            const logoutSpy = jest.spyOn(userService, 'logout').mockResolvedValue(undefined);

            const req: any = { session: { user_id: '00000000-0000-4000-8000-000000000001' } };
            const res = createMockRes();
            const next = jest.fn();

            userController.deleteCurrentUser(req, res, next);
            await flushAsync();

            expect(res.statusCode).toBe(500);
            expect(res.body).toEqual({ error: 'Database error' });
            expect(logoutSpy).not.toHaveBeenCalled();

            deleteSpy.mockRestore();
            logoutSpy.mockRestore();
        });
    });
});
