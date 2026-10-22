import { env } from '../config/env';
import type { Article, Gallery, Product } from '../models';
import { ImageUrl } from '../utils/ImageUrl';
import { Presenter } from './Presenter';

interface QuickSearchItem {
    url: string;
    title: string | null;
    image: string | null;
    /** Printed under the title only when it is set (the category of a product) */
    subtitle?: string | null;
}

interface RenderOptions {
    emptyMessageKey: string;
    /** The article and gallery links get a spacing wrapper, the product links do not */
    wrapEachItem: boolean;
}

/** Ready-made HTML of the result groups of the search box dropdown */
export class QuickSearchPresenter extends Presenter {
    renderProducts(products: Product[]): string {
        const items = products.map(product => ({
            url: this.detailsUrl('slugs.product', product.slug, product.id),
            title: this.localized(product.name),
            image: ImageUrl.of(product.image_thumbnail, 'products'),
            subtitle: this.localized(product.category?.name),
        }));

        return this.renderItems(items, { emptyMessageKey: 'products.no_product_like_this', wrapEachItem: false });
    }

    renderArticles(articles: Article[]): string {
        const items = articles.map(article => ({
            url: this.detailsUrl('slugs.article', article.slug, article.id),
            title: this.localized(article.title),
            image: ImageUrl.of(article.image_thumbnail, 'blogs'),
        }));

        return this.renderItems(items, { emptyMessageKey: 'products.no_blogs_like_this', wrapEachItem: true });
    }

    renderGalleries(galleries: Gallery[]): string {
        const items = galleries.map(gallery => ({
            url: this.detailsUrl('slugs.gallery', gallery.slug, gallery.id),
            title: this.localized(gallery.gallery_name),
            image: ImageUrl.of(gallery.gallery_thumbnail, 'galleries'),
        }));

        return this.renderItems(items, { emptyMessageKey: 'products.no_gallery_like_this', wrapEachItem: true });
    }

    /** e.g. https://example.com/en/product/my-product/12 */
    private detailsUrl(routeSlugKey: string, slugJson: string | null, id: number): string {
        return `${env.appUrl}/${this.language}/${this.translate(routeSlugKey)}/${this.localized(slugJson)}/${id}`;
    }

    private renderItems(items: QuickSearchItem[], { emptyMessageKey, wrapEachItem }: RenderOptions): string {
        if (items.length === 0) {
            return `<div class="search__not-found" style="margin-bottom: 20px;">${this.translate(emptyMessageKey)}</div>`;
        }

        return items.map(item => {
            const link = `
                <a class="container_box" href="${item.url}" aria-label="${item.title}">
                    <div class="container_box--image">
                        <picture>
                            <source srcset="${item.image ?? ''}">
                            <img
                                class="img"
                                loading="lazy"
                                alt="${item.title}"
                                src="images/no-picture.jpg"
                                onerror="this.onerror = null;this.parentNode.children[0].srcset = this.src;"
                            />
                        </picture>
                    </div>
                    <strong class="container_box--title">${item.title}</strong>
                    ${item.subtitle !== undefined ? `<strong class="container_box--category">${item.subtitle}</strong>` : ''}
                </a>`;

            return wrapEachItem ? `<div style="margin-bottom: 10px;">${link}</div>` : link;
        }).join('');
    }
}
