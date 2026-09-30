import type { Request, Response } from 'express';
import type { CreationAttributes } from 'sequelize';
import { ApiResponse } from '../../http/ApiResponse';
import { ErrorPage } from '../../http/ErrorPage';
import { FormInput } from '../../http/FormInput';
import { WebshopCategory } from '../../models';
import { ImageUrl } from '../../utils/ImageUrl';
import { LocalizedField } from '../../utils/LocalizedField';
import { Slug } from '../../utils/Slug';
import { AdminController } from './AdminController';

type CategoryAttributes = Omit<CreationAttributes<WebshopCategory>, 'id' | 'created_at' | 'updated_at'>;

export class AdminCategoryController extends AdminController {
    readonly index = async (req: Request, res: Response): Promise<void> => {
        const categories = await WebshopCategory.findAll({
            attributes: [
                'id',
                'name',
                'created_at',
                'updated_at',
                [WebshopCategory.sequelize!.literal('(SELECT COUNT(products.id) FROM products WHERE products.category_id = WebshopCategory.id)'), 'products_count'],
            ],
        });

        res.render('admin/categories/list', {
            meta: this.meta('Admin category list page', 'This is the Webshop category list page'),
            webshopCategories: categories.map(category => ({
                id: category.id,
                name: LocalizedField.pick(category.name, req.language),
                date: this.lastModified(category),
                productsCount: Number(category.get('products_count') ?? 0),
            })),
        });
    };

    readonly create = (_req: Request, res: Response): void => {
        res.render('admin/categories/new', {
            meta: this.meta('Új kategória', 'This is the category upload page'),
        });
    };

    readonly store = async (req: Request, res: Response): Promise<void> => {
        const attributes = this.parseForm(req.body);

        if (!attributes) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        const category = await WebshopCategory.create(attributes);

        this.respondSaved(res, `/admin/category/edit/${category.id}`);
    };

    readonly edit = async (req: Request, res: Response): Promise<void> => {
        const categoryId = this.parseId(req.params.categoryId);

        if (!categoryId) {
            return ErrorPage.badRequest(req, res);
        }

        const category = await WebshopCategory.findByPk(categoryId);

        if (!category) {
            return res.redirect('/admin/category/new');
        }

        res.render('admin/categories/edit', {
            formValues: {
                ...LocalizedField.toFormValues({ name: category.name, short_description: category.short_description }),
                id: category.id,
                image: ImageUrl.of(category.image, 'categories'),
            },
            meta: this.meta('Szerkesztés', 'This is the category edit page'),
        });
    };

    readonly update = async (req: Request, res: Response): Promise<void> => {
        const categoryId = this.parseId(req.params.categoryId);
        const attributes = this.parseForm(req.body);
        const category = categoryId && attributes ? await WebshopCategory.findByPk(categoryId) : null;

        if (!category || !attributes) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        await category.update(attributes);

        this.respondSaved(res, `/admin/category/edit/${category.id}`);
    };

    /** The products of the category are deleted too (ON DELETE CASCADE) */
    readonly delete = async (req: Request, res: Response): Promise<void> => {
        const categoryId = this.parseId(req.params.categoryId);
        const deletedCount = categoryId ? await WebshopCategory.destroy({ where: { id: categoryId } }) : 0;

        this.respondDeleted(res, deletedCount);
    };

    private parseForm(body: Record<string, unknown>): CategoryAttributes | null {
        const input = new FormInput(body);

        if (!input.hasLocalized('name')) {
            return null;
        }

        return {
            name: LocalizedField.stringify(input.localized('name')),
            slug: Slug.fromTitles(input.localized('name', { escape: false })),
            short_description: LocalizedField.stringify(input.localized('short_description')),
        };
    }
}
