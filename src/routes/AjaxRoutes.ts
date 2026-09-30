import { BlogController } from '../controllers/BlogController';
import { CartController } from '../controllers/CartController';
import { ContactController } from '../controllers/ContactController';
import { OrderController } from '../controllers/OrderController';
import { ProductController } from '../controllers/ProductController';
import { SearchController } from '../controllers/SearchController';
import { StaticContentController } from '../controllers/StaticContentController';
import { WishlistController } from '../controllers/WishlistController';
import { asyncHandler } from '../http/asyncHandler';
import { PriceFormatMiddleware } from '../middleware/PriceFormatMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import { commentSchema, contactSchema, orderSchema } from '../validations/schemas';
import { RouteGroup } from './RouteGroup';

/** JSON endpoints of the public pages, mounted on `/ajax` */
export class AjaxRoutes extends RouteGroup {
    protected registerRoutes(): void {
        const products = new ProductController();
        const wishlist = new WishlistController();
        const cart = new CartController();
        const blogs = new BlogController();
        const search = new SearchController();
        const contact = new ContactController();
        const orders = new OrderController();
        const staticContents = new StaticContentController();

        this.router.get('/products/search', asyncHandler(products.filter));
        this.router.post('/product/comment/load-more', asyncHandler(products.loadMoreComments));
        this.router.post('/product/comment/:itemId', ValidationMiddleware.body(commentSchema), asyncHandler(products.storeComment));
        this.router.post('/wishlist-handle/:productId', asyncHandler(wishlist.toggle));

        // The cart responses contain formatted prices, so they need the price display of the admin settings
        this.router.post('/cart/add', PriceFormatMiddleware.share, asyncHandler(cart.add));
        this.router.post('/cart/update', PriceFormatMiddleware.share, asyncHandler(cart.update));
        this.router.post('/cart/delete', PriceFormatMiddleware.share, asyncHandler(cart.remove));

        this.router.post('/blog/comment/load-more', asyncHandler(blogs.loadMoreComments));
        this.router.post('/blog/comment/:itemId', ValidationMiddleware.body(commentSchema), asyncHandler(blogs.storeComment));

        this.router.post('/search', asyncHandler(search.quickSearch));
        this.router.post('/contact/handle', ValidationMiddleware.body(contactSchema), asyncHandler(contact.store));
        this.router.post('/order/handle', ValidationMiddleware.body(orderSchema), asyncHandler(orders.store));
        this.router.post('/gdpr/handle', asyncHandler(staticContents.saveCookieConsent));
    }
}
