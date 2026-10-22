import type { Request, Response } from 'express';
import { MetaBuilder } from '../http/MetaBuilder';
import { Article, Gallery, Product, Slider } from '../models';
import { ArticlePresenter } from '../presenters/ArticlePresenter';
import { GalleryPresenter } from '../presenters/GalleryPresenter';
import { SliderPresenter } from '../presenters/SliderPresenter';
import { PublicController } from './PublicController';

export class HomePageController extends PublicController {
    readonly show = async (req: Request, res: Response): Promise<void> => {
        const { language } = req;

        const [products, articles, sliders, galleries] = await Promise.all([
            Product.findAll({
                attributes: [...Product.CARD_ATTRIBUTES],
                where: { is_active: 1, is_featured: 1 },
                order: [['id', 'DESC']],
            }),
            Article.findAll({
                attributes: Article.cardAttributesWithCommentsCount(),
                where: { is_active: 1, is_featured: 1 },
                order: [['date', 'DESC']],
            }),
            Slider.findAll({
                where: { is_active: 1 },
                order: [['id', 'DESC']],
            }),
            Gallery.findAll({
                attributes: ['id', 'gallery_name', 'slug', 'gallery_thumbnail'],
                where: { is_active: 1, is_featured: 1 },
                order: [['gallery_date', 'DESC']],
            }),
        ]);

        const productPresenter = this.productPresenter(req, res);
        const articlePresenter = new ArticlePresenter(language);
        const galleryPresenter = new GalleryPresenter(language);
        const sliderPresenter = new SliderPresenter(language);

        res.render('home', {
            heros: sliders.map(slider => sliderPresenter.toHero(slider)),
            galleries: galleries.map(gallery => galleryPresenter.toFeatured(gallery)),
            blogs: articles.map(article => articlePresenter.toCard(article)),
            products: products.map(product => productPresenter.toCard(product)),
            meta: MetaBuilder.page(language, {
                title: req.translate('nav.home'),
                description: req.translate('meta.description'),
            }),
        });
    };
}
