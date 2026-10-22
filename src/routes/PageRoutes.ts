import { BlogController } from '../controllers/BlogController';
import { ContactController } from '../controllers/ContactController';
import { EmployeeController } from '../controllers/EmployeeController';
import { GalleryController } from '../controllers/GalleryController';
import { HomePageController } from '../controllers/HomePageController';
import { OrderController } from '../controllers/OrderController';
import { ProductController } from '../controllers/ProductController';
import { SearchController } from '../controllers/SearchController';
import { StaticContentController } from '../controllers/StaticContentController';
import { WishlistController } from '../controllers/WishlistController';
import { asyncHandler } from '../http/asyncHandler';
import { PageContextMiddleware } from '../middleware/PageContextMiddleware';
import { SlugGuard } from '../middleware/SlugGuard';
import { RouteGroup } from './RouteGroup';

/**
 * Public pages, every URL starts with the language.
 * The routes share the same patterns, so the order matters: `SlugGuard` passes a request to the next route
 * when the `:routeSlug` segment is not the translation of the route's own slug.
 * `:itemSlug` is the slug of the displayed record, an outdated one is redirected to the current slug.
 */
export class PageRoutes extends RouteGroup {
    protected registerRoutes(): void {
        const home = new HomePageController();
        const employees = new EmployeeController();
        const contact = new ContactController();
        const orders = new OrderController();
        const search = new SearchController();
        const staticContents = new StaticContentController();
        const products = new ProductController();
        const wishlist = new WishlistController();
        const galleries = new GalleryController();
        const blogs = new BlogController();

        const loadPageContext = new PageContextMiddleware().load;

        this.router.get('/:lang', loadPageContext, asyncHandler(home.show));

        this.router.get('/:lang/:routeSlug', SlugGuard.matches('slugs.about_us'), loadPageContext, asyncHandler(employees.index));
        this.router.get('/:lang/:routeSlug', SlugGuard.matches('slugs.contact'), loadPageContext, asyncHandler(contact.show));
        this.router.get('/:lang/:routeSlug', SlugGuard.matches('slugs.cart'), loadPageContext, asyncHandler(orders.show));
        this.router.get('/:lang/:routeSlug', SlugGuard.matches('slugs.search'), loadPageContext, asyncHandler(search.show));
        this.router.get('/:lang/:routeSlug', SlugGuard.matches('slugs.faq'), loadPageContext, asyncHandler(staticContents.faq));
        this.router.get('/:lang/:routeSlug/:contentSlug', SlugGuard.matches('slugs.content'), loadPageContext, asyncHandler(staticContents.page));

        this.router.get('/:lang/:routeSlug', SlugGuard.matches('slugs.products'), loadPageContext, asyncHandler(products.index));
        this.router.get('/:lang/:routeSlug', SlugGuard.matches('slugs.wishlist'), loadPageContext, asyncHandler(wishlist.show));
        this.router.get('/:lang/:categorySlug/:routeSlug/:categoryId', SlugGuard.matches('slugs.products'), loadPageContext, asyncHandler(products.category));
        this.router.get('/:lang/:routeSlug/:itemSlug/:productId', SlugGuard.matches('slugs.product'), loadPageContext, asyncHandler(products.show));

        this.router.get('/:lang/:routeSlug', SlugGuard.matches('slugs.galleries'), loadPageContext, asyncHandler(galleries.index));
        this.router.get('/:lang/:routeSlug/:itemSlug/:galleryId', SlugGuard.matches('slugs.gallery'), loadPageContext, asyncHandler(galleries.show));

        this.router.get('/:lang/:routeSlug', SlugGuard.matches('slugs.blogs'), loadPageContext, asyncHandler(blogs.index));
        this.router.get('/:lang/:routeSlug/:itemSlug/:articleId', SlugGuard.matches('slugs.article'), loadPageContext, asyncHandler(blogs.show));
    }
}
