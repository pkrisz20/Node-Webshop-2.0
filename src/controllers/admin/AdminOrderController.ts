import type { Request, Response } from 'express';
import { ApiResponse } from '../../http/ApiResponse';
import { ErrorPage } from '../../http/ErrorPage';
import { Order, OrderDetail, Product } from '../../models';
import { OrderPresenter } from '../../presenters/OrderPresenter';
import { Logger } from '../../services/Logger';
import { AdminController } from './AdminController';

export class AdminOrderController extends AdminController {
    readonly index = async (req: Request, res: Response): Promise<void> => {
        const pagination = this.pagination(req);

        if (!pagination) {
            return ErrorPage.badRequest(req, res);
        }

        const { rows: orders, count } = await Order.findAndCountAll({
            order: [['order_date', 'DESC']],
            limit: pagination.limit,
            offset: pagination.offset,
        });

        const orderPresenter = new OrderPresenter(req.language, res.locals.priceFormat);

        res.render('admin/orders/list', {
            meta: this.meta('Admin orders list page', 'This is the orders list page'),
            pageCount: pagination.pageCount(count),
            currentPage: pagination.currentPage,
            paginationLink: 'orders',
            ordersList: orders.map(order => orderPresenter.toListRow(order)),
        });
    };

    readonly details = async (req: Request, res: Response): Promise<void> => {
        const order = await Order.findByPk(req.params.orderId, {
            include: [{
                model: OrderDetail,
                as: 'details',
                include: [{ model: Product, as: 'product', attributes: ['name', 'price', 'discount_value', 'discount_end_date'] }],
            }],
        });

        if (!order) {
            return ApiResponse.fail(res, 'errors.common_error');
        }

        ApiResponse.success(res, {
            htmlResponse: new OrderPresenter(req.language, res.locals.priceFormat).renderDetailsHtml(order),
        });
    };

    /** A closed (done / canceled) order gets the closing date too */
    readonly changeStatus = async (req: Request, res: Response): Promise<void> => {
        const newStatus: unknown = req.body.new_status;

        if (!Order.isValidStatus(newStatus)) {
            return ApiResponse.fail(res, 'errors.unprocessable_data');
        }

        const order = await Order.findByPk(req.params.orderId);

        if (!order) {
            return ApiResponse.fail(res, 'errors.unprocessable_data');
        }

        const previousStatus = order.order_status;

        await order.update({
            order_status: newStatus,
            ...(Order.isClosedStatus(newStatus) && { closed_order_at: new Date() }),
        });

        await Logger.info('Order status changed', `${order.order_id}: ${previousStatus} -> ${newStatus}`);
        ApiResponse.success(res);
    };

    readonly delete = async (req: Request, res: Response): Promise<void> => {
        const deletedCount = await Order.destroy({ where: { order_id: req.params.orderId } });

        this.respondDeleted(res, deletedCount);
    };
}
