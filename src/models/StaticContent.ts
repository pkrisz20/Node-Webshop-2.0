import {
    DataTypes,
    Model,
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    type Sequelize,
} from 'sequelize';

/** Locked content pages (terms of use, privacy policy), they can be edited but not created or deleted */
export class StaticContent extends Model<InferAttributes<StaticContent>, InferCreationAttributes<StaticContent>> {
    declare id: CreationOptional<number>;
    declare title: string;
    declare slug: CreationOptional<string | null>;
    declare short_description: CreationOptional<string | null>;
    declare description: CreationOptional<string | null>;
    declare content_name: CreationOptional<string | null>;
    declare updated_at: CreationOptional<Date>;

    static initialize(sequelize: Sequelize): void {
        StaticContent.init(
            {
                id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                title: { type: DataTypes.STRING(1000), allowNull: false },
                slug: { type: DataTypes.STRING(500), allowNull: true },
                short_description: { type: DataTypes.STRING(3000), allowNull: true },
                description: { type: DataTypes.TEXT('long'), allowNull: true },
                content_name: { type: DataTypes.STRING(1000), allowNull: true },
                updated_at: DataTypes.DATE,
            },
            {
                sequelize,
                tableName: 'static_contents',
                timestamps: true,
                createdAt: false,
                updatedAt: 'updated_at',
            },
        );
    }
}
