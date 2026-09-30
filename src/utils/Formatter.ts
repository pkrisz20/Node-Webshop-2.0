import { randomBytes } from 'crypto';
import { appConfig } from '../config/app';

/** Text helpers, the prices are formatted by `PriceFormat` */
export class Formatter {
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

    /** Short random identifier, used for order ids and uploaded file names */
    static createUniqueId(): string {
        return randomBytes(6).toString('hex') + Date.now().toString(36);
    }
}
