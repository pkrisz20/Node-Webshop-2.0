export class NumberParser {
    /** Positive integer (e.g. a database id) from a request parameter, otherwise null */
    static positiveInteger(value: unknown): number | null {
        const number = NumberParser.integer(value);
        return number !== null && number > 0 ? number : null;
    }

    /** Integer from a request parameter, null for an empty or invalid value */
    static integer(value: unknown): number | null {
        if (value === undefined || value === null || value === '') {
            return null;
        }

        const number = Number(value);
        return Number.isInteger(number) ? number : null;
    }

    /** Optional integer: an empty value counts as the fallback, an invalid value is null */
    static integerOrDefault(value: unknown, fallback: number): number | null {
        return value === undefined || value === null || value === '' ? fallback : NumberParser.integer(value);
    }
}
