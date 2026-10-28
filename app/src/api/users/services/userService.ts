/**
 * User domain service
 * - obsługa uwierzytelniania, rejestracji i zarządzania tożsamością
 * - logika blokad i walidacji
 * - delegacja zapytań SQL do warstwy dataAccess/user
 */
import { promisify } from 'util';
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
            return { error: err.message };
        }
        return { error: 'Invalid registration parameters' };
    }

    try {
        const result = await insertUser(user.username, user.email, user.password);
        return { user_id: result.user_id };
    } catch (error) {
        if (error.code === '23505') {
            return { error: 'User already exists' };
        }
        return { error: 'Failed to create user' };
    }
}

async function authUser(username: string, passwordAttempt: string): Promise<any> {
    const user = await selectUserAuthData(username);

    if (!user) {
        return { error: 'Username or password incorrect' };
    }

    if (user.is_blocked) {
        return {
            error: 'Account has been blocked',
            blocked_reason: user.blocked_reason,
            blocked_on: user.blocked_on
        };
    }

    const argon2 = require('argon2');
    const authOk = await argon2.verify(user.password_hash, passwordAttempt);

    if (authOk) {
        return {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            is_admin: user.is_admin
        };
    } else {
        return { error: 'Username or password incorrect' };
    }
}

async function getUserById(id: string): Promise<UserProfileRow> {
    return selectUserById(id);
}

async function getUserByEmail(email: string): Promise<UserEmailRow> {
    return selectUserByEmail(email);
}

async function getNewUserAPIKey(id: string): Promise<{ api_key: string }> {
    const crypto = require('crypto');
    const newKey = crypto.randomBytes(16).toString('hex');
    await updateUserAPIKey(id, newKey);
    return { api_key: newKey };
}

async function authAPIUser(key: string): Promise<string | undefined> {
    return selectUserIdByAPIKey(key);
}

async function deleteUser(id: string): Promise<{ success?: boolean; error?: string }> {
    return softDeleteUserById(id);
}

function logout(session: Express.Session): Promise<void> {
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
