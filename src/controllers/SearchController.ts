import type { Request, Response } from 'express';
import { appConfig } from '../config/app';
import { env } from '../config/env';
import { ApiResponse } from '../http/ApiResponse';
import { MetaBuilder } from '../http/MetaBuilder';
import type { Language } from '../locales';
import type { Article, Gallery, Product } from '../models';
import { ArticlePresenter } from '../presenters/ArticlePresenter';
import { GalleryPresenter } from '../presenters/GalleryPresenter';
import { SearchService } from '../services/SearchService';
import { ImageUrl } from '../utils/ImageUrl';
import { LocalizedField } from '../utils/LocalizedField';
import { Translator } from '../utils/Translator';
import { Controller } from './Controller';

interface QuickSearchItem {
    url: string;
    title: string | null;
    image: string | null;
    subtitle?: string | null;
}

export class SearchController extends Controller {
    constructor(private readonly searchService = new SearchService()) {
        super();
    }

    readonly show = async (req: Request, res: Response): Promise<void> => {
        const { language } = req;
        const keywords = SearchService.parseKeywords(req.query.keywords);

        if (keywords.length === 0) {
            return res.redirect(`/${language}`);
        }

        const [products, articles, galleries] = await this.search(keywords, language);
        const productPresenter = this.productPresenter(req, res);
        const articlePresenter = new ArticlePresenter(language);
        const galleryPresenter = new GalleryPresenter(language);
        const searchText = keywords.join(' ');

        res.render('pages/search', {
            productsFound: this.toResultGroup(products.map(product => productPresenter.toSearchResult(product))),
            blogsFound: this.toResultGroup(articles.map(article => articlePresenter.toCard(article))),
            galleryFound: this.toResultGroup(galleries.map(gallery => galleryPresenter.toCard(gallery))),
            keywords: searchText,
            meta: MetaBuilder.page(language, {
                title: req.translate('general.search'),
                description: req.translate('general.search'),
                path: `${req.translate('slugs.search')}?keywords=${encodeURIComponent(searchText)}`,
            }),
        });
    };

    /** Search box dropdown, returns ready-made HTML for every result group */
    readonly quickSearch = async (req: Request, res: Response): Promise<void> => {
        const { language } = req;
        const keywords = SearchService.parseKeywords(req.body.keywords);

        if (keywords.length === 0) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        const [products, articles, galleries] = await this.search(keywords, language, appConfig.listLimits.quickSearchResults);

        ApiResponse.success(res, {
            productsHtml: this.renderQuickResults(
                products.map(product => this.toQuickProduct(product, language)),
                'products.no_product_like_this',
                language,
                false,
            ),
            blogsHtml: this.renderQuickResults(
                articles.map(article => this.toQuickArticle(article, language)),
                'products.no_blogs_like_this',
                language,
            ),
            galleriesHtml: this.renderQuickResults(
                galleries.map(gallery => this.toQuickGallery(gallery, language)),
                'products.no_gallery_like_this',
                language,
            ),
        });
    };

    private search(keywords: string[], language: Language, limit?: number): Promise<[Product[], Article[], Gallery[]]> {
        const options = { language, limit };

        return Promise.all([
            this.searchService.findProducts(keywords, options),
            this.searchService.findArticles(keywords, options),
            this.searchService.findGalleries(keywords, options),
        ]);
    }

    private toResultGroup<TResult>(results: TResult[]) {
        return { count: results.length, results };
    }

    private toQuickProduct(product: Product, language: Language): QuickSearchItem {
        return {
            url: this.detailsUrl('slugs.product', product.slug, product.id, language),
            title: LocalizedField.pick(product.name, language),
            image: ImageUrl.of(product.image_thumbnail, 'products'),
            subtitle: LocalizedField.pick(product.category?.name, language),
        };
    }

    private toQuickArticle(article: Article, language: Language): QuickSearchItem {
        return {
            url: this.detailsUrl('slugs.article', article.slug, article.id, language),
            title: LocalizedField.pick(article.title, language),
            image: ImageUrl.of(article.image_thumbnail, 'blogs'),
        };
    }

    private toQuickGallery(gallery: Gallery, language: Language): QuickSearchItem {
        return {
            url: this.detailsUrl('slugs.gallery', gallery.slug, gallery.id, language),
            title: LocalizedField.pick(gallery.gallery_name, language),
            image: ImageUrl.of(gallery.gallery_thumbnail, 'galleries'),
        };
    }

    /** e.g. https://example.com/en/product/my-product/12 */
    private detailsUrl(routeSlugKey: string, slugJson: string | null, id: number, language: Language): string {
        const routeSlug = Translator.translate(routeSlugKey, language);
        return `${env.appUrl}/${language}/${routeSlug}/${LocalizedField.pick(slugJson, language)}/${id}`;
    }

    private renderQuickResults(items: QuickSearchItem[], emptyMessageKey: string, language: Language, isWrapped = true): string {
        if (items.length === 0) {
            return `<div class="search__not-found" style="margin-bottom: 20px;">${Translator.translate(emptyMessageKey, language)}</div>`;
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

            return isWrapped ? `<div style="margin-bottom: 10px;">${link}</div>` : link;
        }).join('');
    }
}
