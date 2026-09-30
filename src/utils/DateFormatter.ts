import moment, { type MomentInput } from 'moment';
import 'moment/locale/en-gb';
import 'moment/locale/hu';
import 'moment/locale/sr';
import { appConfig } from '../config/app';
import { env } from '../config/env';
import type { Language } from '../locales';

/**
 * Every method sets the locale on the moment instance itself,
 * so parallel requests with different languages can not affect each other.
 * The display formats come from the config (appConfig.dateFormats).
 */
export class DateFormatter {
    static isValidDate(value: unknown): boolean {
        if (!value || (typeof value !== 'string' && !(value instanceof Date))) {
            return false;
        }

        return !Number.isNaN(new Date(value).getTime());
    }

    /** e.g. "2024 május 05." (hu) or "05. maj 2024" (sr) */
    static formatByLanguage(date: MomentInput, language: Language): string {
        return DateFormatter.localized(date, language).format(appConfig.dateFormats.byLanguage[language]);
    }

    /** "2 days ago" in the given language */
    static fromNow(date: MomentInput, language: Language): string {
        return DateFormatter.localized(date, language).fromNow();
    }

    /** "YYYY-MM-DD", or null for an empty / invalid date */
    static toDateString(date: MomentInput): string | null {
        const value = moment(date ?? undefined);
        return date && value.isValid() ? value.format('YYYY-MM-DD') : null;
    }

    static toAdminDateTime(date: MomentInput): string {
        return DateFormatter.localized(date, env.languages.admin).format(appConfig.dateFormats.adminDateTime);
    }

    static toAdminShortDateTime(date: MomentInput): string {
        return DateFormatter.localized(date, env.languages.admin).format(appConfig.dateFormats.adminShortDateTime).toLowerCase();
    }

    static today(): string {
        return moment().format('YYYY-MM-DD');
    }

    static monthsAgo(months: number): string {
        return moment().subtract(months, 'months').format('YYYY-MM-DD');
    }

    private static localized(date: MomentInput, language: Language): moment.Moment {
        return moment(date).locale(language === 'en' ? 'en-gb' : language);
    }
}
