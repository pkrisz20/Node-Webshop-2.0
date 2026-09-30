import {
    DataTypes,
    Model,
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    type Sequelize,
} from 'sequelize';

export class ErrorLog extends Model<InferAttributes<ErrorLog>, InferCreationAttributes<ErrorLog>> {
    declare log_id: CreationOptional<number>;
    declare log_name: CreationOptional<string | null>;
    declare log_description: CreationOptional<string | null>;
    declare log_date: CreationOptional<Date | null>;

    static initialize(sequelize: Sequelize): void {
        ErrorLog.init(
            {
                log_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                log_name: { type: DataTypes.STRING(1500), allowNull: true },
                log_description: { type: DataTypes.TEXT, allowNull: true },
                log_date: { type: DataTypes.DATE, allowNull: true },
            },
            {
                sequelize,
                tableName: 'errors_log',
                timestamps: false,
            },
        );
    }
}
