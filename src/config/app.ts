import type { Language } from '../locales';
import { env } from './env';

/**
 * Application settings: every tunable value of the shop in one place.
 * Available in the templates as `config` (e.g. <%= config.priceFormat.currency %>).
 * Secrets and environment specific values stay in the .env file (see ./env.ts).
 */
export const appConfig = {
    /**
     * Display of the prices. These are the defaults, the "Pénznem" and "Ezres elválasztó" admin settings override them
     * (see SiteConfigService.priceFormatOf). The templates get the resolved values as `currency` and `formatAmount()`.
     */
    priceFormat: {
        /** Shown after every price */
        currency: 'RSD',
        /** Key of `thousandsSeparators` */
        thousandsSeparator: 'dot',
        /** Selectable thousands separators, the space is a non-breaking space, so a price never wraps into two lines */
        thousandsSeparators: {
            dot: '.',
            comma: ',',
            space: '\u00A0',
        },
    },

    pagination: {
        /** Items per page of the public lists (PAGINATION in .env overrides it) */
        perPage: env.pagination.perPage,
        /** Items per page of the admin lists (ADMIN_PAGINATION in .env overrides it) */
        adminPerPage: env.pagination.adminPerPage,
        /** Comments shown at once, the "load more" button loads the same amount (COUNT_COMMENTS_SHOW in .env overrides it) */
        commentsPerPage: env.pagination.commentsPerPage,
        /** Options of the "products per page" select */
        productLimitOptions: [12, 24, 36],
        /** Page links shown on both sides of the current page */
        pageLinkRadius: 2,
    },

    /** Maximum number of items of the smaller lists */
    listLimits: {
        quickSearchResults: 10,
        relatedGalleries: 15,
        newestArticles: 15,
        upcomingEvents: 12,
        dashboardLatestOrders: 15,
    },

    /** The "newest articles" box shows the articles of the last N months */
    newestArticlesMonths: 3,

    productFilters: {
        /** Step of the price range slider, its range comes from the cheapest and the most expensive product */
        priceStep: 10,
    },

    /** Maximum length of the shortened texts (a longer text ends with "...") */
    textLengths: {
        excerpt: 90,
        adminListTitle: 40,
        adminListQuestion: 60,
    },

    dateFormats: {
        /** Dates of the public pages (moment.js format) */
        byLanguage: {
            en: 'YYYY MMMM DD.',
            hu: 'YYYY MMMM DD.',
            sr: 'DD. MMMM YYYY',
        } satisfies Record<Language, string>,
        adminDateTime: 'YYYY. MMMM DD. HH:mm:ss',
        adminShortDateTime: 'YYYY. MMMM DD. HH:mm',
    },

    /** Maximum lengths of the public form fields, used by the backend validation and the form inputs */
    forms: {
        comment: {
            nameMaxLength: 100,
            emailMaxLength: 100,
            textMaxLength: 1000,
            maxRating: 5,
        },
        contact: {
            nameMaxLength: 100,
            cityMaxLength: 150,
            phoneMaxLength: 15,
            emailMaxLength: 100,
            messageMaxLength: 1000,
        },
        order: {
            nameMaxLength: 100,
            phoneMaxLength: 15,
            emailMaxLength: 100,
            cityMaxLength: 100,
            postcodeMaxLength: 6,
            addressMaxLength: 100,
            noteMaxLength: 1000,
        },
    },

    uploads: {
        maxImageSizeInBytes: 4_000_000,
        allowedImageExtensions: ['jpg', 'jpeg', 'png'],
    },

    security: {
        sessionLifetimeDays: 30,
        /** Admin login attempts per hour and IP address */
        loginAttemptsPerHour: 5,
        /** reCAPTCHA v3 score (0 - 1) above which a request counts as human */
        recaptchaMinScore: 0.7,
        requestBodyLimit: '300mb',
    },

    /** Lifetime of the cookie storing the accepted cookie types of the GDPR panel */
    cookieConsentLifetimeDays: 365,
} as const;

export type AppConfig = typeof appConfig;
