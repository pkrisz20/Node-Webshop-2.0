import { NumberParser } from '../utils/NumberParser';

/** Common base of the public and the admin controllers */
export abstract class Controller {
    /** Database id from a route parameter or a form field: a positive integer, otherwise null */
    protected parseId(value: unknown): number | null {
        return NumberParser.positiveInteger(value);
    }
}
