import nodemailer from 'nodemailer';
import url, { URL } from 'url';

import { validatePassword } from '../../common/validation';
import { TokenVerificationError } from '../../errors';
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
    const message = getPasswordResetEmail(email, token, siteOrigin);
    await transporter.sendMail(message);
}

async function resetPassword(passwordResetToken: string, newPassword: string): Promise<void> {
    validatePassword(newPassword);
    const userId = await consumePasswordResetToken(passwordResetToken);
    if (userId != undefined) {
        await updateUserPassword(userId, newPassword);
        //TODO: expire other tokens of the user?
    } else {
        throw new TokenVerificationError('Password reset token could not be verified');
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
