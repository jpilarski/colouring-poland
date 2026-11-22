import nodemailer from 'nodemailer';
import url, { URL } from 'url';
import { promisify } from 'util';
import { Session, SessionData } from 'express-session';
import {
    insertUser,
    activateUserByToken,
    deleteUnactivatedUserById,
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
import { generateActivationToken, generateApiKey, hashTokenSha256 } from '../../common/tokens';
import { validateEmail, validatePassword, validateUsername, ValidationError } from '../../common/validation';
import { ccConfig as config } from '../../../config';
import { transporter } from './emailService';

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const ACCOUNT_LOCKOUT_MINUTES = 15;
const ACTIVATION_TOKEN_EXPIRY_HOURS = 48;
const INVALID_CREDENTIALS_ERROR = 'Niepoprawny login lub hasło.';
const ACCOUNT_NOT_ACTIVATED_ERROR = 'Konto nie zostało jeszcze aktywowane. Sprawdź swoją skrzynkę e-mail.';
const INVALID_ACTIVATION_TOKEN_ERROR = 'Link aktywacyjny jest nieprawidłowy lub wygasł.';
const ACTIVATION_EMAIL_SENT_MESSAGE =
    'Konto zostało utworzone. Wysłaliśmy link aktywacyjny na podany adres e-mail (ważny 48 godzin).';

export interface CreateUserResult {
    user_id?: string;
    requires_activation?: boolean;
    message?: string;
    error?: string;
}

function getActivationEmail(email: string, rawToken: string, siteOrigin: string): nodemailer.SendMailOptions {
    const linkUrl = new URL(siteOrigin);
    linkUrl.pathname = '/api/users/activate';
    linkUrl.search = `?token=${encodeURIComponent(rawToken)}`;
    const linkString = url.format(linkUrl);

    const fromAddress = process.env.MAIL_FROM?.trim();
    if (!fromAddress || fromAddress === 'tbd') {
        throw new Error('MAIL_FROM is not configured');
    }

    const messageBody = `Witaj,

Dziękujemy za rejestrację w platformie Colouring ${config.cityName}.
Aby aktywować swoje konto, kliknij poniższy link w ciągu 48 godzin:

${linkString}

Jeśli to nie Ty zakładałeś/aś to konto, zignoruj tę wiadomość.
`;

    return {
        text: messageBody,
        subject: `Aktywacja konta – Colouring ${config.cityName}`,
        to: email,
        from: fromAddress
    };
}

async function createUser(user: any, siteOrigin: string): Promise<CreateUserResult> {
    let normalizedEmail: string;
    try {
        validateUsername(user.username);
        normalizedEmail = validateEmail(user.email);
        validatePassword(user.password);
    } catch (err) {
        if (err instanceof ValidationError) throw { error: err.message };
        throw err;
    }

    const rawActivationToken = generateActivationToken();
    const activationTokenHash = hashTokenSha256(rawActivationToken);

    const inserted = await insertUser(
        user.username,
        normalizedEmail,
        user.password,
        activationTokenHash,
        ACTIVATION_TOKEN_EXPIRY_HOURS
    );

    if (inserted.error || !inserted.user_id) {
        return { error: inserted.error || 'Database error' };
    }

    try {
        await transporter.sendMail(getActivationEmail(normalizedEmail, rawActivationToken, siteOrigin));
    } catch (err: any) {
        console.error('Error sending activation email:', err?.code || 'UNKNOWN', err?.message || 'Unexpected error');
        await deleteUnactivatedUserById(inserted.user_id).catch(cleanupErr => {
            console.error(
                'Error rolling back unactivated user:',
                cleanupErr?.code || 'UNKNOWN',
                cleanupErr?.message || 'Unexpected error'
            );
        });
        return { error: 'Nie udało się wysłać wiadomości aktywacyjnej. Spróbuj ponownie później.' };
    }

    return {
        user_id: inserted.user_id,
        requires_activation: true,
        message: ACTIVATION_EMAIL_SENT_MESSAGE
    };
}

async function activateUser(rawToken: string): Promise<{ success?: boolean; user_id?: string; error?: string }> {
    if (typeof rawToken !== 'string' || rawToken.trim().length === 0) {
        return { error: INVALID_ACTIVATION_TOKEN_ERROR };
    }

    const tokenHash = hashTokenSha256(rawToken.trim());
    const userId = await activateUserByToken(tokenHash);
    if (!userId) {
        return { error: INVALID_ACTIVATION_TOKEN_ERROR };
    }

    return { success: true, user_id: userId };
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
            await revokeAllUserSessions(user.user_id);
            return {
                error: `Przekroczono limit ${MAX_FAILED_LOGIN_ATTEMPTS} nieudanych prób logowania. Konto zostało zablokowane na ${ACCOUNT_LOCKOUT_MINUTES} minut.`
            };
        }
        return { error: INVALID_CREDENTIALS_ERROR };
    }
    if (!user.is_active) {
        return { error: ACCOUNT_NOT_ACTIVATED_ERROR };
    }
    if (user.is_blocked) {
        await revokeAllUserSessions(user.user_id);
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
    ACTIVATION_TOKEN_EXPIRY_HOURS,
    INVALID_CREDENTIALS_ERROR,
    ACCOUNT_NOT_ACTIVATED_ERROR,
    INVALID_ACTIVATION_TOKEN_ERROR,
    ACTIVATION_EMAIL_SENT_MESSAGE,
    getUserById,
    getUserByEmail,
    createUser,
    activateUser,
    authUser,
    getNewUserAPIKey,
    authAPIUser,
    revokeUserSessions,
    deleteUser,
    logout
};
