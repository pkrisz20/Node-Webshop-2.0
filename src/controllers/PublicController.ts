import type { Request, Response } from 'express';
import { ProductPresenter } from '../presenters/ProductPresenter';
import { CartService } from '../services/CartService';
import { WishlistService } from '../services/WishlistService';
import { Controller } from './Controller';

/**
 * Base class of the public page controllers.
 * The language comes from `req.language` / `req.translate()`, the CSRF token is added by `ApiResponse`.
 */
export abstract class PublicController extends Controller {
    /** Product card presenter aware of the visitor's cart, wishlist and the price display of the admin settings */
    protected productPresenter(req: Request, res: Response): ProductPresenter {
        return new ProductPresenter({
            language: req.language,
            priceFormat: res.locals.priceFormat,
            cartProductIds: CartService.productIds(req.session),
            wishlistProductIds: WishlistService.productIds(req.session),
        });
    }
}
