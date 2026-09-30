import type { Language } from '../locales';
import type { PriceFormat } from '../utils/PriceFormat';

declare global {
    namespace Express {
        interface Request {
            /** Language of the current request, set by `LocaleMiddleware` */
            language: Language;
            /** Translates a dotted translation key to the language of the current request */
            translate: (key: string, ...params: Array<string | number>) => string;
        }

        /** The config defaults are set for every request (ViewLocalsMiddleware), PriceFormatMiddleware applies the admin settings */
        interface Locals {
            priceFormat: PriceFormat;
            currency: string;
            numberWithCommas: (value: number | string | null | undefined) => string;
        }
    }
}

export {};
