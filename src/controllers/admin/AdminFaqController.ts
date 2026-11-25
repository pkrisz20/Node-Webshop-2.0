import type { Request, Response } from 'express';
import type { CreationAttributes } from 'sequelize';
import { appConfig } from '../../config/app';
import { ApiResponse } from '../../http/ApiResponse';
import { ErrorPage } from '../../http/ErrorPage';
import { FormInput } from '../../http/FormInput';
import { FAQ } from '../../models';
import { LocalizedField } from '../../utils/LocalizedField';
import { TextFormatter } from '../../utils/TextFormatter';
import { AdminController } from './AdminController';

type FaqAttributes = Omit<CreationAttributes<FAQ>, 'id' | 'created_at' | 'updated_at'>;

export class AdminFaqController extends AdminController {
    readonly index = async (req: Request, res: Response): Promise<void> => {
        const questions = await FAQ.findAll({
            attributes: ['id', 'question', 'is_active', 'created_at', 'updated_at'],
            order: [['id', 'DESC']],
        });

        res.render('admin/FAQ/list', {
            meta: this.meta('This is the FAQ admin list page', 'This is the FAQ admin list page'),
            FAQList: questions.map(faq => ({
                id: faq.id,
                question: TextFormatter.limitText(LocalizedField.pick(faq.question, req.language), appConfig.textLengths.adminListQuestion),
                is_active: this.activityIcon(faq.is_active),
                date: this.lastModified(faq),
            })),
        });
    };

    readonly create = (_req: Request, res: Response): void => {
        res.render('admin/FAQ/new', {
            meta: this.meta('Új GYIK', 'This is the FAQ upload page'),
        });
    };

    readonly store = async (req: Request, res: Response): Promise<void> => {
        const attributes = this.parseForm(req.body);

        if (!attributes) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        const faq = await FAQ.create(attributes);

        this.respondSaved(res, `/admin/faq/edit/${faq.id}`);
    };

    readonly edit = async (req: Request, res: Response): Promise<void> => {
        const faqId = this.parseId(req.params.faqId);

        if (!faqId) {
            return ErrorPage.badRequest(req, res);
        }

        const faq = await FAQ.findByPk(faqId);

        if (!faq) {
            return res.redirect('/admin/faq/new');
        }

        res.render('admin/FAQ/edit', {
            formValues: {
                ...LocalizedField.toFormValues({ question: faq.question, answer: faq.answer }),
                id: faq.id,
                is_active: faq.is_active,
            },
            meta: this.meta('Szerkesztés', 'This is the faq edit page'),
        });
    };

    readonly update = async (req: Request, res: Response): Promise<void> => {
        const faqId = this.parseId(req.params.faqId);
        const attributes = this.parseForm(req.body);
        const faq = faqId && attributes ? await FAQ.findByPk(faqId) : null;

        if (!faq || !attributes) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        await faq.update(attributes);

        this.respondSaved(res, `/admin/faq/edit/${faq.id}`);
    };

    readonly delete = async (req: Request, res: Response): Promise<void> => {
        const faqId = this.parseId(req.params.faqId);
        const deletedCount = faqId ? await FAQ.destroy({ where: { id: faqId } }) : 0;

        this.respondDeleted(res, deletedCount);
    };

    private parseForm(body: Record<string, unknown>): FaqAttributes | null {
        const input = new FormInput(body);
        const isActive = input.flag('is_active');

        if (isActive === null || !input.isFilledInEveryLanguage('question') || !input.isFilledInEveryLanguage('answer')) {
            return null;
        }

        return {
            question: LocalizedField.stringify(input.localized('question')),
            answer: LocalizedField.stringify(input.localized('answer')),
            is_active: isActive,
        };
    }
}
