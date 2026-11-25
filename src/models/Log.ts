import {
    DataTypes,
    Model,
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    type Sequelize,
} from 'sequelize';

export const LOG_TYPES = ['info', 'warning', 'error'] as const;

export type LogType = typeof LOG_TYPES[number];

/**
 * Every log entry of the application (write them through `Logger`).
 * The request columns are filled when the entry was written while serving a request, they are empty for the background jobs.
 */
export class Log extends Model<InferAttributes<Log>, InferCreationAttributes<Log>> {
    declare log_id: CreationOptional<number>;
    declare log_type: LogType;
    /** Short title, e.g. "Admin login" or the name of the error */
    declare log_name: string | null;
    /** Details, the stack trace of an error */
    declare log_description: CreationOptional<string | null>;
    declare request_method: CreationOptional<string | null>;
    declare request_url: CreationOptional<string | null>;
    declare ip_address: CreationOptional<string | null>;
    declare user_agent: CreationOptional<string | null>;
    declare log_date: Date;

    static initialize(sequelize: Sequelize): void {
        Log.init(
            {
                log_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                log_type: { type: DataTypes.ENUM(...LOG_TYPES), allowNull: false },
                log_name: { type: DataTypes.STRING(1500), allowNull: true },
                log_description: { type: DataTypes.TEXT, allowNull: true },
                request_method: { type: DataTypes.STRING(16), allowNull: true },
                request_url: { type: DataTypes.TEXT, allowNull: true },
                ip_address: { type: DataTypes.STRING(45), allowNull: true },
                user_agent: { type: DataTypes.TEXT, allowNull: true },
                log_date: { type: DataTypes.DATE, allowNull: true },
            },
            {
                sequelize,
                tableName: 'logs',
                timestamps: false,
            },
        );
    }
}
