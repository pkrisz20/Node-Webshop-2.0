import type { RequestHandler } from 'express';
import { isLanguage } from '../locales';
import { Translator } from '../utils/Translator';

/**
 * The public routes share the same URL pattern (e.g. "/:lang/:slug"),
 * so every route checks whether the `:routeSlug` segment is its own translated slug (e.g. "termekek").
 */
export class SlugGuard {
    static matches(translationKey: string): RequestHandler {
        return (req, _res, next) => {
            const { lang, routeSlug } = req.params;

            if (isLanguage(lang) && routeSlug === Translator.translate(translationKey, lang)) {
                return next();
            }

            // Skip the remaining handlers of this route and try the next route
            return next('route');
        };
    }
}
