import type { NextFunction, Request, Response } from 'express';
import type { Language } from '../locales';
import { StaticContent, WebshopCategory } from '../models';
import { CartPresenter } from '../presenters/CartPresenter';
import { CategoryPresenter } from '../presenters/CategoryPresenter';
import { CartService } from '../services/CartService';
import { SiteConfigService } from '../services/SiteConfigService';
import { WishlistService } from '../services/WishlistService';
import { LocalizedField } from '../utils/LocalizedField';
import { PriceFormatMiddleware } from './PriceFormatMiddleware';

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
    constructor(
        private readonly siteConfigService = new SiteConfigService(),
        private readonly cartService = new CartService(),
        private readonly wishlistService = new WishlistService(),
    ) {}

    readonly load = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { language } = req;

            const [siteConfig, categories, staticContentLinks, hasRemovedCartItems, wishlistProductIds] = await Promise.all([
                this.siteConfigService.loadForLanguage(language),
                this.loadCategories(language),
                this.loadStaticContentLinks(language),
                this.cartService.refresh(req.session, language),
                this.wishlistService.removeInactiveProducts(req.session),
            ]);

            const priceFormat = SiteConfigService.priceFormatOf(siteConfig);
            PriceFormatMiddleware.setPriceFormat(res, priceFormat);

            res.locals.DB_CONFIG = siteConfig;
            res.locals.webshopCategories = categories;
            res.locals.staticContent = staticContentLinks;
            res.locals.hasRemovedCartItems = hasRemovedCartItems;
            res.locals.cart = new CartPresenter(language, priceFormat).toView(req.session);
            res.locals.wishlistTotalNumber = wishlistProductIds.length;

            next();
        }
        catch (error) {
            next(error);
        }
    };

    private async loadCategories(language: Language) {
        const categories = await WebshopCategory.findAll({ attributes: ['id', 'name', 'slug', 'image'] });
        const categoryPresenter = new CategoryPresenter(language);

        return categories.map(category => categoryPresenter.toMenuItem(category));
    }

    /** Static contents keyed by their content name, e.g. `staticContent.terms_of_use.slug` */
    private async loadStaticContentLinks(language: Language): Promise<Record<string, StaticContentLink>> {
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
