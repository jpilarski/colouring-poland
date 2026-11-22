import session from 'express-session';
import {
    createSessionCookieClearOptions,
    createSessionOptions,
    getSessionSecret,
    isProductionEnvironment,
    SESSION_COOKIE_NAME,
    SESSION_MAX_AGE_MS,
    SESSION_PRUNE_INTERVAL_SECONDS
} from '../sessionConfig';

describe('Session Configuration (cp.session)', () => {
    const originalSecret = process.env.APP_COOKIE_SECRET;

    afterEach(() => {
        if (originalSecret === undefined) {
            delete process.env.APP_COOKIE_SECRET;
        } else {
            process.env.APP_COOKIE_SECRET = originalSecret;
        }
    });

    it('exports expected cookie name, 12-hour TTL, and 15-minute prune interval', () => {
        expect(SESSION_COOKIE_NAME).toBe('cp.session');
        expect(SESSION_MAX_AGE_MS).toBe(12 * 60 * 60 * 1000);
        expect(SESSION_PRUNE_INTERVAL_SECONDS).toBe(900);
    });

    it('throws when APP_COOKIE_SECRET is missing, blank, or placeholder tbd', () => {
        delete process.env.APP_COOKIE_SECRET;
        expect(() => getSessionSecret()).toThrow('APP_COOKIE_SECRET is not set');

        process.env.APP_COOKIE_SECRET = '   ';
        expect(() => getSessionSecret()).toThrow('APP_COOKIE_SECRET is not set');

        process.env.APP_COOKIE_SECRET = 'tbd';
        expect(() => getSessionSecret()).toThrow('APP_COOKIE_SECRET is not set');
    });

    it('builds hardened SessionOptions for development (secure: false)', () => {
        process.env.APP_COOKIE_SECRET = 'test-session-secret-value';
        const mockStore = {} as session.Store;

        const opts = createSessionOptions(mockStore, false);

        expect(opts.name).toBe('cp.session');
        expect(opts.store).toBe(mockStore);
        expect(opts.secret).toBe('test-session-secret-value');
        expect(opts.saveUninitialized).toBe(false);
        expect(opts.resave).toBe(false);
        expect(opts.rolling).toBe(true);
        expect(opts.cookie).toEqual({
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 12 * 60 * 60 * 1000
        });
    });

    it('enables secure cookie flag in production mode', () => {
        process.env.APP_COOKIE_SECRET = 'test-session-secret-value';
        const mockStore = {} as session.Store;

        const opts = createSessionOptions(mockStore, true);

        expect(opts.cookie).toEqual({
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 12 * 60 * 60 * 1000
        });
    });

    it('builds matching cookie clear options for dev and production', () => {
        expect(isProductionEnvironment('production')).toBe(true);
        expect(isProductionEnvironment('development')).toBe(false);
        expect(isProductionEnvironment(undefined)).toBe(false);

        expect(createSessionCookieClearOptions(false)).toEqual({
            path: '/',
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });
        expect(createSessionCookieClearOptions(true)).toEqual({
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'lax'
        });
    });
});
