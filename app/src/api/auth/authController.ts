import express from 'express';
import asyncController from '../common/asyncController';
import { authUser, getNewUserAPIKey, logout } from '../users/services/userService';

const login = asyncController(async (req: express.Request, res: express.Response) => {
    try {
        const username = req.body?.username;
        const password = req.body?.password;
        const user = await authUser(username, password);
        if (user.user_id) {
            req.session.user_id = user.user_id;
        } else {
            req.session.user_id = undefined;
        }
        res.send(user);
    } catch (error) {
        console.error('Error in login controller:', error?.code || 'UNKNOWN', error?.message || 'Unexpected error');
        res.status(500).send({ error: 'Authentication service error.' });
    }
});

const logoutUser = asyncController(async (req: express.Request, res: express.Response) => {
    try {
        await logout(req.session);
        res.send({ success: true });
    } catch (err) {
        console.error(err);
        res.send({ error: 'Failed to end session' });
    }
});

const generateApiKey = asyncController(async (req: express.Request, res: express.Response) => {
    if (!req.session.user_id) {
        return res.send({ error: 'Must be logged in' });
    }
    try {
        const apiKey = await getNewUserAPIKey(req.session.user_id);
        res.send(apiKey);
    } catch (error) {
        res.send(error);
    }
});

export default {
    login,
    logout: logoutUser,
    generateApiKey
};
