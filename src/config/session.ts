import session, { type SessionOptions } from 'express-session';
import createFileStore from 'session-file-store';
import { Duration } from '../utils/Duration';
import { appConfig } from './app';
import { env } from './env';
import { paths } from './paths';

const FileStore = createFileStore(session);
const { sessionLifetimeDays } = appConfig.security;

export const sessionOptions: SessionOptions = {
    store: new FileStore({
        path: paths.sessions,
        ttl: Duration.daysInSeconds(sessionLifetimeDays),
        retries: 2,
        logFn: console.log,
    }),
    secret: env.sessionSecret,
    name: 'website_session',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: Duration.daysInMilliseconds(sessionLifetimeDays),
        secure: env.isProduction,
        // Not sent with cross-site POST / AJAX requests, an extra layer next to the CSRF token
        sameSite: 'lax',
    },
};
