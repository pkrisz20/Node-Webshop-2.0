import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { ErrorPage } from '../http/ErrorPage';
import { isLanguage, type Language } from '../locales';
import { Translator } from '../utils/Translator';

/**
 * Decides the language of the request in one place and shares it as
 * `req.language`, `req.translate()` and `current_locale` (templates).
 */
export class LocaleMiddleware {
    /** Default for every request (e.g. the AJAX calls): the language of the last visited page */
    static fromSession(req: Request, res: Response, next: NextFunction): void {
        LocaleMiddleware.apply(req, res, req.session.lang ?? env.languages.fallback);
        next();
    }

    /** Public pages: the language of the `:lang` URL segment, remembered in the session for the AJAX calls */
    static fromUrl(req: Request, res: Response, next: NextFunction): void {
        const { lang } = req.params;

        if (!isLanguage(lang) || !env.languages.valid.includes(lang)) {
            return ErrorPage.notFound(req, res);
        }

        req.session.lang = lang;
        LocaleMiddleware.apply(req, res, lang);
        next();
    }

    /** The admin pages always use the admin language */
    static admin(req: Request, res: Response, next: NextFunction): void {
        LocaleMiddleware.apply(req, res, env.languages.admin);
        next();
    }

    /** Redirects the root URL to the last used (or the fallback) language */
    static redirectToLanguage(req: Request, res: Response): void {
        res.redirect(`/${req.session.lang ?? env.languages.fallback}`);
    }

    private static apply(req: Request, res: Response, language: Language): void {
        req.language = language;
        req.translate = (key, ...params) => Translator.translate(key, language, ...params);
        res.locals.current_locale = language;
    }
}
