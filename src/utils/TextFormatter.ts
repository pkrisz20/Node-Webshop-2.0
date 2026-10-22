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

    static escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
