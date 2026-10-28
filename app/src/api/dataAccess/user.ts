import { errors } from 'pg-promise';
import db from '../../db';

export interface UserAuthRow {
    user_id: string;
    auth_ok: boolean;
    is_blocked: boolean;
    blocked_on?: Date;
    blocked_reason?: string;
}

export interface UserProfileRow {
    username: string;
    email: string;
    registered: string;
    api_key: string;
}

export interface UserEmailRow {
    user_id: string;
    username: string;
    email: string;
}

/**
 * Rejestruje nowego użytkownika z hashowaniem hasła przez crypt(pass, gen_salt('bf'))
 */
export async function insertUser(
    username: string,
    email: string | null,
    pass: string
): Promise<{ user_id?: string; error?: string }> {
    try {
        return await db.one<{ user_id: string }>(
            `INSERT
            INTO users (
                user_id,
                username,
                email,
                pass
            ) VALUES (
                gen_random_uuid(),
                $1,
                $2,
                crypt($3, gen_salt('bf'))
            ) RETURNING user_id`,
            [username, email, pass]
        );
    } catch (error) {
        console.error('Error in insertUser:', error);
        if (error?.detail?.includes('already exists')) {
            if (error.detail.includes('username')) {
                return { error: 'Username already registered' };
            } else if (error.detail.includes('email')) {
                return { error: 'Email already registered' };
            }
        }
        return { error: 'Database error' };
    }
}

/**
 * Pobiera dane autoryzacyjne użytkownika (weryfikacja hasła przez crypt i status blokady)
 */
export async function selectUserAuthData(username: string, password: string): Promise<UserAuthRow | undefined> {
    return await db.oneOrNone<UserAuthRow>(
        `SELECT
            user_id,
            (
                pass = crypt($2, pass)
            ) AS auth_ok,
            is_blocked,
            blocked_on,
            blocked_reason
        FROM users
        WHERE
            username = $1`,
        [username, password]
    );
}

/**
 * Pobiera publiczny profil użytkownika na podstawie user_id
 */
export async function selectUserById(id: string): Promise<UserProfileRow | undefined> {
    try {
        return await db.one<UserProfileRow>(
            `SELECT
                username, email, date_trunc('minute', registered) as registered, api_key
            FROM
                users
            WHERE
                user_id = $1`,
            [id]
        );
    } catch (error) {
        console.error('Error in selectUserById:', error);
        return undefined;
    }
}

/**
 * Pobiera podstawowe dane konta na podstawie adresu e-mail (dla procedury resetu hasła)
 */
export async function selectUserByEmail(email: string): Promise<UserEmailRow | undefined> {
    try {
        return await db.one<UserEmailRow>(
            `SELECT
                user_id, username, email
            FROM
                users
            WHERE
                email = $1`,
            [email]
        );
    } catch (error) {
        console.error('Error in selectUserByEmail:', error);
        return undefined;
    }
}

/**
 * Generuje i zapisuje nowy losowy klucz API dla użytkownika
 */
export async function updateUserAPIKey(id: string): Promise<{ api_key?: string; error?: string }> {
    try {
        return await db.one<{ api_key: string }>(
            `UPDATE
                users
            SET
                api_key = gen_random_uuid()
            WHERE
                user_id = $1
            RETURNING
                api_key`,
            [id]
        );
    } catch (error) {
        console.error('Error in updateUserAPIKey:', error);
        return { error: 'Failed to generate new API key.' };
    }
}

/**
 * Weryfikuje klucz API i zwraca identyfikator użytkownika
 */
export async function selectUserIdByAPIKey(key: string): Promise<string | undefined> {
    try {
        const { user_id } = await db.one<{ user_id: string }>(
            `SELECT
                user_id
            FROM
                users
            WHERE
                api_key = $1`,
            [key]
        );
        return user_id;
    } catch (error) {
        console.error('Error in selectUserIdByAPIKey:', error);
        return undefined;
    }
}

/**
 * Procedura soft-delete z natychmiastową anonimizacją danych RODO (email=null, pass=null, api_key=null, username=deleted_uuid)
 */
export async function softDeleteUserById(id: string): Promise<{ success?: boolean; error?: string }> {
    try {
        await db.none(
            `UPDATE users
            SET
                email = null,
                pass = null,
                api_key = null,
                username = concat('deleted_', cast(user_id as char(13))),
                is_deleted = true,
                deleted_on = now() at time zone 'utc'
            WHERE user_id = $1`,
            [id]
        );
        return { success: true };
    } catch (error) {
        console.error('Error in softDeleteUserById:', error);
        return { error: 'Database error' };
    }
}

/**
 * Tworzy jednorazowy token resetu hasła ważny przez 24 godziny
 */
export async function insertPasswordResetToken(userId: string): Promise<string> {
    const { token } = await db.one<{ token: string }>(
        `INSERT INTO
            user_password_reset_tokens (user_id, expires_on)
        VALUES
            ($1::uuid, now() at time zone 'utc' + INTERVAL '$2 day')
        RETURNING
            token`,
        [userId, 1]
    );
    return token;
}

/**
 * Weryfikuje i unieważnia token resetu hasła (jednorazowe użycie)
 */
export async function consumePasswordResetToken(token: string): Promise<string | undefined> {
    try {
        const usedToken = await db.one<{ user_id: string }>(
            `UPDATE
                user_password_reset_tokens
            SET used = true
            WHERE
                token = $1::uuid
                AND NOT used
                AND now() at time zone 'utc' < expires_on
            RETURNING user_id`,
            [token]
        );
        return usedToken.user_id;
    } catch (err) {
        if (err instanceof errors.QueryResultError) {
            if (err.code === errors.queryResultErrorCode.noData) {
                return undefined;
            }
        }
        throw err;
    }
}

/**
 * Aktualizuje hasło użytkownika z soleniem i szyfrowaniem Blowfish
 */
export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
    await db.none(
        `UPDATE
            users
        SET
            pass = crypt($1, gen_salt('bf'))
        WHERE
            user_id = $2::uuid`,
        [newPassword, userId]
    );
}

