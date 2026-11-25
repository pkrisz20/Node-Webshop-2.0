import { env } from '../config/env';
import type { Language } from '../locales';

/**
 * Values of one field keyed by language, stored in the database as a JSON string.
 * The values are stored as they were typed: the templates escape the plain texts on output (`<%= %>`),
 * and only the rich text editor values are printed unescaped (`<%- %>`).
 * HTML built in TypeScript must escape the plain texts itself (`TextFormatter.escapeHtml`).
 */
export type LocalizedValues = Record<Language, string | null>;

type FormBody = Record<string, unknown>;

export class LocalizedField {
    /** Picks the value of one language from a localized JSON column */
    static pick(json: string | null | undefined, language: Language): string | null {
        const values = LocalizedField.parse(json);
        return values?.[language] ?? null;
    }

    static parse(json: string | null | undefined): Partial<LocalizedValues> | null {
        if (!json) {
            return null;
        }

        try {
            return JSON.parse(json) as Partial<LocalizedValues>;
        }
        catch {
            return null;
        }
    }

    static stringify(values: LocalizedValues): string {
        return JSON.stringify(values);
    }

    /** Reads the `field[en]`, `field[hu]` ... inputs of a submitted admin form, empty inputs become `null` */
    static fromForm(body: FormBody, field: string): LocalizedValues {
        return LocalizedField.fromFormInputs(body, language => `${field}[${language}]`);
    }

    /** Reads one input per language, the input names are built by `inputNameOf` */
    static fromFormInputs(body: FormBody, inputNameOf: (language: Language) => string): LocalizedValues {
        const values = {} as LocalizedValues;

        for (const language of env.languages.valid) {
            const value = body[inputNameOf(language)];
            const text = typeof value === 'string' ? value : '';

            values[language] = text.length === 0 ? null : text;
        }

        return values;
    }

    /** Checks whether the `field[<language>]` input was filled for every language */
    static isFilledInEveryLanguage(body: FormBody, field: string): boolean {
        return env.languages.valid.every(language => {
            const value = body[`${field}[${language}]`];
            return typeof value === 'string' && value.length > 0;
        });
    }

    static hasAnyValue(values: LocalizedValues): boolean {
        return Object.values(values).some(value => value !== null);
    }

    /**
     * Splits localized JSON columns of a record into per-language objects for the admin edit forms:
     * `{ en: { title, description }, hu: { ... }, sr: { ... } }`
     */
    static toFormValues<TField extends string>(
        columns: Record<TField, string | null | undefined>,
    ): Record<Language, Record<TField, string | null>> {
        const formValues = {} as Record<Language, Record<TField, string | null>>;

        for (const language of env.languages.valid) {
            formValues[language] = {} as Record<TField, string | null>;

            for (const field of Object.keys(columns) as TField[]) {
                formValues[language][field] = LocalizedField.pick(columns[field], language);
            }
        }

        return formValues;
    }
}
