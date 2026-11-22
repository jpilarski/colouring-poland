import nodemailer from 'nodemailer';
import url, { URL } from 'url';

import { generatePasswordResetToken, hashTokenSha256 } from '../../common/tokens';
import { validatePassword } from '../../common/validation';
import { TokenVerificationError } from '../../errors';
import { transporter } from './emailService';
import * as userService from './userService';
import {
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
    linkUrl.search = `?token=${token}`;
    const linkString = url.format(linkUrl);

    const messageBody = `Hi there,

    Someone has requested a password reset for the Colouring ${config.cityName} account associated with this email address.
    Click on the following link within the next 24 hours to reset your password:

    ${linkString}
    `;

    return {
        text: messageBody,
        subject: `Reset your Colouring ${config.cityName} password`,
        to: email,
        from: 'no-reply@colouring.london'
    };
}

export {
    sendPasswordResetToken,
    resetPassword,
    cleanupExpiredPasswordResetTokens,
    TokenVerificationError
};
