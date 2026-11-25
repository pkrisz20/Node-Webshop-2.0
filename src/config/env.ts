import dotenv from 'dotenv';
import { paths } from './paths';
import { isLanguage, type Language } from '../locales';

dotenv.config({ path: paths.envFile });

function readString(key: string, fallback = ''): string {
    return process.env[key]?.trim() || fallback;
}

function readInteger(key: string, fallback: number): number {
    const value = Number.parseInt(readString(key), 10);
    return Number.isNaN(value) ? fallback : value;
}

function readBoolean(key: string): boolean {
    return readString(key) === 'true';
}

function readLanguage(key: string, fallback: Language): Language {
    const value = readString(key);
    return isLanguage(value) ? value : fallback;
}

function readLanguages(key: string): Language[] {
    const languages = readString(key).split(',').map(language => language.trim()).filter(isLanguage);
    return languages.length > 0 ? languages : ['hu', 'en', 'sr'];
}

const debugFlag = readString('APP_DEBUG');

export const env = Object.freeze({
    siteName: readString('SITE_NAME'),
    appUrl: readString('APP_URL'),
    appDomain: readString('APP_DOMAIN'),
    port: readInteger('PORT', 5000),
    isDebug: debugFlag === 'true',
    isProduction: debugFlag === 'false',
    gdprEnabled: readBoolean('GDPR_ENABLED'),
    googleSiteVerification: readString('GOOGLE_SITE_VERIFICATION'),
    recaptchaSecretKey: readString('RECAPTCHA_SECRET_KEY'),
    /** Only the source of the defaults, read them through appConfig.pagination */
    pagination: {
        perPage: readInteger('PAGINATION', 12),
        adminPerPage: readInteger('ADMIN_PAGINATION', 20),
        commentsPerPage: readInteger('COUNT_COMMENTS_SHOW', 3),
    },
    languages: {
        valid: readLanguages('VALID_LANGS'),
        fallback: readLanguage('FALLBACK_LANG', 'en'),
        admin: readLanguage('ADMIN_LANG', 'hu'),
    },
    database: {
        host: readString('DB_HOST', 'localhost'),
        name: readString('DB_DATABASE'),
        username: readString('DB_USERNAME'),
        password: readString('DB_PASSWORD'),
        timezone: readString('DB_TIMEZONE'),
    },
    sessionSecret: readString('SESSION_SECRET'),
    admin: {
        username: readString('ADMIN_USERNAME'),
        password: readString('ADMIN_PWD'),
    },
});
