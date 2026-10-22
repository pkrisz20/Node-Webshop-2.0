import type { Request, Response } from 'express';
import type { CreationAttributes } from 'sequelize';
import { appConfig } from '../../config/app';
import { Database } from '../../database/Database';
import { ApiResponse } from '../../http/ApiResponse';
import { ErrorPage } from '../../http/ErrorPage';
import { FormInput } from '../../http/FormInput';
import type { Language } from '../../locales';
import { Product, ProductComment, ProductParameter, WebshopCategory, WebshopParameter } from '../../models';
import { DateFormatter } from '../../utils/DateFormatter';
import { ImageUrl } from '../../utils/ImageUrl';
import { LocalizedField } from '../../utils/LocalizedField';
import { Slug } from '../../utils/Slug';
import { TextFormatter } from '../../utils/TextFormatter';
import { AdminController } from './AdminController';

type ProductAttributes = Omit<CreationAttributes<Product>, 'id' | 'created_at' | 'updated_at'>;

interface ProductForm {
    attributes: ProductAttributes;
    parameterValues: Array<{ parameter_id: number; parameter_value: string }>;
}

const PRODUCT_FLAGS = ['is_active', 'is_featured', 'is_available', 'is_delivered', 'is_new', 'comments_allowed'] as const;

export class AdminProductController extends AdminController {
    readonly index = async (req: Request, res: Response): Promise<void> => {
        const pagination = this.pagination(req);

        if (!pagination) {
            return ErrorPage.badRequest(req, res);
        }

        const { rows: products, count } = await Product.findAndCountAll({
            attributes: ['id', 'name', 'discount_value', 'discount_end_date', 'is_active', 'created_at', 'updated_at'],
            include: [{ model: WebshopCategory, as: 'category', attributes: ['name'], required: true }],
            order: [['id', 'DESC']],
            limit: pagination.limit,
            offset: pagination.offset,
        });

        res.render('admin/products/list', {
            meta: this.meta('Admin products', 'This is the products list page'),
            pageCount: pagination.pageCount(count),
            currentPage: pagination.currentPage,
            paginationLink: 'products',
            webshopProducts: products.map(product => ({
                productId: product.id,
                productName: TextFormatter.limitText(LocalizedField.pick(product.name, req.language), appConfig.textLengths.adminListTitle),
                isOnDiscount: this.activityIcon(product.hasActiveDiscount()),
                is_active: this.activityIcon(product.is_active),
                date: this.lastModified(product),
                productCategory: LocalizedField.pick(product.category?.name, req.language),
            })),
        });
    };

    readonly create = async (req: Request, res: Response): Promise<void> => {
        const [categories, parameters] = await Promise.all([this.categoryOptions(req.language), this.parameterOptions(req.language)]);

        res.render('admin/products/new', {
            webshopCategories: categories,
            webshopParameters: parameters,
            meta: this.meta('Új termék', 'This is the product upload page'),
        });
    };

    readonly store = async (req: Request, res: Response): Promise<void> => {
        const form = this.parseForm(req.body);

        if (!form) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        const product = await Database.sequelize.transaction(async transaction => {
            const createdProduct = await Product.create(form.attributes, { transaction });
            await ProductParameter.bulkCreate(
                form.parameterValues.map(value => ({ ...value, product_id: createdProduct.id })),
                { transaction },
            );

            return createdProduct;
        });

        this.respondSaved(res, `/admin/products/edit/${product.id}`);
    };

    readonly edit = async (req: Request, res: Response): Promise<void> => {
        const productId = this.parseId(req.params.productId);

        if (!productId) {
            return ErrorPage.badRequest(req, res);
        }

        const product = await Product.findByPk(productId, {
            include: [{ model: ProductParameter, as: 'parameterValues' }],
        });

        if (!product) {
            return res.redirect('/admin/products/new');
        }

        const [categories, parameters] = await Promise.all([this.categoryOptions(req.language), this.parameterOptions(req.language)]);
        const existingParameterIds = new Set(parameters.map(parameter => parameter.id));

        res.render('admin/products/edit', {
            formValues: {
                ...LocalizedField.toFormValues({
                    name: product.name,
                    short_description: product.short_description,
                    description: product.description,
                }),
                id: product.id,
                images: ImageUrl.listOf(product.images, 'products'),
                image_thumbnail: ImageUrl.of(product.image_thumbnail, 'products'),
                price: Math.trunc(product.price),
                discount_value: product.discount_value != null ? Math.trunc(product.discount_value) : null,
                discount_end_date: DateFormatter.toDateString(product.discount_end_date),
                is_active: product.is_active,
                is_featured: product.is_featured,
                is_available: product.is_available,
                is_delivered: product.is_delivered,
                is_new: product.is_new,
                is_allowed: product.comments_allowed,
                max_order_count: product.max_order_count,
                category_id: product.category_id,
                allWebshopParameters: parameters,
            },
            productHasParameters: (product.parameterValues ?? [])
                .filter(parameterValue => existingParameterIds.has(parameterValue.parameter_id))
                .map(parameterValue => ({
                    id: parameterValue.parameter_id,
                    values: LocalizedField.parse(parameterValue.parameter_value) ?? {},
                })),
            webshopCategories: categories,
            meta: this.meta('Szerkesztés', 'This is the product edit page'),
        });
    };

    /** Updates the product and replaces all of its parameter values */
    readonly update = async (req: Request, res: Response): Promise<void> => {
        const productId = this.parseId(req.params.productId);
        const form = this.parseForm(req.body);
        const product = productId && form ? await Product.findByPk(productId) : null;

        if (!product || !form) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        await Database.sequelize.transaction(async transaction => {
            await product.update(form.attributes, { transaction });
            await ProductParameter.destroy({ where: { product_id: product.id }, transaction });
            await ProductParameter.bulkCreate(
                form.parameterValues.map(value => ({ ...value, product_id: product.id })),
                { transaction },
            );
        });

        this.respondSaved(res, `/admin/products/edit/${product.id}`);
    };

    readonly comments = async (req: Request, res: Response): Promise<void> => {
        const pagination = this.pagination(req);

        if (!pagination) {
            return ErrorPage.badRequest(req, res);
        }

        const { rows, count } = await ProductComment.findAndCountAll({
            include: [{ model: Product, as: 'product', attributes: ['name', 'slug', 'is_active'], required: true }],
            order: [['id', 'DESC']],
            limit: pagination.limit,
            offset: pagination.offset,
        });

        const comments = rows.map(comment => ({
            comment_id: comment.id,
            author_name: comment.name,
            email: comment.email,
            comment_text: comment.comment,
            is_active: comment.is_active,
            date: DateFormatter.toAdminDateTime(comment.date),
            isActive: this.activityIcon(comment.is_active),
            isVerified: this.activityIcon(comment.is_verified_purchase),
            isVerifiedInteger: comment.is_verified_purchase,
            productIsActive: comment.product?.is_active,
            productName: TextFormatter.limitText(LocalizedField.pick(comment.product?.name, req.language), appConfig.textLengths.adminListTitle),
            product_slug: LocalizedField.pick(comment.product?.slug, req.language),
        }));

        res.render('admin/products/comments', {
            meta: this.meta('Admin comments list page for products', 'This is the comments list page for products'),
            pageCount: pagination.pageCount(count),
            currentPage: pagination.currentPage,
            paginationLink: 'products/comments',
            activeComments: comments.filter(comment => comment.is_active === 1),
            newComments: comments.filter(comment => comment.is_active !== 1),
        });
    };

    /** Switches the "verified purchase" badge of a comment on / off */
    readonly toggleCommentVerification = async (req: Request, res: Response): Promise<void> => {
        const commentId = this.parseId(req.params.commentId);
        const comment = commentId ? await ProductComment.findByPk(commentId) : null;

        if (!comment) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        await comment.update({ is_verified_purchase: comment.is_verified_purchase === 1 ? 0 : 1 });

        ApiResponse.success(res);
    };

    readonly deleteComment = async (req: Request, res: Response): Promise<void> => {
        const commentId = this.parseId(req.params.commentId);
        const deletedCount = commentId ? await ProductComment.destroy({ where: { id: commentId } }) : 0;

        this.respondDeleted(res, deletedCount);
    };

    private parseForm(body: Record<string, unknown>): ProductForm | null {
        const input = new FormInput(body);

        const price = input.integer('price');
        const categoryId = input.integer('category_id');
        const maxOrderCount = input.integer('max_order_count');
        const flags = input.flags(PRODUCT_FLAGS);

        if (price === null || categoryId === null || maxOrderCount === null || !flags || !input.isFilledInEveryLanguage('name')) {
            return null;
        }

        return {
            attributes: {
                name: LocalizedField.stringify(input.localized('name')),
                slug: Slug.fromTitles(input.localized('name', { escape: false })),
                short_description: LocalizedField.stringify(input.localized('short_description')),
                description: LocalizedField.stringify(input.localized('product_description', { escape: false })),
                price,
                discount_value: input.integer('discount_value'),
                discount_end_date: input.date('discount_end_date'),
                max_order_count: maxOrderCount,
                category_id: categoryId,
                ...flags,
            },
            parameterValues: this.parseParameterValues(input),
        };
    }

    /**
     * Every parameter block of the form has a random hash:
     * `webshop_parameter_id[<hash>]` and `parameter_value[<language>][<hash>]`
     */
    private parseParameterValues(input: FormInput): ProductForm['parameterValues'] {
        return input.list('parameter_hash').flatMap(hash => {
            const parameterId = this.parseId(input.raw(`webshop_parameter_id[${hash}]`));

            if (!parameterId) {
                return [];
            }

            const values = input.localizedInputs(language => `parameter_value[${language}][${hash}]`, { escape: false });

            return [{ parameter_id: parameterId, parameter_value: LocalizedField.stringify(values) }];
        });
    }

    private async categoryOptions(language: Language) {
        const categories = await WebshopCategory.findAll({ attributes: ['id', 'name'] });

        return categories.map(category => ({ id: category.id, name: LocalizedField.pick(category.name, language) }));
    }

    private async parameterOptions(language: Language) {
        const parameters = await WebshopParameter.findAll({ attributes: ['id', 'parameter_name'] });

        return parameters.map(parameter => ({
            id: parameter.id,
            parameter_name: LocalizedField.pick(parameter.parameter_name, language),
        }));
    }
}
