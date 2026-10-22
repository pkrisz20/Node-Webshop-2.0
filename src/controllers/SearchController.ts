import type { Request, Response } from 'express';
import { appConfig } from '../config/app';
import { ApiResponse } from '../http/ApiResponse';
import { MetaBuilder } from '../http/MetaBuilder';
import type { Language } from '../locales';
import type { Article, Gallery, Product } from '../models';
import { ArticlePresenter } from '../presenters/ArticlePresenter';
import { GalleryPresenter } from '../presenters/GalleryPresenter';
import { QuickSearchPresenter } from '../presenters/QuickSearchPresenter';
import { SearchService } from '../services/SearchService';
import { PublicController } from './PublicController';

export class SearchController extends PublicController {
    constructor(private readonly searchService = new SearchService()) {
        super();
    }

    readonly show = async (req: Request, res: Response): Promise<void> => {
        const { language } = req;
        const keywords = SearchService.parseKeywords(req.query.keywords);

        if (keywords.length === 0) {
            return res.redirect(`/${language}`);
        }

        const [products, articles, galleries] = await this.findMatches(keywords, language);
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

        const [products, articles, galleries] = await this.findMatches(keywords, language, appConfig.listLimits.quickSearchResults);
        const quickSearchPresenter = new QuickSearchPresenter(language);

        ApiResponse.success(res, {
            productsHtml: quickSearchPresenter.renderProducts(products),
            blogsHtml: quickSearchPresenter.renderArticles(articles),
            galleriesHtml: quickSearchPresenter.renderGalleries(galleries),
        });
    };

    private findMatches(keywords: string[], language: Language, limit?: number): Promise<[Product[], Article[], Gallery[]]> {
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
}
