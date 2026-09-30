import type { NextFunction, Request, Response } from 'express';
import type { Language } from '../locales';
import { StaticContent, WebshopCategory } from '../models';
import { CartPresenter } from '../presenters/CartPresenter';
import { CartService } from '../services/CartService';
import { SiteConfigService } from '../services/SiteConfigService';
import { WishlistService } from '../services/WishlistService';
import { PriceFormatMiddleware } from './PriceFormatMiddleware';
import { ImageUrl } from '../utils/ImageUrl';
import { LocalizedField } from '../utils/LocalizedField';

interface StaticContentLink {
    id: number;
    title: string | null;
    slug: string | null;
}

/**
 * Loads the data shared by every public page layout (header, footer, mini cart):
 * site settings, categories, static content links, refreshed cart and wishlist counter.
 */
export class PageContextMiddleware {
    private static readonly siteConfigService = new SiteConfigService();
    private static readonly cartService = new CartService();
    private static readonly wishlistService = new WishlistService();

    static async load(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { language } = req;

            const [siteConfig, categories, staticContents, hasRemovedCartItems, wishlist] = await Promise.all([
                PageContextMiddleware.siteConfigService.loadForLanguage(language),
                PageContextMiddleware.loadCategories(language),
                PageContextMiddleware.loadStaticContentLinks(language),
                PageContextMiddleware.cartService.refresh(req.session, language),
                PageContextMiddleware.wishlistService.keepActiveProducts(req.session),
            ]);

            const priceFormat = SiteConfigService.priceFormatOf(siteConfig);
            PriceFormatMiddleware.apply(res, priceFormat);

            res.locals.DB_CONFIG = siteConfig;
            res.locals.webshopCategories = categories;
            res.locals.staticContent = staticContents;
            res.locals.showPopupCartInformation = hasRemovedCartItems;
            res.locals.cart = new CartPresenter(language, priceFormat).toView(req.session);
            res.locals.wishlistTotalNumber = wishlist.length;

            next();
        }
        catch (error) {
            next(error);
        }
    }

    private static async loadCategories(language: Language) {
        const categories = await WebshopCategory.findAll({ attributes: ['id', 'name', 'slug', 'image'] });

        return categories.map(category => ({
            id: category.id,
            name: LocalizedField.pick(category.name, language),
            category_image: ImageUrl.of(category.image, 'categories'),
            category_slug: LocalizedField.pick(category.slug, language),
        }));
    }

    /** Static contents keyed by their content name, e.g. `staticContent.terms_of_use.slug` */
    private static async loadStaticContentLinks(language: Language): Promise<Record<string, StaticContentLink>> {
        const contents = await StaticContent.findAll({ attributes: ['id', 'title', 'slug', 'content_name'] });

        return Object.fromEntries(contents.map(content => [
            content.content_name ?? String(content.id),
            {
                id: content.id,
                title: LocalizedField.pick(content.title, language),
                slug: LocalizedField.pick(content.slug, language),
            },
        ]));
    }
}
