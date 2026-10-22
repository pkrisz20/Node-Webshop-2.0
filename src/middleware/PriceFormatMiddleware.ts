import type { NextFunction, Request, Response } from 'express';
import { SiteConfigService } from '../services/SiteConfigService';
import type { PriceFormat } from '../utils/PriceFormat';

/**
 * Shares the price display of the admin settings (currency, thousands separator) with the request.
 * The public pages get it from `PageContextMiddleware`, which loads the settings anyway.
 */
export class PriceFormatMiddleware {
    constructor(private readonly siteConfigService = new SiteConfigService()) {}

    readonly share = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            PriceFormatMiddleware.setPriceFormat(res, await this.siteConfigService.loadPriceFormat());
            next();
        }
        catch (error) {
            next(error);
        }
    };

    /** Controllers use `res.locals.priceFormat`, the templates `currency` and `formatAmount()` */
    static setPriceFormat(res: Response, priceFormat: PriceFormat): void {
        res.locals.priceFormat = priceFormat;
        res.locals.currency = priceFormat.currency;
        res.locals.formatAmount = (value: number | string | null | undefined) => priceFormat.formatAmount(value);
    }
}
