import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';

/**
 * Optional IP-based HTTP rate limiters kept ready for quick middleware attachment
 * if IP-level throttling is not handled at the reverse-proxy layer.
 * Thresholds are sized for shared NAT networks (e.g. computer labs).
 */
export const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_RATE_LIMIT_MAX = 100;

export const PASSWORD_RESET_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const PASSWORD_RESET_RATE_LIMIT_MAX = 25;

export function createLoginLimiter(): RateLimitRequestHandler {
    return rateLimit({
        windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
        limit: LOGIN_RATE_LIMIT_MAX,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Zbyt wiele prób logowania z tego adresu IP. Spróbuj ponownie za 15 minut.' }
    });
}

export function createPasswordResetLimiter(): RateLimitRequestHandler {
    return rateLimit({
        windowMs: PASSWORD_RESET_RATE_LIMIT_WINDOW_MS,
        limit: PASSWORD_RESET_RATE_LIMIT_MAX,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Zbyt wiele żądań resetu hasła z tego adresu IP. Spróbuj ponownie za 15 minut.' }
    });
}

export const loginLimiter = createLoginLimiter();
export const passwordResetLimiter = createPasswordResetLimiter();
