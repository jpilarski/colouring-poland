import express from 'express';

import asyncController from '../common/asyncController';
import { normalizeEmail } from '../common/validation';
import { TokenVerificationError, ValidationError } from '../errors';
import * as passwordResetService from './services/passwordResetService';
import * as userService from './services/userService';

const createUser = asyncController(async (req: express.Request, res: express.Response) => {
    const user = req.body;
    if (req.session.user_id) {
        return res.status(400).send({ error: 'Already signed in' });
    }

    if (typeof user?.email !== 'string' || user.email.trim().length === 0) {
        return res.status(400).send({ error: 'Adres e-mail jest wymagany.' });
    }

    if (
        typeof user?.confirm_email !== 'string' ||
        normalizeEmail(user.email) !== normalizeEmail(user.confirm_email)
    ) {
        return res.status(400).send({ error: 'Podane adresy e-mail nie są identyczne.' });
    }

    try {
        const origin = getWebAppOrigin();
        const result = await userService.createUser(user, origin);
        if (result.error) {
            req.session.user_id = undefined;
            return res.status(400).send({ error: result.error });
        }
        if (result.requires_activation) {
            req.session.user_id = undefined;
            return res.status(201).send({
                success: true,
                requires_activation: true,
                message: result.message
            });
        }
        if (result.user_id) {
            req.session.user_id = result.user_id;
            return res.status(201).send({ user_id: result.user_id });
        }
        req.session.user_id = undefined;
        return res.status(400).send({ error: 'Failed to create user account.' });
    } catch (err: any) {
        if (err && typeof err === 'object' && typeof err.error === 'string') {
            return res.status(400).send({ error: err.error });
        }
        console.error('Error in createUser:', err?.code || 'UNKNOWN', err?.message || 'Unexpected error');
        return res.status(500).send({ error: 'Failed to create user account.' });
    }
});

const activateUser = asyncController(async (req: express.Request, res: express.Response) => {
    const rawToken = typeof req.query.token === 'string' ? req.query.token : '';
    const result = await userService.activateUser(rawToken);
    const wantsJson = req.query.format === 'json' || req.accepts(['html', 'json']) === 'json';

    if (result.success) {
        if (wantsJson) {
            return res.status(200).send({ success: true });
        }
        return res.redirect('/login.html?activated=1');
    }

    if (wantsJson) {
        return res.status(400).send({ error: result.error });
    }
    return res.redirect('/login.html?activation_error=1');
});

const getCurrentUser = asyncController(async (req: express.Request, res: express.Response) => {
    if (!req.session.user_id) {
        return res.send({ error: 'Must be logged in' });
    }

    try {
        const user = await userService.getUserById(req.session.user_id);
        res.send(user);
    } catch (error) {
        res.send(error);
    }
});

const deleteCurrentUser = asyncController(async (req: express.Request, res: express.Response) => {
    if (!req.session.user_id) {
        return res.send({ error: 'Must be logged in' });
    }
    const userId = req.session.user_id;
    console.log(`Deleting user ${userId}`);

    try {
        const result = await userService.deleteUser(userId);
        if (result.error) {
            return res.status(500).send({ error: result.error });
        }

        await userService.logout(req.session);
        res.send({ success: true });
    } catch (err: any) {
        console.error('Error in deleteCurrentUser:', err?.code || 'UNKNOWN', err?.message || 'Unexpected error');
        res.status(500).send({ error: 'Failed to delete user account.' });
    }
});

const resetPassword = asyncController(async function (req: express.Request, res: express.Response) {
    if (req.body == undefined || (req.body.email == undefined && req.body.token == undefined)) {
        return res.send({ error: 'Expected an email address or password reset token in the request body' });
    }

    if (req.body.email != undefined) {
        // first stage: send reset token to email address

        const origin = getWebAppOrigin();
        await passwordResetService.sendPasswordResetToken(req.body.email, origin);

        return res.status(202).send({ success: true });
    } else if (req.body.token != undefined) {
        // second stage: verify token and reset password
        if (req.body.password == undefined) {
            return res.send({ error: 'Expected a new password' });
        }
        try {
            await passwordResetService.resetPassword(req.body.token, req.body.password);
        } catch (err) {
            if (err instanceof TokenVerificationError) {
                return res.send({ error: 'Could not verify token' });
            } else if (err instanceof ValidationError) {
                return res.send({ error: err.message });
            }

            throw err;
        }

        return res.send({ success: true });
    }
});

function getWebAppOrigin(): string {
    const origin = process.env.WEBAPP_ORIGIN;
    if (origin == undefined) {
        throw new Error('WEBAPP_ORIGIN not defined');
    }
    return origin;
}

export default {
    createUser,
    activateUser,
    getCurrentUser,
    deleteCurrentUser,
    resetPassword
};
