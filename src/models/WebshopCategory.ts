import {
    DataTypes,
    Model,
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    type NonAttribute,
    type Sequelize,
} from 'sequelize';
import type { Product } from './Product';

export class WebshopCategory extends Model<InferAttributes<WebshopCategory>, InferCreationAttributes<WebshopCategory>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare slug: CreationOptional<string | null>;
    declare short_description: CreationOptional<string | null>;
    declare image: CreationOptional<string | null>;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    declare products?: NonAttribute<Product[]>;

    static initialize(sequelize: Sequelize): void {
        WebshopCategory.init(
            {
                id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                name: { type: DataTypes.STRING(500), allowNull: false },
                slug: { type: DataTypes.STRING(1000), allowNull: true },
                short_description: { type: DataTypes.STRING(3000), allowNull: true },
                image: { type: DataTypes.STRING(200), allowNull: true },
                created_at: { type: DataTypes.DATE, allowNull: false },
                updated_at: { type: DataTypes.DATE, allowNull: false },
            },
            {
                sequelize,
                tableName: 'categories',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            },
        );
    }
}
