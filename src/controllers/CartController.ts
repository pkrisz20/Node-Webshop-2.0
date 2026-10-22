import type { Request, Response } from 'express';
import { ApiResponse } from '../http/ApiResponse';
import { CartPresenter } from '../presenters/CartPresenter';
import { CartService } from '../services/CartService';
import { PublicController } from './PublicController';

export class CartController extends PublicController {
    constructor(private readonly cartService = new CartService()) {
        super();
    }

    readonly add = async (req: Request, res: Response): Promise<void> => {
        const { language } = req;
        const productId = this.parseId(req.body.productId);
        const quantity = this.parseId(req.body.quantity);

        if (!productId || !quantity) {
            return ApiResponse.fail(res, 'errors.unprocessable_data');
        }

        const result = await this.cartService.add(req.session, productId, quantity, language);

        if (result === 'already_in_cart') {
            return ApiResponse.error(res, {
                title: req.translate('general.information'),
                message: req.translate('orders.already_added'),
            });
        }

        if (result !== 'added') {
            return ApiResponse.fail(res, result === 'not_found' ? 'errors.common_error' : 'errors.wrong_data');
        }

        const cartPresenter = new CartPresenter(language, res.locals.priceFormat);
        const cart = cartPresenter.toView(req.session);
        const isFirstItem = cart.items.length === 1;

        ApiResponse.success(res, {
            title: req.translate('general.process_success'),
            message: req.translate('orders.added_to_cart'),
            // The first product renders the whole mini cart, the others are appended to the list
            ...(isFirstItem
                ? { cartItemsHTML: cartPresenter.renderCart(cart) }
                : { cartItemsHTML: cartPresenter.renderItems(cart.items), totalPrice: cart.totalPrice, totalCount: cart.totalCount }),
        });
    };

    readonly update = (req: Request, res: Response): void => {
        const productId = this.parseId(req.body.productId);
        const quantity = this.parseId(req.body.quantity);

        if (!productId || !quantity) {
            return ApiResponse.fail(res, 'errors.has_to_be_number');
        }

        const result = this.cartService.update(req.session, productId, quantity);

        if (!result) {
            return ApiResponse.fail(res, 'errors.unprocessable_data');
        }

        ApiResponse.success(res, {
            title: req.translate(result.wasLimited ? 'general.information' : 'general.process_success'),
            message: result.wasLimited
                ? req.translate('validations.max_quantity', result.maxQuantity ?? '')
                : req.translate('validations.cart_updated'),
            newValue: result.quantity,
            totalPrice: res.locals.priceFormat.formatAmount(result.totalPrice),
            alonePrice: res.locals.priceFormat.formatAmount(result.linePrice),
        });
    };

    readonly remove = (req: Request, res: Response): void => {
        const productId = this.parseId(req.body.productId);

        if (!productId) {
            return ApiResponse.fail(res, 'errors.unprocessable_data');
        }

        if (!this.cartService.remove(req.session, productId)) {
            return ApiResponse.fail(res);
        }

        const itemsCount = CartService.items(req.session).length;

        ApiResponse.success(res, {
            title: req.translate('general.process_success'),
            totalCount: itemsCount,
            totalPrice: res.locals.priceFormat.formatAmount(req.session.totalPrice),
            isEmpty: itemsCount === 0,
        });
    };
}
