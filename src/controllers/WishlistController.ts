import type { Request, Response } from 'express';
import { Op } from 'sequelize';
import { ApiResponse } from '../http/ApiResponse';
import { MetaBuilder } from '../http/MetaBuilder';
import { Product } from '../models';
import { WishlistService } from '../services/WishlistService';
import { Controller } from './Controller';

type WishlistOperation = 'add' | 'remove';

export class WishlistController extends Controller {
    constructor(private readonly wishlistService = new WishlistService()) {
        super();
    }

    readonly show = async (req: Request, res: Response): Promise<void> => {
        const productIds = WishlistService.productIds(req.session);

        const products = productIds.length === 0 ? [] : await Product.findAll({
            attributes: [...Product.CARD_ATTRIBUTES],
            where: { id: { [Op.in]: productIds }, is_active: 1 },
            order: [['id', 'DESC']],
        });

        const productPresenter = this.productPresenter(req, res);

        res.render('pages/wishlist', {
            wishlistProducts: products.map(product => productPresenter.toCard(product)),
            wishlistTotalNumber: products.length,
            meta: MetaBuilder.page(req.language, {
                title: req.translate('general.wishlist'),
                description: req.translate('meta.wishlist_description'),
                path: req.translate('slugs.wishlist'),
            }),
        });
    };

    /** Adds or removes a product, the response tells the frontend the next available operation */
    readonly toggle = async (req: Request, res: Response): Promise<void> => {
        const productId = this.parseId(req.params.productId);
        const operation: unknown = req.body.operation;

        if (!productId || !this.isOperation(operation)) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        const isDone = operation === 'add'
            ? await this.wishlistService.add(req.session, productId)
            : this.wishlistService.remove(req.session, productId);

        if (!isDone) {
            return ApiResponse.fail(res, 'errors.common_error');
        }

        const isAdded = operation === 'add';

        ApiResponse.success(res, {
            title: req.translate(isAdded ? 'products.added_to_wishlist' : 'products.removed_from_wishlist'),
            operation: isAdded ? 'remove' : 'add',
            finishedTask: isAdded ? 'added' : 'removed',
            wishlistTotalNumber: WishlistService.productIds(req.session).length,
        });
    };

    private isOperation(value: unknown): value is WishlistOperation {
        return value === 'add' || value === 'remove';
    }
}
