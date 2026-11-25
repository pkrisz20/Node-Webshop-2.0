import {
    DataTypes,
    Model,
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    type NonAttribute,
    type Sequelize,
} from 'sequelize';
import type { Order } from './Order';
import type { Product } from './Product';

/** One ordered product line of an order */
export class OrderDetail extends Model<InferAttributes<OrderDetail>, InferCreationAttributes<OrderDetail>> {
    declare order_details_id: CreationOptional<number>;
    declare order_id: string;
    declare product_id: number;
    declare quantity: number;
    /** Unit price paid at the time of the order, NULL for the old orders whose original price is unknown */
    declare unit_price: number | null;

    declare order?: NonAttribute<Order>;
    declare product?: NonAttribute<Product>;

    static initialize(sequelize: Sequelize): void {
        OrderDetail.init(
            {
                order_details_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                order_id: { type: DataTypes.STRING(500), allowNull: false },
                product_id: { type: DataTypes.INTEGER, allowNull: false },
                quantity: { type: DataTypes.INTEGER, allowNull: false },
                unit_price: { type: DataTypes.INTEGER, allowNull: true },
            },
            {
                sequelize,
                tableName: 'order_details',
                timestamps: false,
            },
        );
    }
}
