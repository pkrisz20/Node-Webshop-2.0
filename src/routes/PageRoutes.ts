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
 * when the slug segment is not the translation of the route's own slug.
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

        const page = PageContextMiddleware.load;

        this.router.get('/:lang', page, asyncHandler(home.show));

        this.router.get('/:lang/:slug', SlugGuard.matches('slugs.about_us'), page, asyncHandler(employees.index));
        this.router.get('/:lang/:slug', SlugGuard.matches('slugs.contact'), page, asyncHandler(contact.show));
        this.router.get('/:lang/:slug', SlugGuard.matches('slugs.cart'), page, asyncHandler(orders.show));
        this.router.get('/:lang/:slug', SlugGuard.matches('slugs.search'), page, asyncHandler(search.show));
        this.router.get('/:lang/:slug', SlugGuard.matches('slugs.faq'), page, asyncHandler(staticContents.faq));
        this.router.get('/:lang/:slug/:routeName', SlugGuard.matches('slugs.content'), page, asyncHandler(staticContents.page));

        this.router.get('/:lang/:slug', SlugGuard.matches('slugs.products'), page, asyncHandler(products.index));
        this.router.get('/:lang/:slug', SlugGuard.matches('slugs.wishlist'), page, asyncHandler(wishlist.show));
        this.router.get('/:lang/:categorySlug/:slug/:categoryId', SlugGuard.matches('slugs.products'), page, asyncHandler(products.category));
        this.router.get('/:lang/:slug/:slugName/:productId', SlugGuard.matches('slugs.product'), page, asyncHandler(products.show));

        this.router.get('/:lang/:slug', SlugGuard.matches('slugs.galleries'), page, asyncHandler(galleries.index));
        this.router.get('/:lang/:slug/:slugName/:galleryId', SlugGuard.matches('slugs.gallery'), page, asyncHandler(galleries.show));

        this.router.get('/:lang/:slug', SlugGuard.matches('slugs.blogs'), page, asyncHandler(blogs.index));
        this.router.get('/:lang/:slug/:slugName/:articleId', SlugGuard.matches('slugs.article'), page, asyncHandler(blogs.show));
    }
}
