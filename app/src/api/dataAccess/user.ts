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
    api_key: string;
}

export interface UserEmailRow {
    user_id: string;
    username: string;
    email: string;
}

/**
 * Rejestruje nowego użytkownika z hashowaniem hasła przez crypt(pass, gen_salt('bf', 10))
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
                crypt($3, gen_salt('bf', 10))
            ) RETURNING user_id`,
            [username, email, pass]
        );
    } catch (error) {
        console.error('Error in insertUser:', error?.code || 'UNKNOWN', error?.message || 'Unexpected error');
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
 * Pobiera dane autoryzacyjne aktywnego (nieusuniętego) użytkownika wraz ze stanem blokad
 */
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
        WHERE
            username = $1
            AND NOT is_deleted`,
        [username, password]
    );
    return row ?? undefined;
}

/**
 * Wykonuje fikcyjną weryfikację Blowfish w PostgreSQL w celu wyrównania czasu odpowiedzi
 * (ochrona przed atakami czasowymi / user enumeration).
 */
export async function verifyDummyPassword(password: string): Promise<void> {
    await db.one(
        `SELECT crypt($1, $2) AS dummy_hash`,
        [password, DUMMY_BCRYPT_HASH]
    );
}

/**
 * Atomowo inkrementuje licznik nieudanych prób logowania (resetując go do 1, jeśli poprzednia blokada już wygasła).
 * Po osiągnięciu limitu maxAttempts ustawia czasową blokadę lockout_until na lockoutMinutes minut.
 */
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

/**
 * Zeruje licznik nieudanych prób i tymczasową blokadę oraz zapisuje czas ostatniego logowania.
 */
export async function recordSuccessfulLogin(userId: string): Promise<void> {
    await db.none(
        `UPDATE users
        SET
            failed_login_attempts = 0,
            lockout_until = NULL,
            last_login_at = now()
        WHERE user_id = $1::uuid`,
        [userId]
    );
}

/**
 * Pobiera publiczny profil aktywnego (nieusuniętego) użytkownika na podstawie user_id
 */
export async function selectUserById(id: string): Promise<UserProfileRow | undefined> {
    try {
        return await db.one<UserProfileRow>(
            `SELECT
                username, email, date_trunc('minute', registered) as registered, api_key
            FROM
                users
            WHERE
                user_id = $1
                AND NOT is_deleted`,
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
                email = $1
                AND NOT is_deleted`,
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
                AND NOT is_deleted
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
                api_key = $1
                AND NOT is_deleted`,
            [key]
        );
        return user_id;
    } catch (error) {
        console.error('Error in selectUserIdByAPIKey:', error);
        return undefined;
    }
}

/**
 * Natychmiast unieważnia wszystkie aktywne sesje użytkownika w tabeli user_sessions.
 * Wykorzystuje indeks funkcyjny user_sessions_user_id_idx ((sess->>'user_id')).
 */
export async function revokeAllUserSessions(userId: string, t?: ITask<any>): Promise<number> {
    const executor = t ?? db;
    const result = await executor.result(
        `DELETE FROM user_sessions
        WHERE sess->>'user_id' = $1::text`,
        [userId]
    );
    return result.rowCount;
}

/**
 * Transakcyjna procedura soft-delete z natychmiastową anonimizacją konta:
 * - zeruje dane osobowe, hasło, klucz API, token aktywacyjny i liczniki blokad
 * - zachowuje spójność z więzami integralności tabeli users (bez kasowania historii edycji)
 * - natychmiast usuwa wszystkie aktywne sesje użytkownika oraz oczekujące tokeny resetu hasła
 */
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
                WHERE user_id = $1::uuid
                  AND NOT is_deleted
                RETURNING user_id`,
                [id]
            );

            await revokeAllUserSessions(id, t);
            await t.none(
                `DELETE FROM user_password_reset_tokens
                WHERE user_id = $1::uuid`,
                [id]
            );

            return row;
        });

        if (deletedRow == null) {
            return { error: 'User not found or already deleted' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error in softDeleteUserById:', error?.code || 'UNKNOWN', error?.message || 'Unexpected error');
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
 * Aktualizuje hasło użytkownika z soleniem i szyfrowaniem Blowfish (koszt 10)
 */
export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
    await db.none(
        `UPDATE
            users
        SET
            pass = crypt($1, gen_salt('bf', 10))
        WHERE
            user_id = $2::uuid`,
        [newPassword, userId]
    );
}
