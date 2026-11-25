import type { Request, Response } from 'express';
import type { CreationAttributes } from 'sequelize';
import { appConfig } from '../../config/app';
import { ApiResponse } from '../../http/ApiResponse';
import { ErrorPage } from '../../http/ErrorPage';
import { FormInput } from '../../http/FormInput';
import { Gallery } from '../../models';
import { DateFormatter } from '../../utils/DateFormatter';
import { ImageUrl } from '../../utils/ImageUrl';
import { LocalizedField } from '../../utils/LocalizedField';
import { Slug } from '../../utils/Slug';
import { TextFormatter } from '../../utils/TextFormatter';
import { AdminController } from './AdminController';

type GalleryAttributes = Omit<CreationAttributes<Gallery>, 'id' | 'created_at' | 'updated_at'>;

const GALLERY_FLAGS = ['is_active', 'is_featured'] as const;

export class AdminGalleryController extends AdminController {
    readonly index = async (req: Request, res: Response): Promise<void> => {
        const pagination = this.pagination(req);

        if (!pagination) {
            return ErrorPage.badRequest(req, res);
        }

        const { rows: galleries, count } = await Gallery.findAndCountAll({
            attributes: ['id', 'is_active', 'gallery_name', 'created_at', 'updated_at'],
            order: [['id', 'DESC']],
            limit: pagination.limit,
            offset: pagination.offset,
        });

        res.render('admin/gallery/list', {
            meta: this.meta('Admin gallery', 'This is the gallery list page'),
            pageCount: pagination.pageCount(count),
            currentPage: pagination.currentPage,
            paginationLink: 'gallery',
            galleriesList: galleries.map(gallery => ({
                galleryId: gallery.id,
                galleryName: TextFormatter.limitText(LocalizedField.pick(gallery.gallery_name, req.language), appConfig.textLengths.adminListTitle),
                is_active: this.activityIcon(gallery.is_active),
                date: this.lastModified(gallery),
            })),
        });
    };

    readonly create = (_req: Request, res: Response): void => {
        res.render('admin/gallery/new', {
            // The date input only accepts the zero-padded YYYY-MM-DD format
            defaultDate: DateFormatter.today(),
            meta: this.meta('Új galléria', 'This is the gallery upload page'),
        });
    };

    readonly store = async (req: Request, res: Response): Promise<void> => {
        const attributes = this.parseForm(req.body);

        if (!attributes) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        const gallery = await Gallery.create(attributes);

        this.respondSaved(res, `/admin/gallery/edit/${gallery.id}`);
    };

    readonly edit = async (req: Request, res: Response): Promise<void> => {
        const galleryId = this.parseId(req.params.galleryId);

        if (!galleryId) {
            return ErrorPage.badRequest(req, res);
        }

        const gallery = await Gallery.findByPk(galleryId);

        if (!gallery) {
            return res.redirect('/admin/gallery/new');
        }

        res.render('admin/gallery/edit', {
            formValues: {
                ...LocalizedField.toFormValues({ name: gallery.gallery_name, description: gallery.description }),
                id: gallery.id,
                images: ImageUrl.listOf(gallery.gallery_images, 'galleries'),
                thumbnail: ImageUrl.of(gallery.gallery_thumbnail, 'galleries'),
                date: DateFormatter.toDateString(gallery.gallery_date),
                is_active: gallery.is_active,
                is_featured: gallery.is_featured,
            },
            meta: this.meta('Szerkesztés', 'This is the gallery edit page'),
        });
    };

    readonly update = async (req: Request, res: Response): Promise<void> => {
        const galleryId = this.parseId(req.params.galleryId);
        const attributes = this.parseForm(req.body);
        const gallery = galleryId && attributes ? await Gallery.findByPk(galleryId) : null;

        if (!gallery || !attributes) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        await gallery.update(attributes);

        this.respondSaved(res, `/admin/gallery/edit/${gallery.id}`);
    };

    readonly delete = async (req: Request, res: Response): Promise<void> => {
        const galleryId = this.parseId(req.params.galleryId);
        const deletedCount = galleryId ? await Gallery.destroy({ where: { id: galleryId } }) : 0;

        this.respondDeleted(res, deletedCount);
    };

    private parseForm(body: Record<string, unknown>): GalleryAttributes | null {
        const input = new FormInput(body);
        const flags = input.flags(GALLERY_FLAGS);
        const date = input.date('date');

        if (!flags || !date || !input.isFilledInEveryLanguage('name')) {
            return null;
        }

        return {
            gallery_name: LocalizedField.stringify(input.localized('name')),
            slug: Slug.fromTitles(input.localized('name')),
            description: LocalizedField.stringify(input.localized('description')),
            gallery_date: date,
            ...flags,
        };
    }
}
