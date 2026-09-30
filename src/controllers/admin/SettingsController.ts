import type { Request, Response } from 'express';
import { ApiResponse } from '../../http/ApiResponse';
import { SiteConfigService } from '../../services/SiteConfigService';
import { LocalizedField } from '../../utils/LocalizedField';
import { NumberParser } from '../../utils/NumberParser';
import { PriceFormat, THOUSANDS_SEPARATORS, type ThousandsSeparator } from '../../utils/PriceFormat';
import { AdminController } from './AdminController';

type LocalizedKey = typeof SiteConfigService.LOCALIZED_KEYS[number];

/** Rich text settings, their HTML content must not be escaped */
const RICH_TEXT_KEYS: readonly LocalizedKey[] = ['about_us_long'];

const THOUSANDS_SEPARATOR_LABELS: Record<ThousandsSeparator, string> = {
    dot: 'Pont',
    comma: 'Vessző',
    space: 'Szóköz',
};

const SEPARATOR_EXAMPLE_PRICE = 1234567;

export class SettingsController extends AdminController {
    constructor(private readonly siteConfigService = new SiteConfigService()) {
        super();
    }

    readonly edit = async (_req: Request, res: Response): Promise<void> => {
        const config = await this.siteConfigService.loadAll();

        const localizedColumns = Object.fromEntries(SiteConfigService.LOCALIZED_KEYS.map(key => [key, config[key]])) as Record<LocalizedKey, string | null>;
        const counters = Object.fromEntries(SiteConfigService.COUNTER_KEYS.map(key => [key, Number(config[key] ?? 0)]));
        const plainValues = Object.fromEntries(SiteConfigService.PLAIN_KEYS.map(key => [key, config[key] ?? null]));

        res.render('admin/settings-form', {
            configValues: {
                ...LocalizedField.toFormValues(localizedColumns),
                ...counters,
                ...plainValues,
                // Without a saved setting the default of the config is selected
                [SiteConfigService.THOUSANDS_SEPARATOR_KEY]: SiteConfigService.priceFormatOf(config).thousandsSeparator,
            },
            thousandsSeparatorOptions: this.thousandsSeparatorOptions(),
            meta: this.meta('Admin dashboard', 'This is the admin global settings page'),
        });
    };

    readonly update = async (req: Request, res: Response): Promise<void> => {
        const body = req.body as Record<string, unknown>;

        const counters = SiteConfigService.COUNTER_KEYS.map(key => [key, NumberParser.integerOrDefault(body[key], 0)] as const);
        const hasInvalidCounter = counters.some(([, value]) => value === null);
        const hasMissingText = SiteConfigService.LOCALIZED_KEYS.some(key => !LocalizedField.isFilledInForm(body, key));

        // The price display is optional: an empty value means the default of the config
        const thousandsSeparator = this.plainValue(body[SiteConfigService.THOUSANDS_SEPARATOR_KEY]);
        const hasInvalidSeparator = thousandsSeparator !== null && !PriceFormat.isThousandsSeparator(thousandsSeparator);

        if (hasInvalidCounter || hasMissingText || hasInvalidSeparator) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        const localizedValues = SiteConfigService.LOCALIZED_KEYS.map(key => [
            key,
            LocalizedField.stringify(LocalizedField.fromForm(body, key, { escape: !RICH_TEXT_KEYS.includes(key) })),
        ] as const);

        const plainValues = SiteConfigService.PLAIN_KEYS.map(key => [key, this.plainValue(body[key])] as const);

        await this.siteConfigService.save({
            ...Object.fromEntries([...counters, ...localizedValues, ...plainValues]),
            [SiteConfigService.THOUSANDS_SEPARATOR_KEY]: thousandsSeparator,
        });

        this.respondSaved(res, '/admin/settings');
    };

    /** Options of the thousands separator select, with an example price and the default of the config marked */
    private thousandsSeparatorOptions() {
        return THOUSANDS_SEPARATORS.map(separator => ({
            value: separator,
            label: THOUSANDS_SEPARATOR_LABELS[separator],
            example: new PriceFormat('', separator).number(SEPARATOR_EXAMPLE_PRICE),
            isDefault: separator === PriceFormat.DEFAULT.thousandsSeparator,
        }));
    }

    /** Empty inputs are saved as NULL */
    private plainValue(value: unknown): string | null {
        return typeof value === 'string' && value.length > 0 ? value : null;
    }
}
