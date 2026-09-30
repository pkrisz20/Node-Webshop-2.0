import slugify from 'slugify';
import { LocalizedField, type LocalizedValues } from './LocalizedField';

export class Slug {
    /** Generates the localized slug JSON from the localized titles */
    static fromTitles(titles: LocalizedValues): string {
        const slugs = {} as LocalizedValues;

        for (const [language, title] of Object.entries(titles) as Array<[keyof LocalizedValues, string | null]>) {
            slugs[language] = title ? slugify(title, { replacement: '-', lower: true, trim: true }) : null;
        }

        return LocalizedField.stringify(slugs);
    }
}
