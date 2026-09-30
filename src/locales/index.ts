import en from './en';
import hu from './hu';
import sr from './sr';

export const dictionaries = { en, hu, sr } as const;

export type Language = keyof typeof dictionaries;

export function isLanguage(value: unknown): value is Language {
    return typeof value === 'string' && Object.hasOwn(dictionaries, value);
}
