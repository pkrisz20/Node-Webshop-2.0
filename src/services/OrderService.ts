import { Op } from 'sequelize';
import { Database } from '../database/Database';
import { Order, OrderDetail, Product } from '../models';
import type { CartItem } from '../types/cart';
import { UniqueId } from '../utils/UniqueId';

export interface CustomerData {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    city: string;
    postcode: string;
    address: string;
    comment?: string | null;
}

interface OrderLine {
    productId: number;
    quantity: number;
    unitPrice: number;
}

export class OrderService {
    /**
     * Saves the order with its product lines in one transaction.
     * The prices and the availability are validated against the database, not the session.
     * @returns null when any cart product can not be ordered
     */
    async placeOrder(cartItems: CartItem[], customer: CustomerData): Promise<Order | null> {
        const orderLines = await this.buildOrderLines(cartItems);

        if (!orderLines) {
            return null;
        }

        const totalPrice = orderLines.reduce((total, line) => total + line.quantity * line.unitPrice, 0);

        return Database.sequelize.transaction(async transaction => {
            const order = await Order.create({
                order_id: UniqueId.generate(),
                order_sum_price: totalPrice,
                customer_firstname: customer.firstname,
                customer_lastname: customer.lastname,
                customer_email: customer.email,
                customer_address: customer.address,
                customer_postal_code: customer.postcode,
                customer_city: customer.city,
                customer_phone: customer.phone,
                customer_note: customer.comment || null,
                order_date: new Date(),
            }, { transaction });

            await OrderDetail.bulkCreate(
                orderLines.map(line => ({
                    order_id: order.order_id,
                    product_id: line.productId,
                    quantity: line.quantity,
                    unit_price: line.unitPrice,
                })),
                { transaction },
            );

            return order;
        });
    }

    private async buildOrderLines(cartItems: CartItem[]): Promise<OrderLine[] | null> {
        if (cartItems.length === 0) {
            return null;
        }

        const products = await Product.findAll({ where: { id: { [Op.in]: cartItems.map(item => item.productId) } } });
        const productsById = new Map(products.map(product => [product.id, product]));
        const orderLines: OrderLine[] = [];

        for (const item of cartItems) {
            const product = productsById.get(item.productId);
            const exceedsMaximum = product?.max_order_count != null && item.quantity > product.max_order_count;

            if (!product || !product.isOrderable() || item.quantity <= 0 || exceedsMaximum) {
                return null;
            }

            orderLines.push({ productId: product.id, quantity: item.quantity, unitPrice: product.getEffectivePrice() });
        }

        return orderLines;
    }
}
