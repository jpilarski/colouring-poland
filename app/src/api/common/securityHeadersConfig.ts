import express from 'express';
import { HelmetOptions } from 'helmet';

export const PERMISSIONS_POLICY_VALUE = 'geolocation=(self), camera=(), microphone=(), payment=()';

const DEV_ASSET_ORIGINS = ['http://localhost:3001', 'http://127.0.0.1:3001'];
const DEV_WS_ORIGINS = ['ws://localhost:3001', 'ws://127.0.0.1:3001'];

export function createHelmetOptions(isProduction: boolean): HelmetOptions {
    const devSources = isProduction ? [] : DEV_ASSET_ORIGINS;
    const devConnectSources = isProduction ? [] : [...DEV_ASSET_ORIGINS, ...DEV_WS_ORIGINS];

    return {
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: isProduction
                    ? ["'self'", "'unsafe-inline'"]
                    : ["'self'", "'unsafe-inline'", "'unsafe-eval'", ...devSources],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://api.mapbox.com', ...devSources],
                imgSrc: [
                    "'self'",
                    'data:',
                    'blob:',
                    'https://tile.openstreetmap.org',
                    'https://*.tile.openstreetmap.org',
                    'https://*.openstreetmap.org',
                    'https://*.tiles.mapbox.com',
                    ...devSources
                ],
                fontSrc: ["'self'", 'data:', ...devSources],
                connectSrc: [
                    "'self'",
                    'https://api.mapbox.com',
                    'https://events.mapbox.com',
                    ...devConnectSources
                ],
                workerSrc: ["'self'", 'blob:'],
                childSrc: ["'self'", 'blob:'],
                frameAncestors: ["'self'"],
                objectSrc: ["'none'"],
                baseUri: ["'self'"],
                formAction: ["'self'"],
                upgradeInsecureRequests: isProduction ? [] : null
            }
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: isProduction ? { policy: 'same-origin' } : false,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        xContentTypeOptions: true,
        xFrameOptions: { action: 'sameorigin' },
        xPoweredBy: true,
        strictTransportSecurity: isProduction
            ? { maxAge: 31536000, includeSubDomains: true, preload: true }
            : false
    };
}

export function permissionsPolicyMiddleware(
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
): void {
    res.setHeader('Permissions-Policy', PERMISSIONS_POLICY_VALUE);
    next();
}
