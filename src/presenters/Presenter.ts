import type { Language } from '../locales';
import { LocalizedField } from '../utils/LocalizedField';
import { Translator } from '../utils/Translator';

/** Base class of the presenters: every value is displayed in the language of the request */
export abstract class Presenter {
    constructor(protected readonly language: Language) {}

    /** The value of the current language from a localized JSON column */
    protected localized(json: string | null | undefined): string | null {
        return LocalizedField.pick(json, this.language);
    }

    protected translate(key: string, ...params: Array<string | number>): string {
        return Translator.translate(key, this.language, ...params);
    }
}
