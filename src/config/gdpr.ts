import { env } from './env';

export const gdprCookies = Object.freeze({
    domain: env.appDomain,
    types: [
        { type: 'necessary', checked: true, disabled: true },
        { type: 'preferences', checked: true, disabled: false },
        { type: 'statistics', checked: true, disabled: false },
        { type: 'marketing', checked: false, disabled: false },
    ],
});

export const GDPR_COOKIE_NAME = 'allowed_cookie_types';
export const NECESSARY_COOKIE_TYPE = 'necessary';
