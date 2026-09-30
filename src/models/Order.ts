import {
    DataTypes,
    Model,
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    type NonAttribute,
    type Sequelize,
} from 'sequelize';
import type { OrderDetail } from './OrderDetail';

export const ORDER_STATUSES = ['new', 'in process', 'done', 'canceled'] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

export interface OrderStatusBadge {
    statusText: string;
    statusClass: string;
}

const STATUS_BADGES: Record<OrderStatus, OrderStatusBadge> = {
    'new': { statusText: 'Új', statusClass: 'bg-secondary' },
    'in process': { statusText: 'Folyamatban', statusClass: 'bg-primary' },
    'done': { statusText: 'Lezárt', statusClass: 'bg-success' },
    'canceled': { statusText: 'Lemondott', statusClass: 'bg-danger' },
};

const CLOSED_STATUSES: readonly OrderStatus[] = ['done', 'canceled'];

export class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
    declare order_id: string;
    declare customer_firstname: string;
    declare customer_lastname: string;
    declare customer_email: string;
    declare customer_address: string;
    declare customer_postal_code: string;
    declare customer_city: string;
    declare customer_phone: CreationOptional<string | null>;
    declare customer_note: CreationOptional<string | null>;
    declare order_status: CreationOptional<OrderStatus>;
    declare order_sum_price: CreationOptional<number | null>;
    declare order_date: CreationOptional<Date | null>;
    declare closed_order_at: CreationOptional<Date | null>;

    declare details?: NonAttribute<OrderDetail[]>;

    static isValidStatus(status: unknown): status is OrderStatus {
        return ORDER_STATUSES.includes(status as OrderStatus);
    }

    static isClosingStatus(status: OrderStatus): boolean {
        return CLOSED_STATUSES.includes(status);
    }

    get customerFullName(): NonAttribute<string> {
        return `${this.customer_firstname} ${this.customer_lastname}`;
    }

    getStatusBadge(): OrderStatusBadge {
        const status: OrderStatus = this.order_status;
        return STATUS_BADGES[status] ?? STATUS_BADGES.new;
    }

    isStatusEditable(): boolean {
        return !Order.isClosingStatus(this.order_status);
    }

    /** Every status except the current one */
    getSelectableStatuses(): OrderStatus[] {
        return ORDER_STATUSES.filter(status => status !== this.order_status);
    }

    static initialize(sequelize: Sequelize): void {
        Order.init(
            {
                order_id: { type: DataTypes.STRING(200), primaryKey: true },
                customer_firstname: { type: DataTypes.STRING(200), allowNull: false },
                customer_lastname: { type: DataTypes.STRING(200), allowNull: false },
                customer_email: { type: DataTypes.STRING(200), allowNull: false },
                customer_address: { type: DataTypes.STRING(500), allowNull: false },
                customer_postal_code: { type: DataTypes.STRING(100), allowNull: false },
                customer_city: { type: DataTypes.STRING(200), allowNull: false },
                customer_phone: { type: DataTypes.STRING(200), allowNull: true },
                customer_note: { type: DataTypes.STRING(1500), allowNull: true },
                order_status: { type: DataTypes.STRING(200), allowNull: false, defaultValue: 'new' },
                order_sum_price: { type: DataTypes.INTEGER, allowNull: true },
                order_date: { type: DataTypes.DATE, allowNull: true },
                closed_order_at: { type: DataTypes.DATE, allowNull: true },
            },
            {
                sequelize,
                tableName: 'orders',
                timestamps: false,
            },
        );
    }
}
