import helmet from 'helmet';
import {
    createHelmetOptions,
    PERMISSIONS_POLICY_VALUE,
    permissionsPolicyMiddleware
} from '../securityHeadersConfig';

function runMiddleware(
    middleware: (req: any, res: any, next: (err?: unknown) => void) => void
): Record<string, string | string[]> {
    const headers: Record<string, string | string[]> = {};
    const req: any = {};
    const res: any = {
        setHeader: jest.fn((name: string, value: string | string[]) => {
            headers[name.toLowerCase()] = value;
        }),
        removeHeader: jest.fn((name: string) => {
            delete headers[name.toLowerCase()];
        }),
        getHeader: jest.fn((name: string) => headers[name.toLowerCase()])
    };
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    return headers;
}

describe('HTTP Security Headers Configuration (Helmet & CSP)', () => {
    it('emits hardened production headers including HSTS, CSP with OSM/Mapbox tiles, and no dev ports', () => {
        const middleware = helmet(createHelmetOptions(true));
        const headers = runMiddleware(middleware);

        expect(headers['x-content-type-options']).toBe('nosniff');
        expect(headers['x-frame-options']).toBe('SAMEORIGIN');
        expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
        expect(headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains; preload');
        expect(headers['cross-origin-embedder-policy']).toBeUndefined();
        expect(headers['cross-origin-resource-policy']).toBe('same-origin');

        const csp = String(headers['content-security-policy']);
        expect(csp).toContain("default-src 'self'");
        expect(csp).toContain("img-src 'self' data: blob: https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://*.openstreetmap.org https://*.tiles.mapbox.com");
        expect(csp).toContain("worker-src 'self' blob:");
        expect(csp).toContain("child-src 'self' blob:");
        expect(csp).toContain("frame-ancestors 'self'");
        expect(csp).toContain("object-src 'none'");
        expect(csp).toContain('upgrade-insecure-requests');
        expect(csp).not.toContain('localhost:3001');
        expect(csp).not.toContain("'unsafe-eval'");
    });

    it('disables HSTS and upgrade-insecure-requests in development while permitting Razzle port 3001', () => {
        const middleware = helmet(createHelmetOptions(false));
        const headers = runMiddleware(middleware);

        expect(headers['x-content-type-options']).toBe('nosniff');
        expect(headers['x-frame-options']).toBe('SAMEORIGIN');
        expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
        expect(headers['strict-transport-security']).toBeUndefined();
        expect(headers['cross-origin-resource-policy']).toBeUndefined();

        const csp = String(headers['content-security-policy']);
        expect(csp).toContain('http://localhost:3001');
        expect(csp).toContain('ws://localhost:3001');
        expect(csp).toContain('https://tile.openstreetmap.org');
        expect(csp).toContain("worker-src 'self' blob:");
        expect(csp).toContain("child-src 'self' blob:");
        expect(csp).not.toContain('upgrade-insecure-requests');
    });

    it('sets Permissions-Policy restricting unused hardware sensors', () => {
        const headers = runMiddleware(permissionsPolicyMiddleware);
        expect(headers['permissions-policy']).toBe(PERMISSIONS_POLICY_VALUE);
        expect(headers['permissions-policy']).toBe('geolocation=(self), camera=(), microphone=(), payment=()');
    });
});
