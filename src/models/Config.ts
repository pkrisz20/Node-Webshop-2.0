import {
    DataTypes,
    Model,
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    type Sequelize,
} from 'sequelize';

/** Key-value store of the global site settings */
export class Config extends Model<InferAttributes<Config>, InferCreationAttributes<Config>> {
    declare config_id: CreationOptional<number>;
    declare config_key: string;
    declare config_value: CreationOptional<string | null>;

    static initialize(sequelize: Sequelize): void {
        Config.init(
            {
                config_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                config_key: { type: DataTypes.STRING(200), allowNull: false },
                config_value: { type: DataTypes.STRING(1500), allowNull: true },
            },
            {
                sequelize,
                tableName: 'config',
                timestamps: false,
            },
        );
    }
}
