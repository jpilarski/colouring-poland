/**
 * User domain service
 * - obsługa uwierzytelniania, rejestracji i zarządzania tożsamością
 * - logika blokad i walidacji
 * - delegacja zapytań SQL do warstwy dataAccess/user
 */
import { promisify } from 'util';
import { Session, SessionData } from 'express-session';
import {
    insertUser,
    selectUserAuthData,
    selectUserById,
    selectUserByEmail,
    updateUserAPIKey,
    selectUserIdByAPIKey,
    softDeleteUserById,
    UserProfileRow,
    UserEmailRow
} from '../../dataAccess/user';
import { validatePassword, validateUsername, ValidationError } from '../../common/validation';

async function createUser(user: any): Promise<{ user_id?: string; error?: string }> {
    try {
        validateUsername(user.username);
        validatePassword(user.password);
    } catch (err) {
        if (err instanceof ValidationError) {
            throw { error: err.message };
        } else {
            throw err;
        }
    }

    return await insertUser(user.username, user.email, user.password);
}

async function authUser(username: string, password: string): Promise<{ user_id?: string; error?: string }> {
    const user = await selectUserAuthData(username, password);

    if (user == undefined) {
        return { error: 'The username does not exist in the system' };
    } else if (user.auth_ok) {
        if (user.is_blocked) {
            return {
                error: `Account temporarily blocked.${user.blocked_reason == undefined ? '' : ' Reason: ' + user.blocked_reason}`
            };
        }
        return { user_id: user.user_id };
    } else {
        console.error(`Authentication failed for user ${username}`);
        return { error: 'Username / password pair not recognised' };
    }
}

async function getUserById(id: string): Promise<UserProfileRow | undefined> {
    return selectUserById(id);
}

async function getUserByEmail(email: string): Promise<UserEmailRow | undefined> {
    return selectUserByEmail(email);
}

async function getNewUserAPIKey(id: string): Promise<{ api_key?: string; error?: string }> {
    return updateUserAPIKey(id);
}

async function authAPIUser(key: string): Promise<string | undefined> {
    return selectUserIdByAPIKey(key);
}

async function deleteUser(id: string): Promise<{ success?: boolean; error?: string }> {
    return softDeleteUserById(id);
}

function logout(session: Session & Partial<SessionData>): Promise<void> {
    session.user_id = undefined;
    return promisify(session.destroy.bind(session))();
}

export {
    getUserById,
    getUserByEmail,
    createUser,
    authUser,
    getNewUserAPIKey,
    authAPIUser,
    deleteUser,
    logout
};
