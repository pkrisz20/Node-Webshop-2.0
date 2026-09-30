import { env } from './env';
import type { Language } from '../locales';

export const metaDefaults = Object.freeze({
    title: env.siteName,
    separator: ' | ',
    limits: {
        title: 60,
        description: 150,
    },
    langs: {
        sr: 'sr-Latn',
        en: 'en',
        hu: 'hu',
    } satisfies Record<Language, string>,
    'og:image:width': 1200,
    'og:image:height': 630,
    robots: 'index, follow',
    'google-site-verification': env.googleSiteVerification || false,
    googlebot: 'noodp',
    slurp: 'noydir',
    msnbot: 'noodp',
    'og:type': 'website',
});

export const DEFAULT_OG_IMAGE_PATH = '/images/cover_default.png';
