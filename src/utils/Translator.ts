import { dictionaries, type Language } from '../locales';

type TranslationParam = string | number;

export class Translator {
    /**
     * Resolves a dotted translation key (e.g. "errors.not_found") and fills the `{0}`, `{1}` ... placeholders.
     * Falls back to the key itself when the translation is missing.
     */
    static translate(key: string, language: Language = 'en', ...params: TranslationParam[]): string {
        const dictionary = dictionaries[language] ?? dictionaries.en;
        const translation = Translator.lookup(dictionary, key);

        if (typeof translation !== 'string') {
            return key;
        }

        return params.reduce<string>(
            (text, param, index) => text.replace(`{${index}}`, String(param)),
            translation,
        );
    }

    private static lookup(dictionary: object, key: string): unknown {
        return key.split('.').reduce<unknown>(
            (node, segment) => (node !== null && typeof node === 'object') ? (node as Record<string, unknown>)[segment] : undefined,
            dictionary,
        );
    }
}
