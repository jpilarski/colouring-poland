import http from 'http';
import express from 'express';
import {
    createLoginLimiter,
    createPasswordResetLimiter,
    LOGIN_RATE_LIMIT_MAX,
    PASSWORD_RESET_RATE_LIMIT_MAX
} from '../rateLimiters';

function makeRequest(port: number, method: string, path: string): Promise<{ status: number; body: any }> {
    return new Promise((resolve, reject) => {
        const req = http.request(
            {
                hostname: '127.0.0.1',
                port,
                path,
                method,
                headers: { 'Content-Type': 'application/json' }
            },
            res => {
                let raw = '';
                res.on('data', chunk => { raw += chunk; });
                res.on('end', () => {
                    resolve({
                        status: res.statusCode ?? 0,
                        body: raw ? JSON.parse(raw) : {}
                    });
                });
            }
        );
        req.on('error', reject);
        req.write('{}');
        req.end();
    });
}

describe('HTTP Rate Limiters', () => {
    it('blocks login requests exceeding LOGIN_RATE_LIMIT_MAX with HTTP 429 JSON error', async () => {
        const app = express();
        app.post('/login', createLoginLimiter(), (_req, res) => {
            res.status(200).json({ ok: true });
        });

        const server = await new Promise<http.Server>(resolve => {
            const s = app.listen(0, '127.0.0.1', () => resolve(s));
        });

        try {
            const address = server.address();
            const port = typeof address === 'object' && address ? address.port : 0;

            for (let i = 0; i < LOGIN_RATE_LIMIT_MAX; i++) {
                const res = await makeRequest(port, 'POST', '/login');
                expect(res.status).toBe(200);
            }

            const blocked = await makeRequest(port, 'POST', '/login');
            expect(blocked.status).toBe(429);
            expect(blocked.body).toEqual({
                error: 'Zbyt wiele prób logowania z tego adresu IP. Spróbuj ponownie za 15 minut.'
            });
        } finally {
            await new Promise<void>(resolve => server.close(() => resolve()));
        }
    });

    it('blocks password reset requests exceeding PASSWORD_RESET_RATE_LIMIT_MAX with HTTP 429 JSON error', async () => {
        const app = express();
        app.put('/password', createPasswordResetLimiter(), (_req, res) => {
            res.status(200).json({ ok: true });
        });

        const server = await new Promise<http.Server>(resolve => {
            const s = app.listen(0, '127.0.0.1', () => resolve(s));
        });

        try {
            const address = server.address();
            const port = typeof address === 'object' && address ? address.port : 0;

            for (let i = 0; i < PASSWORD_RESET_RATE_LIMIT_MAX; i++) {
                const res = await makeRequest(port, 'PUT', '/password');
                expect(res.status).toBe(200);
            }

            const blocked = await makeRequest(port, 'PUT', '/password');
            expect(blocked.status).toBe(429);
            expect(blocked.body).toEqual({
                error: 'Zbyt wiele żądań resetu hasła z tego adresu IP. Spróbuj ponownie za 15 minut.'
            });
        } finally {
            await new Promise<void>(resolve => server.close(() => resolve()));
        }
    });
});
