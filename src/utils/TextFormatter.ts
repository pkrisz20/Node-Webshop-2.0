import { appConfig } from '../config/app';

/** Text helpers, the prices are formatted by `PriceFormat`, the dates by `DateFormatter` */
export class TextFormatter {
    static capitalizeFirstLetter(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    static limitText(text: string | null | undefined, maxLength: number = appConfig.textLengths.excerpt): string | null {
        if (!text) {
            return null;
        }

        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    }

    /** For the HTML built in TypeScript (the templates escape with `<%= %>`), a missing value becomes an empty string */
    static escapeHtml(text: string | null | undefined): string {
        return (text ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
