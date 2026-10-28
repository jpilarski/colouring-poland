import bodyParser from 'body-parser';
import express from 'express';

import { ApiParamError, ApiUserError } from './errors/api';
import { DatabaseError } from './errors/general';
import authRouter from './routes/authRouter';
import autofillRouter from './routes/autofillRouter';
import buildingsRouter from './routes/buildingsRouter';
import extractsRouter from './routes/extractsRouter';
import historyRouter from './routes/historyRouter';
import leaderboardRouter from './routes/leaderboardRouter';
import mapStatsRouter from './routes/map-stats';
import searchRouter from './routes/searchRouter';
import usersRouter from './routes/usersRouter';

const server = express.Router();
server.use(bodyParser.json());

// Trasy główne API (wszystkie montowane pod /api w server.tsx)
server.use('/', authRouter);                 // POST /api/login, POST /api/logout, POST /api/api/key
server.use('/users', usersRouter);           // /api/users
server.use('/buildings', buildingsRouter);   // /api/buildings
server.use('/search', searchRouter);         // GET /api/search
server.use('/history', historyRouter);       // GET /api/history
server.use('/autofill', autofillRouter);     // GET /api/autofill
server.use('/extracts', extractsRouter);     // /api/extracts
server.use('/leaderboard', leaderboardRouter);// /api/leaderboard
server.use('/map-stats', mapStatsRouter);    // GET /api/map-stats

// Globalna obsługa błędów
server.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

            return res.status(400).send({ error: errorMessage });
        }

        console.log('Global error handler: ', err);

        if (err instanceof DatabaseError) {
            res.status(500).send({ error: 'Database error' });
        } else {
            res.status(500).send({ error: 'Server error' });
        }
    }
});

// Obsługa nieznanych tras (404)
server.use((req, res) => {
    res.status(404).json({ error: 'Resource not found' });
});

export default server;
