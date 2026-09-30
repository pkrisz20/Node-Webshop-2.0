import type { Request, Response } from 'express';
import { loginRateLimit } from '../config/rateLimit';
import { AdminBlogController } from '../controllers/admin/AdminBlogController';
import { AdminCategoryController } from '../controllers/admin/AdminCategoryController';
import { AdminFaqController } from '../controllers/admin/AdminFaqController';
import { AdminGalleryController } from '../controllers/admin/AdminGalleryController';
import { AdminMessageController } from '../controllers/admin/AdminMessageController';
import { AdminOrderController } from '../controllers/admin/AdminOrderController';
import { AdminParameterController } from '../controllers/admin/AdminParameterController';
import { AdminProductController } from '../controllers/admin/AdminProductController';
import { AdminSliderController } from '../controllers/admin/AdminSliderController';
import { AdminStaticContentController } from '../controllers/admin/AdminStaticContentController';
import { AuthController } from '../controllers/admin/AuthController';
import { DashboardController } from '../controllers/admin/DashboardController';
import { ImageController } from '../controllers/admin/ImageController';
import { SettingsController } from '../controllers/admin/SettingsController';
import { asyncHandler } from '../http/asyncHandler';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { CsrfMiddleware } from '../middleware/CsrfMiddleware';
import { LocaleMiddleware } from '../middleware/LocaleMiddleware';
import { PriceFormatMiddleware } from '../middleware/PriceFormatMiddleware';
import { RouteGroup } from './RouteGroup';

type Handler = (req: Request, res: Response) => unknown;

/** Admin pages and endpoints, mounted on `/admin` */
export class AdminRoutes extends RouteGroup {
    protected registerRoutes(): void {
        const auth = new AuthController();
        const dashboard = new DashboardController();

        this.router.use(LocaleMiddleware.admin);

        this.router.get('/', asyncHandler(dashboard.loginPage));
        this.router.post('/login', loginRateLimit, asyncHandler(auth.login));

        // Every route below requires a logged in admin
        this.router.use(AuthMiddleware.requireAdmin);
        this.router.use(PriceFormatMiddleware.share);

        this.action('/logout', auth.logout);
        this.router.get('/dashboard', asyncHandler(dashboard.dashboard));
        this.router.get('/statistics', asyncHandler(dashboard.statistics));

        this.registerImageRoutes();
        this.registerSettingsRoutes();
        this.registerProductRoutes();
        this.registerCategoryRoutes();
        this.registerParameterRoutes();
        this.registerOrderRoutes();
        this.registerBlogRoutes();
        this.registerGalleryRoutes();
        this.registerSliderRoutes();
        this.registerFaqRoutes();
        this.registerStaticContentRoutes();
        this.registerMessageRoutes();
    }

    /**
     * GET endpoint which changes data (called by admin.js with the `X-CSRF-TOKEN` header).
     * The CSRF middleware skips the GET requests, so the token is checked here explicitly.
     */
    private action(path: string, handler: Handler): void {
        this.router.get(path, CsrfMiddleware.verify, asyncHandler(handler));
    }

    private registerImageRoutes(): void {
        const images = new ImageController();

        this.router.post('/single-upload/:folder', asyncHandler(images.uploadSingle));
        this.router.post('/multiple-upload/:folder', asyncHandler(images.uploadMultiple));
        this.router.post('/delete-image/:folder', asyncHandler(images.delete));
    }

    private registerSettingsRoutes(): void {
        const settings = new SettingsController();

        this.router.get('/settings', asyncHandler(settings.edit));
        this.router.post('/settings/handle', asyncHandler(settings.update));
    }

    private registerProductRoutes(): void {
        const products = new AdminProductController();

        this.router.get('/products/list', asyncHandler(products.index));
        this.router.get('/products/new', asyncHandler(products.create));
        this.router.post('/products/new/handle', asyncHandler(products.store));
        this.router.get('/products/edit/:productId', asyncHandler(products.edit));
        this.router.post('/products/edit/handle/:productId', asyncHandler(products.update));

        this.router.get('/products/comments/list', asyncHandler(products.comments));
        this.router.post('/products/comments/verify/:commentId', asyncHandler(products.toggleCommentVerification));
        this.action('/products/comments/delete/:commentId', products.deleteComment);
    }

    private registerCategoryRoutes(): void {
        const categories = new AdminCategoryController();

        this.router.get('/category/list', asyncHandler(categories.index));
        this.router.get('/category/new', asyncHandler(categories.create));
        this.router.post('/category/new/handle', asyncHandler(categories.store));
        this.router.get('/category/edit/:categoryId', asyncHandler(categories.edit));
        this.router.post('/category/edit/handle/:categoryId', asyncHandler(categories.update));
        this.action('/category/delete/:categoryId', categories.delete);
    }

    private registerParameterRoutes(): void {
        const parameters = new AdminParameterController();

        this.router.get('/webshop-params/list', asyncHandler(parameters.index));
        this.router.get('/webshop-params/new', asyncHandler(parameters.create));
        this.router.post('/webshop-params/new/handle', asyncHandler(parameters.store));
        this.router.get('/webshop-params/edit/:paramId', asyncHandler(parameters.edit));
        this.router.post('/webshop-params/edit/handle/:paramId', asyncHandler(parameters.update));
        this.action('/webshop-params/delete/:paramId', parameters.delete);
    }

    private registerOrderRoutes(): void {
        const orders = new AdminOrderController();

        this.router.get('/orders/list', asyncHandler(orders.index));
        this.router.get('/order/get-info/:orderId', asyncHandler(orders.details));
        this.router.post('/order/change-status/:orderId', asyncHandler(orders.changeStatus));
        this.action('/order/delete/:orderId', orders.delete);
    }

    private registerBlogRoutes(): void {
        const blogs = new AdminBlogController();

        this.router.get('/blogs/list', asyncHandler(blogs.index));
        this.router.get('/events/list', asyncHandler(blogs.events));
        this.router.get('/blogs/new', asyncHandler(blogs.create));
        this.router.post('/blogs/new/handle', asyncHandler(blogs.store));
        this.router.get('/blogs/edit/:articleId', asyncHandler(blogs.edit));
        this.router.post('/blogs/edit/handle/:articleId', asyncHandler(blogs.update));

        this.router.get('/blogs/comments/list', asyncHandler(blogs.comments));
        this.action('/blogs/comments/delete/:commentId', blogs.deleteComment);
    }

    private registerGalleryRoutes(): void {
        const galleries = new AdminGalleryController();

        this.router.get('/gallery/list', asyncHandler(galleries.index));
        this.router.get('/gallery/new', asyncHandler(galleries.create));
        this.router.post('/gallery/new/handle', asyncHandler(galleries.store));
        this.router.get('/gallery/edit/:galleryId', asyncHandler(galleries.edit));
        this.router.post('/gallery/edit/handle/:galleryId', asyncHandler(galleries.update));
        this.action('/gallery/delete/:galleryId', galleries.delete);
    }

    private registerSliderRoutes(): void {
        const sliders = new AdminSliderController();

        this.router.get('/sliders/list', asyncHandler(sliders.index));
        this.router.get('/slider/new', asyncHandler(sliders.create));
        this.router.post('/slider/new/handle', asyncHandler(sliders.store));
        this.router.get('/slider/edit/:sliderId', asyncHandler(sliders.edit));
        this.router.post('/slider/edit/handle/:sliderId', asyncHandler(sliders.update));
        this.action('/sliders/delete/:sliderId', sliders.delete);
    }

    private registerFaqRoutes(): void {
        const faq = new AdminFaqController();

        this.router.get('/faq/list', asyncHandler(faq.index));
        this.router.get('/faq/new', asyncHandler(faq.create));
        this.router.post('/faq/new/handle', asyncHandler(faq.store));
        this.router.get('/faq/edit/:faqId', asyncHandler(faq.edit));
        this.router.post('/faq/edit/handle/:faqId', asyncHandler(faq.update));
        this.action('/faq/delete/:faqId', faq.delete);
    }

    private registerStaticContentRoutes(): void {
        const staticContents = new AdminStaticContentController();

        this.router.get('/static-contents/list', asyncHandler(staticContents.index));
        this.router.get('/static-contents/edit/:staticContentID', asyncHandler(staticContents.edit));
        this.router.post('/static-contents/edit/handle/:staticContentID', asyncHandler(staticContents.update));
    }

    private registerMessageRoutes(): void {
        const messages = new AdminMessageController();

        this.router.get('/messages/list', asyncHandler(messages.index));
        this.router.get('/messages/details/:messageId', asyncHandler(messages.details));
        this.action('/messages/delete/:messageId', messages.delete);
    }
}
