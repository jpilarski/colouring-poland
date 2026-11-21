import session from 'express-session';

export const SESSION_COOKIE_NAME = 'cp.session';
export const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours
export const SESSION_PRUNE_INTERVAL_SECONDS = 60 * 15; // 15 minutes

export function getSessionSecret(): string {
    const secret = process.env.APP_COOKIE_SECRET?.trim();
    if (!secret || secret === 'tbd') {
        throw new Error('APP_COOKIE_SECRET is not set');
    }
    return secret;
}

export function createSessionOptions(
    store: session.Store,
    isProduction: boolean
): session.SessionOptions {
    return {
        name: SESSION_COOKIE_NAME,
        store,
        secret: getSessionSecret(),
        saveUninitialized: false,
        resave: false,
        rolling: true,
        cookie: {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: SESSION_MAX_AGE_MS
        }
    };
}
