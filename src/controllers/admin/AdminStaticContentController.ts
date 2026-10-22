import type { Request, Response } from 'express';
import { ApiResponse } from '../../http/ApiResponse';
import { ErrorPage } from '../../http/ErrorPage';
import { FormInput } from '../../http/FormInput';
import { StaticContent } from '../../models';
import { DateFormatter } from '../../utils/DateFormatter';
import { LocalizedField } from '../../utils/LocalizedField';
import { Slug } from '../../utils/Slug';
import { AdminController } from './AdminController';

/** The static contents are locked: they are always active and can only be edited */
export class AdminStaticContentController extends AdminController {
    readonly index = async (req: Request, res: Response): Promise<void> => {
        const contents = await StaticContent.findAll({
            attributes: ['id', 'title', 'updated_at'],
            order: [['id', 'ASC']],
        });

        res.render('admin/static-contents/list', {
            meta: this.meta('Static contents', 'This is the static contents admin list page'),
            staticPages: contents.map(content => ({
                id: content.id,
                title: LocalizedField.pick(content.title, req.language),
                is_active: this.activityIcon(true),
                updated_at: DateFormatter.toAdminDateTime(content.updated_at),
            })),
        });
    };

    readonly edit = async (req: Request, res: Response): Promise<void> => {
        const contentId = this.parseId(req.params.staticContentId);

        if (!contentId) {
            return ErrorPage.badRequest(req, res);
        }

        const content = await StaticContent.findByPk(contentId);

        if (!content) {
            return ErrorPage.notFound(req, res);
        }

        res.render('admin/static-contents/edit', {
            formValues: {
                ...LocalizedField.toFormValues({
                    title: content.title,
                    short_description: content.short_description,
                    description: content.description,
                }),
                id: content.id,
                is_active: 1,
            },
            meta: this.meta('Szerkesztés', 'This is the static content edit page'),
        });
    };

    readonly update = async (req: Request, res: Response): Promise<void> => {
        const contentId = this.parseId(req.params.staticContentId);
        const input = new FormInput(req.body);
        const content = contentId && input.isFilledInEveryLanguage('title') ? await StaticContent.findByPk(contentId) : null;

        if (!content) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        await content.update({
            title: LocalizedField.stringify(input.localized('title')),
            slug: Slug.fromTitles(input.localized('title', { escape: false })),
            short_description: LocalizedField.stringify(input.localized('short_description')),
            description: LocalizedField.stringify(input.localized('content_description', { escape: false })),
        });

        this.respondSaved(res, `/admin/static-contents/edit/${content.id}`);
    };
}
