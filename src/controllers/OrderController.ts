import type { Request, Response } from 'express';
import { env } from '../config/env';
import { ApiResponse } from '../http/ApiResponse';
import { MetaBuilder } from '../http/MetaBuilder';
import { CartPresenter } from '../presenters/CartPresenter';
import { CartService } from '../services/CartService';
import { OrderService, type CustomerData } from '../services/OrderService';
import { Controller } from './Controller';

export class OrderController extends Controller {
    constructor(
        private readonly orderService = new OrderService(),
        private readonly cartService = new CartService(),
    ) {
        super();
    }

    /** Cart summary and the order form */
    readonly show = (req: Request, res: Response): void => {
        const title = req.translate('orders.order');

        res.render('pages/order', {
            // The template formats the prices itself, because it also multiplies them by the quantities
            cart: new CartPresenter(req.language, res.locals.priceFormat).toView(req.session, { formatItemPrices: false }),
            meta: MetaBuilder.page(req.language, {
                title,
                description: title,
                path: req.translate('slugs.cart'),
            }),
        });
    };

    // TODO: confirmation e-mails to the customer and the admin (see the git history of controllers/OrdersController.js)
    readonly store = async (req: Request, res: Response): Promise<void> => {
        const order = await this.orderService.placeOrder(CartService.items(req.session), req.body as CustomerData);

        if (!order) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        this.cartService.clear(req.session);

        ApiResponse.success(res, {
            title: req.translate('general.process_success'),
            message: req.translate('orders.order_succes_message'),
            redirect_url: `${env.appUrl}/${req.language}/${req.translate('slugs.products')}`,
        });
    };
}
