import {
    DataTypes,
    Model,
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    type Sequelize,
} from 'sequelize';

export class FAQ extends Model<InferAttributes<FAQ>, InferCreationAttributes<FAQ>> {
    declare id: CreationOptional<number>;
    declare question: string;
    declare answer: string;
    declare is_active: CreationOptional<number>;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    static initialize(sequelize: Sequelize): void {
        FAQ.init(
            {
                id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                question: { type: DataTypes.STRING(1500), allowNull: true },
                answer: { type: DataTypes.TEXT, allowNull: true },
                is_active: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                created_at: DataTypes.DATE,
                updated_at: DataTypes.DATE,
            },
            {
                sequelize,
                tableName: 'faq',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            },
        );
    }
}
