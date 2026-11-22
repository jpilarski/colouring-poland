import express from 'express';
import asyncController from '../common/asyncController';
import { setNoStoreHeaders } from '../common/securityHeadersConfig';
import {
    createSessionCookieClearOptions,
    isProductionEnvironment,
    SESSION_COOKIE_NAME
} from '../common/sessionConfig';
import { authUser, getNewUserAPIKey, logout } from '../users/services/userService';

const login = asyncController(async (req: express.Request, res: express.Response) => {
    setNoStoreHeaders(res);
    try {
        const username = req.body?.username;
        const password = req.body?.password;
        const user = await authUser(username, password);
        if (user.user_id) {
            req.session.user_id = user.user_id;
            return res.status(200).send({ user_id: user.user_id });
        }
        req.session.user_id = undefined;
        if (user.retryAfterSeconds) {
            res.setHeader('Retry-After', String(user.retryAfterSeconds));
        }
        return res.status(user.statusCode ?? 401).send({ error: user.error });
    } catch (error: any) {
        console.error('Error in login controller:', error?.code || 'UNKNOWN', error?.message || 'Unexpected error');
        res.status(500).send({ error: 'Authentication service error.' });
    }
});

const logoutUser = asyncController(async (req: express.Request, res: express.Response) => {
    setNoStoreHeaders(res);
    try {
        await logout(req.session);
        res.clearCookie(
            SESSION_COOKIE_NAME,
            createSessionCookieClearOptions(isProductionEnvironment(req.app?.get('env')))
        );
        res.send({ success: true });
    } catch (err: any) {
        console.error('Error in logout controller:', err?.code || 'UNKNOWN', err?.message || 'Unexpected error');
        res.status(500).send({ error: 'Failed to end session' });
    }
});

const generateApiKey = asyncController(async (req: express.Request, res: express.Response) => {
    setNoStoreHeaders(res);
    if (!req.session.user_id) {
        return res.status(401).send({ error: 'Must be logged in' });
    }
    try {
        const apiKey = await getNewUserAPIKey(req.session.user_id);
        if (apiKey.error) {
            return res.status(500).send({ error: apiKey.error });
        }
        res.status(200).send(apiKey);
    } catch (error: any) {
        console.error('Error in generateApiKey controller:', error?.code || 'UNKNOWN', error?.message || 'Unexpected error');
        res.status(500).send({ error: 'Failed to generate API key.' });
    }
});

export default {
    login,
    logout: logoutUser,
    generateApiKey
};
