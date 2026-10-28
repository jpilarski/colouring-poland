import nodemailer from 'nodemailer';
import url, { URL } from 'url';

import { validatePassword } from '../../common/validation';
import { transporter } from './emailService';
import * as userService from './userService';
import {
    insertPasswordResetToken,
    consumePasswordResetToken,
    updateUserPassword
} from '../../dataAccess/user';

import { CCConfig } from '../../../cc-config';
let config: CCConfig = require('../../../cc-config.json');

/**
 * Generate a password reset token for the specified account and send the password reset link by email
 * @param email the email address for which to generate a password reset token
 * @param siteOrigin the origin of the website, without a path element - e.g. https://beta.colouring.london
 */
async function sendPasswordResetToken(email: string, siteOrigin: string): Promise<void> {
    const user = await userService.getUserByEmail(email);

    // if no user found for email, do nothing
    if (user == undefined) return;

    const token = await insertPasswordResetToken(user.user_id);

    const emailOptions = getPasswordResetEmail(email, token, siteOrigin);

    await transporter.sendMail(emailOptions);
}

/**
 * Reset password of user associated with password reset token
 * @param token password reset token
 * @param newPassword new password to set
 */
async function resetPassword(token: string, newPassword: string): Promise<void> {
    validatePassword(newPassword);

    const result = await consumePasswordResetToken(token);

    if (result == undefined) {
        throw new TokenVerificationError('Invalid or expired password reset token');
    }

    await updateUserPassword(result.user_id, newPassword);
}

class TokenVerificationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TokenVerificationError';
    }
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
    TokenVerificationError
};
