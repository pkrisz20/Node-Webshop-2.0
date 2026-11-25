const path = require('path');
const dotenv = require('dotenv');

// sequelize-cli can not load the TypeScript config, the connection is read from the same .env file as the app
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/** Same as `Database.resolveTimezone()`: the dates are written in the server's local time, like the app does */
function resolveTimezone() {
    const configured = process.env.DB_TIMEZONE?.trim();

    if (configured) {
        return configured;
    }

    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return localTimezone.includes('/') ? localTimezone : '+00:00';
}

/** Same as `Database.enableStrictMode()`: too long values fail instead of being cut silently */
const STRICT_MODE_QUERY = `SET SESSION sql_mode = IF(
    FIND_IN_SET('STRICT_TRANS_TABLES', @@SESSION.sql_mode),
    @@SESSION.sql_mode,
    CONCAT_WS(',', NULLIF(@@SESSION.sql_mode, ''), 'STRICT_TRANS_TABLES')
)`;

function enableStrictMode(connection) {
    return new Promise((resolve, reject) => {
        connection.query(STRICT_MODE_QUERY, error => (error ? reject(error) : resolve()));
    });
}

const connection = {
    host: process.env.DB_HOST?.trim() || 'localhost',
    username: process.env.DB_USERNAME?.trim(),
    password: process.env.DB_PASSWORD?.trim() || null,
    database: process.env.DB_DATABASE?.trim(),
    dialect: 'mysql',
    timezone: resolveTimezone(),
    dialectOptions: { timezone: 'local' },
    hooks: { afterConnect: enableStrictMode },
    // Lowercase, because MySQL on Windows lowercases the table names, a dump moved to Linux would lose "SequelizeMeta"
    migrationStorageTableName: 'sequelize_meta',
    // The executed seeders are recorded too, so running them again does not duplicate the test data
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelize_data',
};

// The same .env file is used everywhere, so every NODE_ENV gets the same connection
module.exports = {
    development: connection,
    test: connection,
    production: connection,
};
