import { env } from '../config/env';
import { DEFAULT_OG_IMAGE_PATH, metaDefaults } from '../config/meta';
import type { Language } from '../locales';
import { AssetManifest } from '../utils/AssetManifest';
import { TextFormatter } from '../utils/TextFormatter';

interface PageMetaOptions {
    title: string | null;
    description: string | null;
    /** URL path after the language segment, e.g. "products" or "blog/my-article/12" */
    path?: string;
    type?: 'website' | 'article';
    image?: string | null;
}

export interface AdminMeta {
    title: string;
    type: string;
    image: string;
    description: string;
}

export class MetaBuilder {
    /** SEO and Open Graph data of the public pages (views/partials/head.ejs) */
    static page(language: Language, { title, description, path = '', type = 'website', image = null }: PageMetaOptions) {
        const languageUrl = `${env.appUrl}/${language}`;

        return {
            ...metaDefaults,
            title: (TextFormatter.limitText(title, metaDefaults.limits.title) ?? '') + metaDefaults.separator + metaDefaults.title,
            lang: metaDefaults.htmlLanguageCodes[language],
            type,
            url: path ? `${languageUrl}/${path}` : languageUrl,
            description: TextFormatter.limitText(description, metaDefaults.limits.description),
            image: {
                src: image ?? AssetManifest.url(DEFAULT_OG_IMAGE_PATH),
                width: metaDefaults['og:image:width'],
                height: metaDefaults['og:image:height'],
            },
        };
    }

    /** Meta data of the admin pages (views/admin/partials/head.ejs) */
    static admin(title: string, description = ''): AdminMeta {
        return {
            title,
            type: 'website',
            image: `${env.appUrl}/images/logo.png`,
            description,
        };
    }
}
