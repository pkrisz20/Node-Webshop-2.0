import type { Request, Response } from 'express';
import { ApiResponse } from '../../http/ApiResponse';
import { ErrorPage } from '../../http/ErrorPage';
import { Order, OrderDetail, Product } from '../../models';
import { OrderPresenter } from '../../presenters/OrderPresenter';
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

        res.render('admin/orders/list', {
            meta: this.meta('Admin orders list page', 'This is the orders list page'),
            pageCount: pagination.pageCount(count),
            currentPage: pagination.currentPage,
            paginationLink: 'orders',
            ordersList: orders.map(order => OrderPresenter.toListRow(order, res.locals.priceFormat)),
        });
    };

    readonly details = async (req: Request, res: Response): Promise<void> => {
        const order = await Order.findByPk(req.params.orderId, {
            include: [{
                model: OrderDetail,
                as: 'details',
                include: [{ model: Product, as: 'product', attributes: ['name', 'price', 'discount_value'] }],
            }],
        });

        if (!order) {
            return ApiResponse.fail(res, 'errors.common_error');
        }

        ApiResponse.success(res, {
            htmlResponse: OrderPresenter.renderDetailsHtml(order, { language: req.language, priceFormat: res.locals.priceFormat }),
        });
    };

    /** A closed (done / canceled) order gets the closing date too */
    readonly changeStatus = async (req: Request, res: Response): Promise<void> => {
        const newStatus: unknown = req.body.new_status;
        const order = Order.isValidStatus(newStatus) ? await Order.findByPk(req.params.orderId) : null;

        if (!order || !Order.isValidStatus(newStatus)) {
            return ApiResponse.fail(res, 'errors.unprocessable_data');
        }

        await order.update({
            order_status: newStatus,
            ...(Order.isClosingStatus(newStatus) && { closed_order_at: new Date() }),
        });

        ApiResponse.success(res);
    };

    readonly delete = async (req: Request, res: Response): Promise<void> => {
        const deletedCount = await Order.destroy({ where: { order_id: req.params.orderId } });

        this.respondDeleted(res, deletedCount);
    };
}
