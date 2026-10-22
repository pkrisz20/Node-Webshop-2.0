import type { Language } from '../locales';
import { Config } from '../models';
import { LocalizedField } from '../utils/LocalizedField';
import { PriceFormat } from '../utils/PriceFormat';

export type SiteConfig = Record<string, string | null>;

/** Global site settings stored as key-value rows in the `config` table */
export class SiteConfigService {
    /** Settings stored as localized JSON (edited per language in the admin) */
    static readonly LOCALIZED_KEYS = ['home_page_title', 'home_page_text', 'about_us_short', 'about_us_long'] as const;

    static readonly COUNTER_KEYS = ['posted_products_number', 'animals_in_numbers', 'cups_of_coffe_number', 'satisfied_clients_number'] as const;

    static readonly PLAIN_KEYS = [
        'phone_1',
        'phone_2',
        'email',
        'facebook',
        'instagram',
        'tiktok',
        'company_street',
        'currency',
        'map_lat',
        'map_long',
    ] as const;

    /** Stores a key of appConfig.priceFormat.thousandsSeparators (dot, comma, space) */
    static readonly THOUSANDS_SEPARATOR_KEY = 'thousands_separator';

    /** The price display set in the admin settings, the config values are the defaults of the empty settings */
    static priceFormatOf(config: SiteConfig): PriceFormat {
        const thousandsSeparator = config[SiteConfigService.THOUSANDS_SEPARATOR_KEY];

        return new PriceFormat(
            config.currency?.trim() || PriceFormat.DEFAULT.currency,
            PriceFormat.isThousandsSeparator(thousandsSeparator) ? thousandsSeparator : PriceFormat.DEFAULT.thousandsSeparator,
        );
    }

    async loadAll(): Promise<SiteConfig> {
        const rows = await Config.findAll();

        return Object.fromEntries(rows.map(row => [row.config_key, row.config_value ?? null]));
    }

    async loadPriceFormat(): Promise<PriceFormat> {
        return SiteConfigService.priceFormatOf(await this.loadAll());
    }

    /** Settings for the public pages, the home page banner texts are resolved to the given language */
    async loadForLanguage(language: Language): Promise<SiteConfig> {
        const config = await this.loadAll();

        return {
            ...config,
            home_page_title: LocalizedField.pick(config.home_page_title, language),
            home_page_text: LocalizedField.pick(config.home_page_text, language),
        };
    }

    /** Updates the settings, a setting without a row yet (e.g. a newly introduced one) is created */
    async save(values: Record<string, string | number | null>): Promise<void> {
        const existingKeys = new Set((await Config.findAll({ attributes: ['config_key'] })).map(row => row.config_key));

        await Promise.all(Object.entries(values).map(([key, value]) => {
            const configValue = value === null ? null : String(value);

            return existingKeys.has(key)
                ? Config.update({ config_value: configValue }, { where: { config_key: key } })
                : Config.create({ config_key: key, config_value: configValue });
        }));
    }
}
