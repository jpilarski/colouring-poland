import express from 'express';

import { ApiParamError, ApiUserError } from './api';
import { DatabaseError } from './general';

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
        if (err instanceof ApiUserError) {
            let errorMessage: string;

            if (err instanceof ApiParamError) {
                errorMessage = `Problem with parameter ${err.paramName}: ${err.message}`;
            } else {
                errorMessage = err.message;
            }

            res.status(400).send({ error: errorMessage });
            return;
        }

        // Log error only if it's not a user parameter error
        console.log('Global error handler: ', err);

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
