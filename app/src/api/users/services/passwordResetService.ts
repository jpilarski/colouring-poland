import nodemailer from 'nodemailer';
import url, { URL } from 'url';

import { generatePasswordResetToken, hashTokenSha256 } from '../../common/tokens';
import { validatePassword } from '../../common/validation';
import { TokenVerificationError } from '../../errors';
import { transporter } from './emailService';
import * as userService from './userService';
import {
    invalidateUserPasswordResetTokens,
    insertPasswordResetToken,
    consumePasswordResetToken,
    purgeExpiredPasswordResetTokens,
    revokeAllUserSessions,
    updateUserPassword
} from '../../dataAccess/user';
import { ccConfig as config } from '../../../config';

async function sendPasswordResetToken(email: string, siteOrigin: string): Promise<void> {
    await purgeExpiredPasswordResetTokens().catch(err => {
        console.error('Error purging expired reset tokens:', err?.code || 'UNKNOWN', err?.message || 'Unexpected error');
    });

    const user = await userService.getUserByEmail(email);
    if (user == undefined) return;

    await invalidateUserPasswordResetTokens(user.user_id);

    const rawToken = generatePasswordResetToken();
    await insertPasswordResetToken(user.user_id, hashTokenSha256(rawToken));
    await transporter.sendMail(getPasswordResetEmail(email, rawToken, siteOrigin));
}

async function resetPassword(passwordResetToken: string, newPassword: string): Promise<string> {
    validatePassword(newPassword);
    if (typeof passwordResetToken !== 'string' || passwordResetToken.trim().length === 0) {
        throw new TokenVerificationError('Password reset token could not be verified');
    }

    const userId = await consumePasswordResetToken(hashTokenSha256(passwordResetToken.trim()));
    if (userId != undefined) {
        await updateUserPassword(userId, newPassword);
        await revokeAllUserSessions(userId);
        await purgeExpiredPasswordResetTokens().catch(err => {
            console.error('Error purging expired reset tokens:', err?.code || 'UNKNOWN', err?.message || 'Unexpected error');
        });
        return userId;
    } else {
        throw new TokenVerificationError('Password reset token could not be verified');
    }
}

async function cleanupExpiredPasswordResetTokens(retentionDays: number = 7): Promise<number> {
    return purgeExpiredPasswordResetTokens(retentionDays);
}

function getPasswordResetEmail(email: string, token: string, siteOrigin: string): nodemailer.SendMailOptions {
    const linkUrl = new URL(siteOrigin);
    linkUrl.pathname = '/password-reset.html';
    linkUrl.search = `?token=${encodeURIComponent(token)}`;
    const linkString = url.format(linkUrl);

    const fromAddress = process.env.MAIL_FROM?.trim();
    if (!fromAddress || fromAddress === 'tbd') {
        throw new Error('MAIL_FROM is not configured');
    }

    const messageBody = `Witaj,

Otrzymaliśmy prośbę o zresetowanie hasła do konta Colouring ${config.cityName} powiązanego z tym adresem e-mail.
Aby ustawić nowe hasło, kliknij poniższy link w ciągu 24 godzin:

${linkString}

Jeśli to nie Ty wysłałeś/aś tę prośbę, zignoruj tę wiadomość.
`;

    return {
        text: messageBody,
        subject: `Reset hasła – Colouring ${config.cityName}`,
        to: email,
        from: fromAddress
    };
}

export {
    sendPasswordResetToken,
    resetPassword,
    cleanupExpiredPasswordResetTokens,
    TokenVerificationError
};
