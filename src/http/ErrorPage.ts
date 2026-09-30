import type { Request, Response } from 'express';
import { env } from '../config/env';
import type { Language } from '../locales';
import { Translator } from '../utils/Translator';

/** Error pages (views/errors/400.ejs ... 500.ejs, layout: views/layouts/error.ejs), the CSRF token comes from `res.locals` */
export class ErrorPage {
    static badRequest(req: Request, res: Response): void {
        ErrorPage.render(req, res, 400, 'errors.wrong_data');
    }

    static unauthorized(req: Request, res: Response): void {
        const language = ErrorPage.language(req);

        ErrorPage.render(req, res, 401, 'errors.unauthorized', {
            subtitle: Translator.translate('errors.no_permission', language),
            login_text: Translator.translate('validations.login', language),
        });
    }

    static forbidden(req: Request, res: Response): void {
        ErrorPage.render(req, res, 403, 'errors.forbidden');
    }

    static notFound(req: Request, res: Response): void {
        ErrorPage.render(req, res, 404, 'errors.not_found');
    }

    static serverError(req: Request, res: Response): void {
        ErrorPage.render(req, res, 500, 'errors.server_error');
    }

    private static render(req: Request, res: Response, status: number, titleKey: string, extraData: Record<string, string> = {}): void {
        const language = ErrorPage.language(req);

        res.status(status).render(`errors/${status}`, {
            title: Translator.translate(titleKey, language),
            current_locale: language,
            back_to_home: Translator.translate('general.back_to_home', language),
            learn_more: Translator.translate('general.information', language),
            ...extraData,
        });
    }

    /** An error can happen before the locale middleware ran (e.g. a session store error) */
    private static language(req: Request): Language {
        return req.language ?? env.languages.fallback;
    }
}
