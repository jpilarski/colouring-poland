import bodyParser from 'body-parser';
import express from 'express';

import authRouter from './auth/authRouter';
import autofillRouter from './autofill/autofillRouter';
import buildingsRouter from './buildings/buildingsRouter';
import { apiErrorHandler, notFoundHandler } from './errors';
import extractsRouter from './extracts/extractsRouter';
import historyRouter from './history/historyRouter';
import leaderboardRouter from './leaderboard/leaderboardRouter';
import mapStatsRouter from './mapStats/mapStatsRouter';
import searchRouter from './search/searchRouter';
import usersRouter from './users/usersRouter';

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

// Globalna obsługa błędów i tras nieznalezionych (404)
server.use(apiErrorHandler);
server.use(notFoundHandler);

export default server;
