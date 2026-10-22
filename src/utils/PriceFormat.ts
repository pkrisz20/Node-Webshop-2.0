import { appConfig } from '../config/app';

export type ThousandsSeparator = keyof typeof appConfig.priceFormat.thousandsSeparators;

export const THOUSANDS_SEPARATORS = Object.keys(appConfig.priceFormat.thousandsSeparators) as ThousandsSeparator[];

/** How the prices are displayed: the currency after them and the thousands separator of the numbers */
export class PriceFormat {
    static readonly DEFAULT = new PriceFormat(appConfig.priceFormat.currency, appConfig.priceFormat.thousandsSeparator);

    constructor(
        readonly currency: string,
        readonly thousandsSeparator: ThousandsSeparator,
    ) {}

    static isThousandsSeparator(value: unknown): value is ThousandsSeparator {
        return THOUSANDS_SEPARATORS.includes(value as ThousandsSeparator);
    }

    /** 1234567 => "1.234.567", "1,234,567" or "1 234 567" */
    formatAmount(value: number | string | null | undefined): string {
        if (value === null || value === undefined) {
            return '';
        }

        const separator = appConfig.priceFormat.thousandsSeparators[this.thousandsSeparator];
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    }
}
