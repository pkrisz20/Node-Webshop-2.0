import type { Request, Response } from 'express';
import { MetaBuilder } from '../http/MetaBuilder';
import type { Language } from '../locales';
import { Article, Gallery, Product, Slider } from '../models';
import { ArticlePresenter } from '../presenters/ArticlePresenter';
import { GalleryPresenter } from '../presenters/GalleryPresenter';
import { ImageUrl } from '../utils/ImageUrl';
import { LocalizedField } from '../utils/LocalizedField';
import { Controller } from './Controller';

export class HomePageController extends Controller {
    readonly show = async (req: Request, res: Response): Promise<void> => {
        const { language } = req;

        const [products, articles, sliders, galleries] = await Promise.all([
            Product.findAll({
                attributes: [...Product.CARD_ATTRIBUTES],
                where: { is_active: 1, is_featured: 1 },
                order: [['id', 'DESC']],
            }),
            Article.findAll({
                attributes: [...Article.CARD_ATTRIBUTES, Article.commentsCountAttribute()],
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

        res.render('home', {
            heros: sliders.map(slider => this.toHero(slider, language)),
            galleries: galleries.map(gallery => galleryPresenter.toFeatured(gallery)),
            blogs: articles.map(article => articlePresenter.toCard(article)),
            products: products.map(product => productPresenter.toCard(product)),
            meta: MetaBuilder.page(language, {
                title: req.translate('nav.home'),
                description: req.translate('meta.description'),
            }),
        });
    };

    private toHero(slider: Slider, language: Language) {
        return {
            id: slider.id,
            text: LocalizedField.pick(slider.title, language),
            subText: LocalizedField.pick(slider.subtitle, language),
            image: ImageUrl.of(slider.image, 'heros'),
            link: LocalizedField.pick(slider.link, language),
            button: LocalizedField.pick(slider.button_text, language),
            targetPage: slider.target_page ?? '_blank',
        };
    }
}
