import type { Request, Response } from 'express';
import type { CreationAttributes } from 'sequelize';
import { appConfig } from '../../config/app';
import { ApiResponse } from '../../http/ApiResponse';
import { ErrorPage } from '../../http/ErrorPage';
import { FormInput } from '../../http/FormInput';
import { Slider } from '../../models';
import { ImageUrl } from '../../utils/ImageUrl';
import { LocalizedField } from '../../utils/LocalizedField';
import { TextFormatter } from '../../utils/TextFormatter';
import { AdminController } from './AdminController';

type SliderAttributes = Omit<CreationAttributes<Slider>, 'id' | 'created_at' | 'updated_at'>;

const DEFAULT_TARGET_PAGE = '_blank';

/** Hero slides of the home page */
export class AdminSliderController extends AdminController {
    readonly index = async (req: Request, res: Response): Promise<void> => {
        const sliders = await Slider.findAll({ attributes: ['id', 'title', 'is_active', 'created_at', 'updated_at'] });

        res.render('admin/sliders/list', {
            meta: this.meta('Admin sliders list', 'This is the Slider list page page'),
            sliders: sliders.map(slider => ({
                id: slider.id,
                title: TextFormatter.limitText(LocalizedField.pick(slider.title, req.language), appConfig.textLengths.adminListTitle),
                is_active: this.activityIcon(slider.is_active),
                date: this.lastModified(slider),
            })),
        });
    };

    readonly create = (_req: Request, res: Response): void => {
        res.render('admin/sliders/new', {
            meta: this.meta('Új slider', 'This is the sliders upload page'),
        });
    };

    readonly store = async (req: Request, res: Response): Promise<void> => {
        const attributes = this.parseForm(req.body);

        if (!attributes) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        const slider = await Slider.create(attributes);

        this.respondSaved(res, `/admin/slider/edit/${slider.id}`);
    };

    readonly edit = async (req: Request, res: Response): Promise<void> => {
        const sliderId = this.parseId(req.params.sliderId);

        if (!sliderId) {
            return ErrorPage.badRequest(req, res);
        }

        const slider = await Slider.findByPk(sliderId);

        if (!slider) {
            return res.redirect('/admin/slider/new');
        }

        res.render('admin/sliders/edit', {
            formValues: {
                ...LocalizedField.toFormValues({
                    title: slider.title,
                    subtitle: slider.subtitle,
                    button: slider.button_text,
                    link: slider.link,
                }),
                id: slider.id,
                image: ImageUrl.of(slider.image, 'heros'),
                is_active: slider.is_active,
                target_page: slider.target_page ?? DEFAULT_TARGET_PAGE,
            },
            meta: this.meta('Szerkesztés', 'This is the sliders edit page'),
        });
    };

    readonly update = async (req: Request, res: Response): Promise<void> => {
        const sliderId = this.parseId(req.params.sliderId);
        const attributes = this.parseForm(req.body);
        const slider = sliderId && attributes ? await Slider.findByPk(sliderId) : null;

        if (!slider || !attributes) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        await slider.update(attributes);

        this.respondSaved(res, `/admin/slider/edit/${slider.id}`);
    };

    readonly delete = async (req: Request, res: Response): Promise<void> => {
        const sliderId = this.parseId(req.params.sliderId);
        const deletedCount = sliderId ? await Slider.destroy({ where: { id: sliderId } }) : 0;

        this.respondDeleted(res, deletedCount);
    };

    /** The link and the button text are optional, the button is only saved together with a link */
    private parseForm(body: Record<string, unknown>): SliderAttributes | null {
        const input = new FormInput(body);
        const isActive = input.flag('is_active');

        if (isActive === null || !input.isFilledInEveryLanguage('title')) {
            return null;
        }

        const links = input.localized('link');
        const buttonTexts = input.localized('button');
        const hasLink = LocalizedField.hasAnyValue(links);

        return {
            title: LocalizedField.stringify(input.localized('title')),
            subtitle: LocalizedField.stringify(input.localized('subtitle')),
            link: hasLink ? LocalizedField.stringify(links) : null,
            button_text: hasLink && LocalizedField.hasAnyValue(buttonTexts) ? LocalizedField.stringify(buttonTexts) : null,
            target_page: input.text('target_page') ?? DEFAULT_TARGET_PAGE,
            is_active: isActive,
        };
    }
}
