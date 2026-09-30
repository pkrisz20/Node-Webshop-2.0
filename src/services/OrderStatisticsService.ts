import { col, fn, Op, where, type WhereOptions } from 'sequelize';
import { Order } from '../models';
import type { OrderStatus } from '../models/Order';

export interface OrderStatusCounts {
    totalOrders: number;
    new: number;
    in_process: number;
    finished: number;
    canceled: number;
}

interface StatusRow {
    order_status: OrderStatus;
    total: number | string;
}

interface MonthlyRow {
    month: number;
    total: number | string | null;
}

const MONTHS_IN_YEAR = 12;

export class OrderStatisticsService {
    latestOrders(limit = 15): Promise<Order[]> {
        return Order.findAll({ order: [['order_date', 'DESC']], limit });
    }

    async statusCounts(): Promise<OrderStatusCounts> {
        const rows = await Order.findAll({
            attributes: ['order_status', [fn('COUNT', col('order_id')), 'total']],
            group: ['order_status'],
            raw: true,
        }) as unknown as StatusRow[];

        const countOf = (status: OrderStatus): number => Number(rows.find(row => row.order_status === status)?.total ?? 0);

        return {
            totalOrders: rows.reduce((total, row) => total + Number(row.total), 0),
            new: countOf('new'),
            in_process: countOf('in process'),
            finished: countOf('done'),
            canceled: countOf('canceled'),
        };
    }

    /** Income of the closed orders per month (index 0 = January) */
    monthlyRevenue(year: number): Promise<number[]> {
        return this.aggregatePerMonth('closed_order_at', fn('SUM', col('order_sum_price')), year, { order_status: 'done' });
    }

    /** Number of the received orders per month (index 0 = January) */
    monthlyOrderCounts(year: number): Promise<number[]> {
        return this.aggregatePerMonth('order_date', fn('COUNT', col('order_id')), year);
    }

    private async aggregatePerMonth(
        dateColumn: 'closed_order_at' | 'order_date',
        aggregate: ReturnType<typeof fn>,
        year: number,
        filter: WhereOptions<Order> = {},
    ): Promise<number[]> {
        const month = fn('MONTH', col(dateColumn));

        const rows = await Order.findAll({
            attributes: [[aggregate, 'total'], [month, 'month']],
            where: { [Op.and]: [filter, where(fn('YEAR', col(dateColumn)), year)] },
            group: [month],
            raw: true,
        }) as unknown as MonthlyRow[];

        const totals = Array<number>(MONTHS_IN_YEAR).fill(0);
        rows.forEach(row => { totals[row.month - 1] = Number(row.total ?? 0); });

        return totals;
    }
}
