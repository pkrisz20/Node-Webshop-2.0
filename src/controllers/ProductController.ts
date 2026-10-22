import type { Request, Response } from 'express';
import { Op, type WhereOptions } from 'sequelize';
import { appConfig } from '../config/app';
import { env } from '../config/env';
import { ApiResponse } from '../http/ApiResponse';
import { ErrorPage } from '../http/ErrorPage';
import { MetaBuilder } from '../http/MetaBuilder';
import { Product, ProductComment, ProductParameter, WebshopCategory, WebshopParameter } from '../models';
import { CommentPresenter } from '../presenters/CommentPresenter';
import { CartService } from '../services/CartService';
import { CommentService } from '../services/CommentService';
import { LocalizedField } from '../utils/LocalizedField';
import { NumberParser } from '../utils/NumberParser';
import { Pagination } from '../utils/Pagination';
import { PublicController } from './PublicController';

interface ProductListOptions {
    where: WhereOptions<Product>;
    pagination: Pagination;
    title: string | null;
    categoryDescription: string | null;
    /** Path of the list page after the language segment, used by the pagination links */
    listPath: string;
    meta: ReturnType<typeof MetaBuilder.page>;
}

const SORT_OPTIONS = ['on_sale', 'asc_price', 'desc_price', 'alphabetical_asc', 'alphabetical_desc', 'by_date_released'];

// TODO: placeholder data of the filter sidebar until the filters are built from the webshop parameters
const PLACEHOLDER_FILTERS = [
    {
        name: 'Fajta',
        open: true,
        filters: [
            { value: 'Durok', id: 1 },
            { value: 'Pietrin', id: 2 },
            { value: 'Mangalica', id: 3 },
            { value: 'Valami', id: 4 },
            { value: 'Cica', id: 5 },
            { value: 'Macska', id: 6 },
            { value: 'Kutya', id: 7 },
        ],
    },
    {
        name: 'Meret',
        open: false,
        filters: [
            { value: 'Malac', id: 11 },
            { value: 'Hizo', id: 21 },
            { value: 'Vagasra', id: 31 },
        ],
    },
];

export class ProductController extends PublicController {
    constructor(private readonly commentService = new CommentService()) {
        super();
    }

    readonly index = async (req: Request, res: Response): Promise<void> => {
        const pagination = Pagination.fromQuery(req.query, appConfig.pagination.perPage);

        if (!pagination) {
            return ErrorPage.badRequest(req, res);
        }

        const listPath = req.translate('slugs.products');
        const title = req.translate('general.products');

        await this.renderProductList(req, res, {
            where: { is_active: 1 },
            pagination,
            title,
            categoryDescription: null,
            listPath,
            meta: MetaBuilder.page(req.language, {
                title,
                description: req.translate('meta.product_description'),
                path: listPath,
            }),
        });
    };

    readonly category = async (req: Request, res: Response): Promise<void> => {
        const { language } = req;
        const pagination = Pagination.fromQuery(req.query, appConfig.pagination.perPage);
        const categoryId = this.parseId(req.params.categoryId);

        if (!pagination || !categoryId) {
            return ErrorPage.badRequest(req, res);
        }

        const category = await WebshopCategory.findByPk(categoryId);

        if (!category) {
            return ErrorPage.notFound(req, res);
        }

        const categorySlug = LocalizedField.pick(category.slug, language);
        const listPath = `${categorySlug}/${req.translate('slugs.products')}/${category.id}`;

        if (req.params.categorySlug !== categorySlug) {
            return res.redirect(301, `${env.appUrl}/${language}/${listPath}`);
        }

        const title = LocalizedField.pick(category.name, language);
        const description = LocalizedField.pick(category.short_description, language);

        await this.renderProductList(req, res, {
            where: { is_active: 1, category_id: category.id },
            pagination,
            title,
            categoryDescription: description,
            listPath,
            meta: MetaBuilder.page(language, {
                title,
                description: description ?? req.translate('meta.product_description'),
                path: listPath,
            }),
        });
    };

    readonly show = async (req: Request, res: Response): Promise<void> => {
        const { language } = req;
        const productId = this.parseId(req.params.productId);

        const product = productId && await Product.findOne({
            where: { id: productId, is_active: 1 },
            include: [{ model: WebshopCategory, as: 'category', attributes: ['name', 'slug'], required: true }],
        });

        if (!product) {
            return ErrorPage.notFound(req, res);
        }

        const slug = LocalizedField.pick(product.slug, language);
        const productPath = `${req.translate('slugs.product')}/${slug}/${product.id}`;

        if (req.params.itemSlug !== slug) {
            return res.redirect(301, `${env.appUrl}/${language}/${productPath}`);
        }

        const [parameterValues, rating, similarProducts, commentPage] = await Promise.all([
            ProductParameter.findAll({
                where: { product_id: product.id },
                include: [{ model: WebshopParameter, as: 'parameter', attributes: ['parameter_name'], required: true }],
            }),
            this.commentService.productRating(product.id),
            Product.findAll({
                attributes: [...Product.CARD_ATTRIBUTES],
                where: { is_active: 1, category_id: product.category_id, id: { [Op.ne]: product.id } },
            }),
            product.comments_allowed ? this.commentService.productComments(product.id) : null,
        ]);

        const productPresenter = this.productPresenter(req, res);
        const commentPresenter = new CommentPresenter(language);
        const productDetails = productPresenter.toDetails(product, parameterValues, rating);

        res.render('pages/product-details', {
            productDetails,
            isAlreadyInCart: CartService.productIds(req.session).includes(product.id),
            similarProducts: similarProducts.map(similarProduct => productPresenter.toCard(similarProduct)),
            comments: commentPage?.comments.map(comment => commentPresenter.fromProductComment(comment)) ?? [],
            showLoadMoreButton: commentPage?.hasMore ?? false,
            meta: MetaBuilder.page(language, {
                title: productDetails.name,
                description: productDetails.short ?? req.translate('meta.description'),
                path: productPath,
                type: 'article',
                image: productDetails.thumbnailImage,
            }),
        });
    };

    readonly storeComment = async (req: Request, res: Response): Promise<void> => {
        const productId = this.parseId(req.params.productId);

        const product = productId && await Product.findOne({
            attributes: ['id'],
            where: { id: productId, is_active: 1, comments_allowed: 1 },
        });

        if (!product) {
            return ApiResponse.fail(res, 'errors.unprocessable_data');
        }

        const { fullName, email, comment, rating } = req.body;

        await ProductComment.create({
            name: fullName,
            email,
            comment,
            rating: NumberParser.positiveInteger(rating),
            date: new Date(),
            product_id: product.id,
        });

        ApiResponse.success(res, { title: req.translate('general.process_success') });
    };

    readonly loadMoreComments = async (req: Request, res: Response): Promise<void> => {
        const productId = this.parseId(req.body.productID);
        const page = NumberParser.nonNegativeInteger(req.body.offsetNumber);

        if (!productId || page === null) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        const { comments, hasMore } = await this.commentService.productComments(productId, page);
        const commentPresenter = new CommentPresenter(req.language);

        ApiResponse.success(res, {
            html_response_with_comments: commentPresenter.renderHtml(comments.map(comment => commentPresenter.fromProductComment(comment))),
            removeLoadButton: !hasMore,
            offsetNumber: page + 1,
        });
    };

    /** TODO: the AJAX product filtering is not implemented yet */
    readonly filter = (_req: Request, res: Response): void => {
        ApiResponse.fail(res);
    };

    private async renderProductList(req: Request, res: Response, options: ProductListOptions): Promise<void> {
        const { where, pagination } = options;

        const [{ rows: products, count }, minPrice, maxPrice] = await Promise.all([
            Product.findAndCountAll({
                attributes: [...Product.CARD_ATTRIBUTES],
                where,
                order: [['id', 'DESC']],
                limit: pagination.limit,
                offset: pagination.offset,
            }),
            Product.min('price', { where }),
            Product.max('price', { where }),
        ]);

        const productPresenter = this.productPresenter(req, res);

        res.render('pages/products', {
            validLimitValues: appConfig.pagination.productLimitOptions,
            validSortOptions: SORT_OPTIONS,
            min_price: Number(minPrice ?? 0),
            max_price: Number(maxPrice ?? 0),
            pageCount: pagination.pageCount(count),
            currentPage: pagination.currentPage,
            paginationPath: options.listPath,
            products: products.map(product => productPresenter.toCard(product)),
            productsTotalCount: count,
            webshopFilters: PLACEHOLDER_FILTERS,
            selectedFilters: [],
            main_title: options.title,
            category_short_desc: options.categoryDescription,
            meta: options.meta,
        });
    }
}
