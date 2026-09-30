import type { Express, NextFunction, Request, Response } from 'express';
import { appConfig } from '../config/app';
import { env } from '../config/env';
import { GDPR_COOKIE_NAME, gdprCookies } from '../config/gdpr';
import { AssetManifest } from '../utils/AssetManifest';
import { Formatter } from '../utils/Formatter';
import { PriceFormat } from '../utils/PriceFormat';
import { Translator } from '../utils/Translator';
import { PriceFormatMiddleware } from './PriceFormatMiddleware';

/**
 * Template values. The language (`current_locale`) is shared by `LocaleMiddleware`,
 * the CSRF token (`csrfToken`) by `CsrfMiddleware`.
 */
export class ViewLocalsMiddleware {
    /**
     * Helpers available in every template (public, admin and error pages),
     * registered on the application so they exist even when a middleware fails early.
     */
    static registerGlobals(app: Express): void {
        Object.assign(app.locals, {
            /** Application settings, e.g. <%= config.pagination.perPage %> */
            config: appConfig,
            /** Price display defaults, the requests override them with the admin settings (PriceFormatMiddleware) */
            currency: PriceFormat.DEFAULT.currency,
            numberWithCommas: (value: number | string | null | undefined) => PriceFormat.DEFAULT.number(value),
            languageHandler: Translator.translate,
            getAssetPath: (fileName: string) => AssetManifest.url(fileName),
            createUniqueID: Formatter.createUniqueId,
            locales: env.languages.valid,
            gdprCookies,
        });
    }

    /** Cookie types accepted in the GDPR consent panel, the default price display of the controllers */
    static share(req: Request, res: Response, next: NextFunction): void {
        res.locals.gdprAcceptedCookies = ViewLocalsMiddleware.acceptedCookieTypes(req);
        PriceFormatMiddleware.apply(res, PriceFormat.DEFAULT);
        next();
    }

    private static acceptedCookieTypes(req: Request): string[] {
        try {
            const cookieTypes: unknown = JSON.parse(req.cookies?.[GDPR_COOKIE_NAME] ?? '[]');
            return Array.isArray(cookieTypes) ? cookieTypes : [];
        }
        catch {
            return [];
        }
    }
}
