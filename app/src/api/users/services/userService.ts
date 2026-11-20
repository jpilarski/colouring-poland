import { promisify } from 'util';
import { Session, SessionData } from 'express-session';
import {
    insertUser,
    selectUserAuthData,
    verifyDummyPassword,
    recordFailedLoginAttempt,
    recordSuccessfulLogin,
    selectUserById,
    selectUserByEmail,
    updateUserAPIKey,
    selectUserIdByAPIKey,
    revokeAllUserSessions,
    softDeleteUserById,
    UserProfileRow,
    UserEmailRow
} from '../../dataAccess/user';
import { generateApiKey, hashTokenSha256 } from '../../common/tokens';
import { validatePassword, validateUsername, ValidationError } from '../../common/validation';

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const ACCOUNT_LOCKOUT_MINUTES = 15;
const INVALID_CREDENTIALS_ERROR = 'Niepoprawny login lub hasło.';

async function createUser(user: any): Promise<{ user_id?: string; error?: string }> {
    try {
        validateUsername(user.username);
        validatePassword(user.password);
    } catch (err) {
        if (err instanceof ValidationError) throw { error: err.message };
        throw err;
    }
    return await insertUser(user.username, user.email, user.password);
}

async function authUser(username: string, password: string): Promise<{ user_id?: string; error?: string }> {
    if (typeof username !== 'string' || typeof password !== 'string' || username.length === 0 || password.length === 0) {
        return { error: INVALID_CREDENTIALS_ERROR };
    }
    const user = await selectUserAuthData(username, password);
    if (user == undefined) {
        await verifyDummyPassword(password);
        return { error: INVALID_CREDENTIALS_ERROR };
    }
    if (user.lockout_until != null) {
        const lockoutExpiresAt = new Date(user.lockout_until).getTime();
        const nowMs = Date.now();
        if (lockoutExpiresAt > nowMs) {
            const remainingMinutes = Math.max(1, Math.ceil((lockoutExpiresAt - nowMs) / 60000));
            return {
                error: `Konto zostało tymczasowo zablokowane z powodu zbyt wielu nieudanych prób logowania. Spróbuj ponownie za ${remainingMinutes} min.`
            };
        }
    }
    if (!user.auth_ok) {
        console.error(`Authentication failed for user ${username}`);
        const attemptState = await recordFailedLoginAttempt(user.user_id, MAX_FAILED_LOGIN_ATTEMPTS, ACCOUNT_LOCKOUT_MINUTES);
        if (attemptState.lockout_until != null && new Date(attemptState.lockout_until).getTime() > Date.now()) {
            return {
                error: `Przekroczono limit ${MAX_FAILED_LOGIN_ATTEMPTS} nieudanych prób logowania. Konto zostało zablokowane na ${ACCOUNT_LOCKOUT_MINUTES} minut.`
            };
        }
        return { error: INVALID_CREDENTIALS_ERROR };
    }
    if (user.is_blocked) {
        return { error: `Account temporarily blocked.${user.blocked_reason == undefined ? '' : ' Reason: ' + user.blocked_reason}` };
    }
    await recordSuccessfulLogin(user.user_id);
    return { user_id: user.user_id };
}

async function getUserById(id: string): Promise<UserProfileRow | undefined> {
    return selectUserById(id);
}

async function getUserByEmail(email: string): Promise<UserEmailRow | undefined> {
    return selectUserByEmail(email);
}

async function getNewUserAPIKey(id: string): Promise<{ api_key?: string; error?: string }> {
    const rawApiKey = generateApiKey();
    const apiKeyHash = hashTokenSha256(rawApiKey);
    const result = await updateUserAPIKey(id, apiKeyHash);
    if (result.error) return { error: result.error };
    return { api_key: rawApiKey };
}

async function authAPIUser(rawKey: string): Promise<string | undefined> {
    if (typeof rawKey !== 'string' || rawKey.trim().length === 0) return undefined;
    return selectUserIdByAPIKey(hashTokenSha256(rawKey.trim()));
}

async function revokeUserSessions(id: string): Promise<number> {
    return revokeAllUserSessions(id);
}

async function deleteUser(id: string): Promise<{ success?: boolean; error?: string }> {
    return softDeleteUserById(id);
}

function logout(session: Session & Partial<SessionData>): Promise<void> {
    session.user_id = undefined;
    return promisify(session.destroy.bind(session))();
}

export {
    MAX_FAILED_LOGIN_ATTEMPTS,
    ACCOUNT_LOCKOUT_MINUTES,
    INVALID_CREDENTIALS_ERROR,
    getUserById,
    getUserByEmail,
    createUser,
    authUser,
    getNewUserAPIKey,
    authAPIUser,
    revokeUserSessions,
    deleteUser,
    logout
};
