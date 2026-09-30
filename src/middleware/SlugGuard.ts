import type { RequestHandler } from 'express';
import { isLanguage } from '../locales';
import { Translator } from '../utils/Translator';

/**
 * The public routes share the same URL pattern (e.g. "/:lang/:slug"),
 * so every route checks whether the `:slug` segment is its own translated slug.
 */
export class SlugGuard {
    static matches(translationKey: string): RequestHandler {
        return (req, _res, next) => {
            const { lang, slug } = req.params;

            if (isLanguage(lang) && slug === Translator.translate(translationKey, lang)) {
                return next();
            }

            // Skip the remaining handlers of this route and try the next route
            return next('route');
        };
    }
}
