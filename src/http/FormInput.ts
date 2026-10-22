import type { Language } from '../locales';
import { DateFormatter } from '../utils/DateFormatter';
import { LocalizedField, type LocalizedValues } from '../utils/LocalizedField';
import { NumberParser } from '../utils/NumberParser';

/** Typed access to the fields of a submitted (url-encoded) admin form */
export class FormInput {
    constructor(private readonly body: Record<string, unknown>) {}

    /** Checkbox value (0 / 1), a missing checkbox counts as 0, null when it is not a number */
    flag(name: string): number | null {
        return NumberParser.integerOrDefault(this.body[name], 0);
    }

    /** Several checkbox values at once, null when any of them is invalid */
    flags<TName extends string>(names: readonly TName[]): Record<TName, number> | null {
        const flags = {} as Record<TName, number>;

        for (const name of names) {
            const value = this.flag(name);

            if (value === null) {
                return null;
            }

            flags[name] = value;
        }

        return flags;
    }

    /** Required integer, null when it is empty or invalid */
    integer(name: string): number | null {
        return NumberParser.integer(this.body[name]);
    }

    /** Non-empty string, otherwise null */
    text(name: string): string | null {
        const value = this.body[name];
        return typeof value === 'string' && value.length > 0 ? value : null;
    }

    /** Valid date string, otherwise null */
    date(name: string): string | null {
        const value = this.text(name);
        return value && DateFormatter.isValidDate(value) ? value : null;
    }

    /** Values of the `name[en]`, `name[hu]` ... inputs, plain text inputs are HTML escaped by default */
    localized(name: string, options: { escape?: boolean } = {}): LocalizedValues {
        return LocalizedField.fromForm(this.body, name, options);
    }

    /** Localized values of inputs with a custom name pattern, e.g. `parameter_value[en][<hash>]` */
    localizedInputs(inputNameOf: (language: Language) => string, options: { escape?: boolean } = {}): LocalizedValues {
        return LocalizedField.fromFormInputs(this.body, inputNameOf, options);
    }

    /** Every `name[<language>]` input is filled in */
    isFilledInEveryLanguage(name: string): boolean {
        return LocalizedField.isFilledInEveryLanguage(this.body, name);
    }

    /** One or more values of a repeated input (e.g. hidden inputs of a repeatable block) */
    list(name: string): string[] {
        return [this.body[name]].flat().filter((value): value is string => typeof value === 'string' && value.length > 0);
    }

    raw(name: string): unknown {
        return this.body[name];
    }
}
