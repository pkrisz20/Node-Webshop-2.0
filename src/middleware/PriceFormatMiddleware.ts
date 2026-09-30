import type { NextFunction, Request, Response } from 'express';
import { SiteConfigService } from '../services/SiteConfigService';
import type { PriceFormat } from '../utils/PriceFormat';

/**
 * Shares the price display of the admin settings (currency, thousands separator) with the request.
 * The public pages get it from `PageContextMiddleware`, which loads the settings anyway.
 */
export class PriceFormatMiddleware {
    private static readonly siteConfigService = new SiteConfigService();

    static async share(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            PriceFormatMiddleware.apply(res, await PriceFormatMiddleware.siteConfigService.priceFormat());
            next();
        }
        catch (error) {
            next(error);
        }
    }

    /** Controllers use `res.locals.priceFormat`, the templates `currency` and `numberWithCommas()` */
    static apply(res: Response, priceFormat: PriceFormat): void {
        res.locals.priceFormat = priceFormat;
        res.locals.currency = priceFormat.currency;
        res.locals.numberWithCommas = (value: number | string | null | undefined) => priceFormat.number(value);
    }
}
