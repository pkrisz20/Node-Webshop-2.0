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
import type { WebshopParameter } from './WebshopParameter';

/** Pivot table between products and webshop parameters, holding the localized parameter value */
export class ProductParameter extends Model<InferAttributes<ProductParameter>, InferCreationAttributes<ProductParameter>> {
    declare id: CreationOptional<number>;
    declare parameter_value: CreationOptional<string | null>;
    declare product_id: number;
    declare parameter_id: number;

    declare product?: NonAttribute<Product>;
    declare parameter?: NonAttribute<WebshopParameter>;

    static initialize(sequelize: Sequelize): void {
        ProductParameter.init(
            {
                id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                parameter_value: { type: DataTypes.STRING(1500), allowNull: true },
                product_id: { type: DataTypes.INTEGER, allowNull: false },
                parameter_id: { type: DataTypes.INTEGER, allowNull: false },
            },
            {
                sequelize,
                tableName: 'product_parameters',
                timestamps: false,
            },
        );
    }
}
