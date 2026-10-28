import express from 'express';

import authRouter from './auth/authRouter';
import usersRouter from './users/usersRouter';
import buildingsRouter from './buildings/buildingsRouter';
import searchRouter from './search/searchRouter';
import historyRouter from './history/historyRouter';
import autofillRouter from './autofill/autofillRouter';
import extractsRouter from './extracts/extractsRouter';
import leaderboardRouter from './leaderboard/leaderboardRouter';
import mapStatsRouter from './mapStats/mapStatsRouter';
import { ApiUserError } from './common/errors/api';

const server = express();

server.use(express.json());

// Rejestracja routerów domenowych
server.use('/', authRouter);                 // POST /login, POST /logout, POST /api/key
server.use('/users', usersRouter);           // /api/users
server.use('/buildings', buildingsRouter);   // /api/buildings
server.use('/search', searchRouter);         // GET /api/search
server.use('/history', historyRouter);       // GET /api/history
server.use('/autofill', autofillRouter);     // GET /api/autofill
server.use('/extracts', extractsRouter);     // /api/extracts
server.use('/leaderboard', leaderboardRouter);// /api/leaderboard
server.use('/map-stats', mapStatsRouter);    // GET /api/map-stats

// Centralna obsługa błędów API
server.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof ApiUserError) {
        res.status(err.statusCode || 400).send({
            error: err.message,
            code: err.name,
            param: (err as any).paramName
        });
    } else {
        console.error('Unhandled API Error:', err);
        res.status(500).send({
            error: 'Internal server error'
        });
    }
});

export default server;
