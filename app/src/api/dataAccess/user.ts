import { errors, ITask } from 'pg-promise';
import db from '../../db';

// Static valid Blowfish hash (cost 10) used for constant-time dummy password verification
const DUMMY_BCRYPT_HASH = '$2a$10$lZQL0ZAZTGe2uT/VKO94GOTvDMPV.br1q1AnEM6FkHz6jPFIs5vd2';

export interface UserAuthRow {
    user_id: string;
    auth_ok: boolean;
    is_blocked: boolean;
    blocked_on?: Date;
    blocked_reason?: string;
    failed_login_attempts: number;
    lockout_until: Date | null;
}

export interface FailedLoginAttemptResult {
    failed_login_attempts: number;
    lockout_until: Date | null;
}

export interface UserProfileRow {
    username: string;
    email: string;
    registered: string;
    has_api_key: boolean;
}

export interface UserEmailRow {
    user_id: string;
    username: string;
    email: string;
}

export async function insertUser(
    username: string,
    email: string | null,
    pass: string
): Promise<{ user_id?: string; error?: string }> {
    try {
        return await db.one<{ user_id: string }>(
            `INSERT INTO users (user_id, username, email, pass)
            VALUES (gen_random_uuid(), $1, $2, crypt($3, gen_salt('bf', 10)))
            RETURNING user_id`,
            [username, email, pass]
        );
    } catch (error) {
        console.error('Error in insertUser:', error?.code || 'UNKNOWN', error?.message || 'Unexpected error');
        if (error?.detail?.includes('already exists')) {
            if (error.detail.includes('username')) return { error: 'Username already registered' };
            if (error.detail.includes('email')) return { error: 'Email already registered' };
        }
        return { error: 'Database error' };
    }
}

export async function selectUserAuthData(username: string, password: string): Promise<UserAuthRow | undefined> {
    const row = await db.oneOrNone<UserAuthRow>(
        `SELECT
            user_id,
            COALESCE(pass = crypt($2, pass), false) AS auth_ok,
            is_blocked,
            blocked_on,
            blocked_reason,
            failed_login_attempts,
            lockout_until
        FROM users
        WHERE username = $1 AND NOT is_deleted`,
        [username, password]
    );
    return row ?? undefined;
}

export async function verifyDummyPassword(password: string): Promise<void> {
    await db.one(`SELECT crypt($1, $2) AS dummy_hash`, [password, DUMMY_BCRYPT_HASH]);
}

export async function recordFailedLoginAttempt(
    userId: string,
    maxAttempts: number,
    lockoutMinutes: number
): Promise<FailedLoginAttemptResult> {
    return await db.one<FailedLoginAttemptResult>(
        `UPDATE users
        SET
            failed_login_attempts = CASE
                WHEN lockout_until IS NOT NULL AND lockout_until <= now() THEN 1
                ELSE failed_login_attempts + 1
            END,
            lockout_until = CASE
                WHEN (
                    CASE
                        WHEN lockout_until IS NOT NULL AND lockout_until <= now() THEN 1
                        ELSE failed_login_attempts + 1
                    END
                ) >= $2 THEN now() + make_interval(mins => $3)
                ELSE NULL
            END
        WHERE user_id = $1::uuid
        RETURNING failed_login_attempts, lockout_until`,
        [userId, maxAttempts, lockoutMinutes]
    );
}

export async function recordSuccessfulLogin(userId: string): Promise<void> {
    await db.none(
        `UPDATE users
        SET failed_login_attempts = 0, lockout_until = NULL, last_login_at = now()
        WHERE user_id = $1::uuid`,
        [userId]
    );
}

export async function selectUserById(id: string): Promise<UserProfileRow | undefined> {
    try {
        return await db.one<UserProfileRow>(
            `SELECT username, email, date_trunc('minute', registered) as registered, (api_key IS NOT NULL) as has_api_key
            FROM users
            WHERE user_id = $1 AND NOT is_deleted`,
            [id]
        );
    } catch (error) {
        console.error('Error in selectUserById:', error);
        return undefined;
    }
}

export async function selectUserByEmail(email: string): Promise<UserEmailRow | undefined> {
    try {
        return await db.one<UserEmailRow>(
            `SELECT user_id, username, email
            FROM users
            WHERE email = $1 AND NOT is_deleted`,
            [email]
        );
    } catch (error) {
        console.error('Error in selectUserByEmail:', error);
        return undefined;
    }
}

export async function updateUserAPIKey(id: string, apiKeyHash: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const updated = await db.oneOrNone<{ user_id: string }>(
            `UPDATE users
            SET api_key = $2
            WHERE user_id = $1::uuid AND NOT is_deleted
            RETURNING user_id`,
            [id, apiKeyHash]
        );
        return updated == null ? { error: 'Failed to generate new API key.' } : { success: true };
    } catch (error) {
        console.error('Error in updateUserAPIKey:', error?.code || 'UNKNOWN', error?.message || 'Unexpected error');
        return { error: 'Failed to generate new API key.' };
    }
}

export async function selectUserIdByAPIKey(apiKeyHash: string): Promise<string | undefined> {
    try {
        const row = await db.oneOrNone<{ user_id: string }>(
            `SELECT user_id FROM users WHERE api_key = $1 AND NOT is_deleted`,
            [apiKeyHash]
        );
        return row?.user_id;
    } catch (error) {
        console.error('Error in selectUserIdByAPIKey:', error?.code || 'UNKNOWN', error?.message || 'Unexpected error');
        return undefined;
    }
}

export async function revokeAllUserSessions(userId: string, t?: ITask<any>): Promise<number> {
    const executor = t ?? db;
    const result = await executor.result(
        `DELETE FROM user_sessions WHERE sess->>'user_id' = $1::text`,
        [userId]
    );
    return result.rowCount;
}

export async function softDeleteUserById(id: string): Promise<{ success?: boolean; error?: string }> {
    try {
        const deletedRow = await db.tx(async t => {
            const row = await t.oneOrNone<{ user_id: string }>(
                `UPDATE users
                SET
                    email = null,
                    pass = null,
                    api_key = null,
                    is_active = false,
                    activation_token = null,
                    activation_expires_on = null,
                    failed_login_attempts = 0,
                    lockout_until = null,
                    username = concat('deleted_', cast(user_id as char(13))),
                    is_deleted = true,
                    deleted_on = now()
                WHERE user_id = $1::uuid AND NOT is_deleted
                RETURNING user_id`,
                [id]
            );
            await revokeAllUserSessions(id, t);
            await t.none(`DELETE FROM user_password_reset_tokens WHERE user_id = $1::uuid`, [id]);
            return row;
        });
        return deletedRow == null ? { error: 'User not found or already deleted' } : { success: true };
    } catch (error) {
        console.error('Error in softDeleteUserById:', error?.code || 'UNKNOWN', error?.message || 'Unexpected error');
        return { error: 'Database error' };
    }
}

export async function insertPasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresInHours: number = 24
): Promise<void> {
    await db.none(
        `INSERT INTO user_password_reset_tokens (token, user_id, expires_on)
        VALUES ($2, $1::uuid, now() + make_interval(hours => $3))`,
        [userId, tokenHash, expiresInHours]
    );
}

export async function consumePasswordResetToken(tokenHash: string): Promise<string | undefined> {
    try {
        const usedToken = await db.one<{ user_id: string }>(
            `UPDATE user_password_reset_tokens
            SET used = true
            WHERE token = $1 AND NOT used AND now() < expires_on
            RETURNING user_id`,
            [tokenHash]
        );
        return usedToken.user_id;
    } catch (err) {
        if (err instanceof errors.QueryResultError && err.code === errors.queryResultErrorCode.noData) {
            return undefined;
        }
        throw err;
    }
}

export async function purgeExpiredPasswordResetTokens(retentionDays: number = 7): Promise<number> {
    const result = await db.result(
        `DELETE FROM user_password_reset_tokens
        WHERE used = true OR expires_on < now() - make_interval(days => $1)`,
        [retentionDays]
    );
    return result.rowCount;
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
    await db.none(
        `UPDATE users
        SET pass = crypt($1, gen_salt('bf', 10)), password_last_changed = now()
        WHERE user_id = $2::uuid`,
        [newPassword, userId]
    );
}
