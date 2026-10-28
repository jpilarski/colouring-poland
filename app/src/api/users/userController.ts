import express from 'express';

import asyncController from '../common/asyncController';
import * as passwordResetService from './services/passwordResetService';
import { TokenVerificationError } from './services/passwordResetService';
import * as userService from './services/userService';
import { ValidationError } from '../common/validation';

const createUser = asyncController(async (req: express.Request, res: express.Response) => {
    const user = req.body;
    if (req.session.user_id) {
        return res.send({ error: 'Already signed in' });
    }

    if (user.email) {
        if (user.email != user.confirm_email) {
            return res.send({ error: 'Email did not match confirmation.' });
        }
    } else {
        user.email = null;
    }

    try {
        const result = await userService.createUser(user);
        if (result.user_id) {
            req.session.user_id = result.user_id;
            res.send({ user_id: result.user_id });
        } else {
            req.session.user_id = undefined;
            res.send({ error: result.error });
        }
    } catch (error) {
        res.send(error);
    }
});

const getCurrentUser = asyncController(async (req: express.Request, res: express.Response) => {
    if (!req.session.user_id) {
        return res.send({});
    }

    try {
        const result = await userService.getUserById(req.session.user_id);
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

const deleteCurrentUser = asyncController(async (req: express.Request, res: express.Response) => {
    if (!req.session.user_id) {
        return res.send({ error: 'Not logged in' });
    }

    try {
        const result = await userService.deleteUser(req.session.user_id);
        if (result.success) {
            req.session.destroy(err => {
                if (err) console.error(err);
            });
            res.send({ success: true });
        } else {
            res.send({ error: result.error || 'Failed to delete user' });
        }
    } catch (error) {
        res.send(error);
    }
});

const resetPassword = asyncController(async (req: express.Request, res: express.Response) => {
    const token = req.body.token;
    const email = req.body.email;
    const password = req.body.password;

    if (token && password) {
        try {
            await passwordResetService.resetPassword(token, password);
            res.status(200).send({ success: true });
        } catch (error) {
            if (error instanceof ValidationError) {
                res.status(400).send({ error: error.message });
            } else if (error instanceof TokenVerificationError) {
                res.status(400).send({ error: error.message });
            } else {
                res.status(500).send({ error: 'Password reset failed' });
            }
        }
    } else if (email) {
        const origin = req.get('origin');
        try {
            await passwordResetService.sendPasswordResetToken(email, origin);
            res.status(200).send({ success: true });
        } catch (error) {
            res.status(500).send({ error: 'Failed to send password reset token' });
        }
    } else {
        res.status(400).send({ error: 'Must provide either token and password, or email' });
    }
});

export default {
    createUser,
    getCurrentUser,
    deleteCurrentUser,
    resetPassword
};
