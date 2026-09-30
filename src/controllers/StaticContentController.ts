import type { Request, Response } from 'express';
import { appConfig } from '../config/app';
import { env } from '../config/env';
import { GDPR_COOKIE_NAME, NECESSARY_COOKIE_TYPE } from '../config/gdpr';
import { ApiResponse } from '../http/ApiResponse';
import { ErrorPage } from '../http/ErrorPage';
import { MetaBuilder } from '../http/MetaBuilder';
import { FAQ, StaticContent } from '../models';
import { Duration } from '../utils/Duration';
import { LocalizedField } from '../utils/LocalizedField';
import { Controller } from './Controller';

export class StaticContentController extends Controller {
    readonly faq = async (req: Request, res: Response): Promise<void> => {
        const { language } = req;
        const questions = await FAQ.findAll({
            attributes: ['question', 'answer'],
            where: { is_active: 1 },
            order: [['id', 'DESC']],
        });

        res.render('pages/faq', {
            questions: questions.map(faq => ({
                question: LocalizedField.pick(faq.question, language),
                answer: LocalizedField.pick(faq.answer, language),
            })),
            meta: MetaBuilder.page(language, {
                title: req.translate('nav.FAQ'),
                description: req.translate('meta.FAQ_description'),
                path: req.translate('slugs.faq'),
            }),
        });
    };

    /** Content pages (terms of use, privacy policy), found by the slug of the current language */
    readonly page = async (req: Request, res: Response): Promise<void> => {
        const { language } = req;
        const { routeName } = req.params;

        // There are only a few locked static contents, so the slug is matched in memory
        const contents = await StaticContent.findAll();
        const content = contents.find(staticContent => LocalizedField.pick(staticContent.slug, language) === routeName);

        if (!content) {
            return ErrorPage.notFound(req, res);
        }

        const contentPath = `${req.translate('slugs.content')}/${routeName}`;
        const title = LocalizedField.pick(content.title, language);
        const shortDescription = LocalizedField.pick(content.short_description, language);

        res.render('pages/static-page', {
            contentTitle: title,
            contentShortDescription: shortDescription,
            contentDescription: LocalizedField.pick(content.description, language),
            contentSlug: contentPath,
            meta: MetaBuilder.page(language, {
                title,
                description: shortDescription || req.translate('meta.description'),
                path: contentPath,
            }),
        });
    };

    /** Saves the accepted cookie types of the GDPR consent panel, the necessary type is always accepted */
    readonly saveCookieConsent = (req: Request, res: Response): void => {
        if (!env.gdprEnabled) {
            return ApiResponse.error(res, { title: req.translate('errors.not_found') });
        }

        const submittedTypes: unknown = req.body['allowed_cookies[]'];
        const acceptedTypes = new Set<string>([NECESSARY_COOKIE_TYPE]);

        [submittedTypes].flat().forEach(type => {
            if (typeof type === 'string') {
                acceptedTypes.add(type);
            }
        });

        res.cookie(GDPR_COOKIE_NAME, JSON.stringify([...acceptedTypes]), {
            httpOnly: true,
            maxAge: Duration.daysInMilliseconds(appConfig.cookieConsentLifetimeDays),
            secure: env.isProduction,
        });

        ApiResponse.success(res);
    };
}
