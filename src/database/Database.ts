import { Sequelize } from 'sequelize';
import { env } from '../config/env';

export class Database {
    static readonly sequelize = new Sequelize(env.database.name, env.database.username, env.database.password, {
        host: env.database.host,
        dialect: 'mysql',
        logging: env.isDebug ? console.log : false,
        timezone: Database.resolveTimezone(),
        // Sequelize converts the dates itself, the driver only accepts "local" or offsets
        dialectOptions: { timezone: 'local' },
    });

    static async connect(): Promise<void> {
        await Database.sequelize.authenticate();

        if (env.database.sync) {
            // Debug mode rebuilds the schema from scratch, production only alters the existing tables
            await Database.sequelize.sync({ force: env.isDebug, alter: env.isProduction });
        }
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
