import type { Request, Response } from 'express';
import { Op } from 'sequelize';
import { appConfig } from '../config/app';
import { env } from '../config/env';
import { ErrorPage } from '../http/ErrorPage';
import { MetaBuilder } from '../http/MetaBuilder';
import { Gallery } from '../models';
import { GalleryPresenter } from '../presenters/GalleryPresenter';
import { LocalizedField } from '../utils/LocalizedField';
import { Pagination } from '../utils/Pagination';
import { PublicController } from './PublicController';

export class GalleryController extends PublicController {
    readonly index = async (req: Request, res: Response): Promise<void> => {
        const { language } = req;
        const pagination = Pagination.fromQuery(req.query, appConfig.pagination.perPage);

        if (!pagination) {
            return ErrorPage.badRequest(req, res);
        }

        const { rows: galleries, count } = await Gallery.findAndCountAll({
            attributes: ['id', 'gallery_name', 'slug', 'gallery_date', 'gallery_thumbnail'],
            where: { is_active: 1 },
            order: [['gallery_date', 'DESC']],
            limit: pagination.limit,
            offset: pagination.offset,
        });

        const galleryPresenter = new GalleryPresenter(language);
        const listPath = req.translate('slugs.galleries');

        res.render('pages/galleries', {
            pageCount: pagination.pageCount(count),
            currentPage: pagination.currentPage,
            paginationPath: listPath,
            galleries: galleries.map(gallery => galleryPresenter.toCard(gallery)),
            meta: MetaBuilder.page(language, {
                title: req.translate('nav.gallery'),
                description: req.translate('meta.gallery_description'),
                path: listPath,
            }),
        });
    };

    readonly show = async (req: Request, res: Response): Promise<void> => {
        const { language } = req;
        const galleryId = this.parseId(req.params.galleryId);
        const gallery = galleryId && await Gallery.findOne({ where: { id: galleryId, is_active: 1 } });

        if (!gallery) {
            return ErrorPage.notFound(req, res);
        }

        const slug = LocalizedField.pick(gallery.slug, language);
        const galleryPath = `${req.translate('slugs.gallery')}/${slug}/${gallery.id}`;

        if (req.params.itemSlug !== slug) {
            return res.redirect(301, `${env.appUrl}/${language}/${galleryPath}`);
        }

        const relatedGalleries = await Gallery.findAll({
            attributes: ['id', 'gallery_name', 'slug', 'gallery_thumbnail', 'gallery_date'],
            where: { is_active: 1, id: { [Op.ne]: gallery.id } },
            order: [['id', 'DESC']],
            limit: appConfig.listLimits.relatedGalleries,
        });

        const galleryPresenter = new GalleryPresenter(language);
        const galleryData = galleryPresenter.toDetails(gallery);

        res.render('pages/gallery-details', {
            galleryData,
            relatedGalleries: relatedGalleries.map(relatedGallery => galleryPresenter.toRelated(relatedGallery)),
            meta: MetaBuilder.page(language, {
                title: galleryData.galleryName,
                description: galleryData.description ?? req.translate('meta.gallery_description'),
                path: galleryPath,
                type: 'article',
                image: galleryData.thumbImage,
            }),
        });
    };
}
