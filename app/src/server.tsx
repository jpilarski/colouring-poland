/**
 * Server-side Express application
 * - API methods
 * - entry-point to shared React App
 *
 */
import pgConnect from 'connect-pg-simple';
import express from 'express';
import session from 'express-session';

import apiServer from './api/api';
import {
    createSessionOptions,
    SESSION_PRUNE_INTERVAL_SECONDS
} from './api/common/sessionConfig';
import db from './db';
import frontendRoute from './frontendRoute';
import tileserver from './tiles/tileserver';

// create server
const server = express();

// disable header
server.disable('x-powered-by');

// serve static files
const publicDir = process.env.RAZZLE_PUBLIC_DIR;
if (publicDir == undefined) {
    throw new Error('RAZZLE_PUBLIC_DIR is not set');
}
server.use(express.static(publicDir));

// handle user sessions
const isProduction = server.get('env') === 'production';
if (isProduction) {
    // trust first proxy
    server.set('trust proxy', 1);
}
const pgSession = pgConnect(session);
const sessionStore = new pgSession({
    pgPromise: db,
    tableName: 'user_sessions',
    pruneSessionInterval: SESSION_PRUNE_INTERVAL_SECONDS
});
const sess: session.SessionOptions = createSessionOptions(sessionStore, isProduction);
server.use(session(sess));

server.use('/tiles', tileserver);
server.use('/api', apiServer);
server.use(frontendRoute);

export default server;
