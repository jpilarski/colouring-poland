import express from 'express';

import { ApiParamError, ApiUserError } from './api';
import { ConflictError, DatabaseError, InvalidOperationError, NotFoundError, UserError } from './general';

/**
 * Global API Error Handling Middleware
 * Maps domain and user errors to appropriate HTTP status codes and JSON responses.
 */
export function apiErrorHandler(
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
): void {
    if (res.headersSent) {
        return next(err);
    }

    if (err != undefined) {
        if (err?.type === 'entity.parse.failed' || (err instanceof SyntaxError && (err as any).status === 400)) {
            res.status(400).send({ error: 'Invalid JSON payload' });
            return;
        }

        if (err?.type === 'entity.too.large' || err?.status === 413) {
            res.status(413).send({ error: 'Request payload too large' });
            return;
        }

        if (err instanceof NotFoundError) {
            res.status(404).send({ error: err.message || 'Resource not found' });
            return;
        }

        if (err instanceof ConflictError || err instanceof InvalidOperationError) {
            res.status(409).send({ error: err.message || 'Conflict' });
            return;
        }

        if (err instanceof ApiUserError) {
            const errorMessage = err instanceof ApiParamError
                ? `Problem with parameter ${err.paramName}: ${err.message}`
                : err.message;

            res.status(400).send({ error: errorMessage });
            return;
        }

        if (err instanceof UserError) {
            res.status(400).send({ error: err.message || 'Invalid request' });
            return;
        }

        console.error(
            'Global error handler:',
            err?.name || 'Error',
            err?.code || 'UNKNOWN',
            err?.message || 'Unexpected error'
        );

        if (err instanceof DatabaseError) {
            res.status(500).send({ error: 'Database error' });
        } else {
            res.status(500).send({ error: 'Server error' });
        }
    }
}

/**
 * 404 Not Found Handler for unmatched API endpoints
 */
export function notFoundHandler(req: express.Request, res: express.Response): void {
    res.status(404).json({ error: 'Resource not found' });
}
