import { Sequelize } from 'sequelize';
import { env } from '../config/env';

/** The callback API of the mysql2 connection, the hooks get the raw driver connection */
interface DriverConnection {
    query(sql: string, callback: (error: Error | null) => void): void;
}

/** Adds STRICT_TRANS_TABLES to the SQL mode of the session, the other modes of the server are kept */
const STRICT_MODE_QUERY = `SET SESSION sql_mode = IF(
    FIND_IN_SET('STRICT_TRANS_TABLES', @@SESSION.sql_mode),
    @@SESSION.sql_mode,
    CONCAT_WS(',', NULLIF(@@SESSION.sql_mode, ''), 'STRICT_TRANS_TABLES')
)`;

export class Database {
    static readonly sequelize = new Sequelize(env.database.name, env.database.username, env.database.password, {
        host: env.database.host,
        dialect: 'mysql',
        logging: env.isDebug ? console.log : false,
        timezone: Database.resolveTimezone(),
        // Sequelize converts the dates itself, the driver only accepts "local" or offsets
        dialectOptions: { timezone: 'local' },
        hooks: {
            afterConnect: connection => Database.enableStrictMode(connection as DriverConnection),
        },
    });

    /**
     * Only checks the connection. The schema is owned by the migrations (`npm run db:migrate`),
     * `sequelize.sync()` is not used, it would drop or alter the tables behind the migrations' back.
     */
    static async connect(): Promise<void> {
        await Database.sequelize.authenticate();
    }

    /**
     * Without strict mode (the default of XAMPP's MariaDB) a too long value is cut silently, which breaks the
     * localized JSON columns. In strict mode the query fails instead. Only the app's own connections are affected.
     */
    private static enableStrictMode(connection: DriverConnection): Promise<void> {
        return new Promise((resolve, reject) => {
            connection.query(STRICT_MODE_QUERY, error => (error ? reject(error) : resolve()));
        });
    }

    /**
     * The legacy data was written in the server's local time, so the same timezone is used for reading and writing.
     * Only IANA names ("Europe/Budapest") or offsets ("+01:00") are accepted by the MySQL dialect.
     */
    private static resolveTimezone(): string {
        if (env.database.timezone) {
            return env.database.timezone;
        }

        const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return localTimezone.includes('/') ? localTimezone : '+00:00';
    }
}
