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

/** Filterable product property (e.g. breed, size), the values are stored per product in `ProductParameter` */
export class WebshopParameter extends Model<InferAttributes<WebshopParameter>, InferCreationAttributes<WebshopParameter>> {
    declare id: CreationOptional<number>;
    declare parameter_name: string;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    declare products?: NonAttribute<Product[]>;

    static initialize(sequelize: Sequelize): void {
        WebshopParameter.init(
            {
                id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                parameter_name: { type: DataTypes.STRING(1500), allowNull: true },
                created_at: DataTypes.DATE,
                updated_at: DataTypes.DATE,
            },
            {
                sequelize,
                tableName: 'parameters',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            },
        );
    }
}
