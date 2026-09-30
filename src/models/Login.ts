import {
    DataTypes,
    Model,
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    type Sequelize,
} from 'sequelize';

/** Audit log of the successful admin logins */
export class Login extends Model<InferAttributes<Login>, InferCreationAttributes<Login>> {
    declare login_id: CreationOptional<number>;
    declare login_ip_address: string;
    declare login_datetime: CreationOptional<Date | null>;

    static initialize(sequelize: Sequelize): void {
        Login.init(
            {
                login_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                login_ip_address: { type: DataTypes.STRING(200), allowNull: false },
                login_datetime: { type: DataTypes.DATE, allowNull: true },
            },
            {
                sequelize,
                tableName: 'logins',
                timestamps: false,
            },
        );
    }
}
