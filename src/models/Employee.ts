import {
    DataTypes,
    Model,
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    type Sequelize,
} from 'sequelize';

export class Employee extends Model<InferAttributes<Employee>, InferCreationAttributes<Employee>> {
    declare id: CreationOptional<number>;
    declare image: CreationOptional<string | null>;
    declare name: string;
    declare position: string;
    declare description: CreationOptional<string | null>;
    declare facebook: CreationOptional<string | null>;
    declare instagram: CreationOptional<string | null>;
    declare tiktok: CreationOptional<string | null>;
    declare email: CreationOptional<string | null>;
    declare phone: CreationOptional<string | null>;
    declare is_active: CreationOptional<number>;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    static initialize(sequelize: Sequelize): void {
        Employee.init(
            {
                id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                image: { type: DataTypes.STRING(300), allowNull: true },
                name: { type: DataTypes.STRING(200), allowNull: false },
                position: { type: DataTypes.STRING(500), allowNull: false },
                description: { type: DataTypes.TEXT, allowNull: true },
                facebook: { type: DataTypes.STRING(500), allowNull: true },
                instagram: { type: DataTypes.STRING(500), allowNull: true },
                tiktok: { type: DataTypes.STRING(500), allowNull: true },
                email: { type: DataTypes.STRING(500), allowNull: true },
                phone: { type: DataTypes.STRING(200), allowNull: true },
                is_active: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                created_at: DataTypes.DATE,
                updated_at: DataTypes.DATE,
            },
            {
                sequelize,
                tableName: 'employees',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            },
        );
    }
}
