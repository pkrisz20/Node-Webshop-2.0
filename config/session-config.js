const dotenv = require('dotenv');
const path = require('path');
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });
const session = require("express-session");
const FileStore = require('session-file-store')(session);

const sessionConfig = {
    store: new FileStore({
        path: "./sessions",
        ttl: 60 * 60 * 24 * 30,
        retries: 2,
        logFn: console.log
    }),
    secret: process.env.SESSION_SECRET,
    key: "website_session",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 30,
        secure: process.env.APP_DEBUG === 'false',
    }
};

module.exports = sessionConfig;
