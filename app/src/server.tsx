/**
 * Server-side Express application
 * - API methods
 * - entry-point to shared React App
 *
 */
import pgConnect from 'connect-pg-simple';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';

import apiServer from './api/api';
import {
    createHelmetOptions,
    permissionsPolicyMiddleware
} from './api/common/securityHeadersConfig';
import {
    createSessionOptions,
    SESSION_PRUNE_INTERVAL_SECONDS
} from './api/common/sessionConfig';
import db from './db';
import frontendRoute from './frontendRoute';
import tileserver from './tiles/tileserver';

// create server
const server = express();
const isProduction = server.get('env') === 'production';

// disable header & apply security headers (Helmet + CSP + Permissions-Policy)
server.disable('x-powered-by');
server.use(helmet(createHelmetOptions(isProduction)));
server.use(permissionsPolicyMiddleware);

// serve static files
const publicDir = process.env.RAZZLE_PUBLIC_DIR;
if (publicDir == undefined) {
    throw new Error('RAZZLE_PUBLIC_DIR is not set');
}
server.use(express.static(publicDir));

// handle user sessions
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
