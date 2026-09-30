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

export class ProductComment extends Model<InferAttributes<ProductComment>, InferCreationAttributes<ProductComment>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare email: string;
    declare comment: string;
    declare is_verified_purchase: CreationOptional<number>;
    declare is_active: CreationOptional<number>;
    declare date: CreationOptional<Date | null>;
    declare rating: CreationOptional<number | null>;
    declare product_id: number;

    declare product?: NonAttribute<Product>;

    static initialize(sequelize: Sequelize): void {
        ProductComment.init(
            {
                id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                name: { type: DataTypes.STRING(300), allowNull: false },
                email: { type: DataTypes.STRING(200), allowNull: false },
                comment: { type: DataTypes.TEXT, allowNull: false },
                is_verified_purchase: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                is_active: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                date: { type: DataTypes.DATE, allowNull: true },
                rating: { type: DataTypes.INTEGER, allowNull: true },
                product_id: { type: DataTypes.INTEGER, allowNull: false },
            },
            {
                sequelize,
                tableName: 'product_comments',
                timestamps: false,
            },
        );
    }
}
