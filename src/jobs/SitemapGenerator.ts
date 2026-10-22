import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env';
import { paths } from '../config/paths';
import type { Language } from '../locales';
import { Article, Gallery, Product, WebshopCategory } from '../models';
import { DateFormatter } from '../utils/DateFormatter';
import { LocalizedField } from '../utils/LocalizedField';
import { TextFormatter } from '../utils/TextFormatter';
import { Translator } from '../utils/Translator';

interface SitemapUrl {
    loc: string;
    lastmod: string;
    changefreq: 'never' | 'daily';
    priority: number;
}

interface SluggedRecord {
    id: number;
    slug: string | null;
}

/** Translation keys of the list pages without database content */
const STATIC_PAGE_SLUG_KEYS = [
    'slugs.products',
    'slugs.blogs',
    'slugs.galleries',
    'slugs.faq',
    'slugs.cart',
    'slugs.wishlist',
    'slugs.contact',
    'slugs.about_us',
];

export class SitemapGenerator {
    async generate(): Promise<void> {
        const today = DateFormatter.today();
        const staticUrls = this.staticPageUrls(today);
        const detailUrls = await this.detailPageUrls(today);

        await fs.writeFile(path.join(paths.public, 'sitemap.xml'), this.toXml([...staticUrls, ...detailUrls]));
        await fs.writeFile(path.join(paths.public, 'robots.txt'), this.robotsTxt());
    }

    private staticPageUrls(today: string): SitemapUrl[] {
        return STATIC_PAGE_SLUG_KEYS.flatMap(slugKey => env.languages.valid.map(language => ({
            loc: `${env.appUrl}/${language}/${Translator.translate(slugKey, language)}`,
            lastmod: today,
            changefreq: 'never' as const,
            priority: 0.8,
        })));
    }

    private async detailPageUrls(today: string): Promise<SitemapUrl[]> {
        const [products, articles, galleries, categories] = await Promise.all([
            Product.findAll({ attributes: ['id', 'slug'], where: { is_active: 1 } }),
            Article.findAll({ attributes: ['id', 'slug'], where: { is_active: 1 } }),
            Gallery.findAll({ attributes: ['id', 'slug'], where: { is_active: 1 } }),
            WebshopCategory.findAll({ attributes: ['id', 'slug'] }),
        ]);

        const pagePaths = env.languages.valid.flatMap(language => [
            ...this.detailPaths(products, language, (slug, id) => `${Translator.translate('slugs.product', language)}/${slug}/${id}`),
            ...this.detailPaths(articles, language, (slug, id) => `${Translator.translate('slugs.article', language)}/${slug}/${id}`),
            ...this.detailPaths(galleries, language, (slug, id) => `${Translator.translate('slugs.gallery', language)}/${slug}/${id}`),
            ...this.detailPaths(categories, language, (slug, id) => `${slug}/${Translator.translate('slugs.products', language)}/${id}`),
        ].map(pagePath => `${language}/${pagePath}`));

        return pagePaths.map(pagePath => ({
            loc: `${env.appUrl}/${pagePath}`,
            lastmod: today,
            changefreq: 'daily',
            priority: 0.9,
        }));
    }

    private detailPaths(records: SluggedRecord[], language: Language, buildPath: (slug: string, id: number) => string): string[] {
        return records.flatMap(record => {
            const slug = LocalizedField.pick(record.slug, language);
            return slug ? [buildPath(slug, record.id)] : [];
        });
    }

    private toXml(urls: SitemapUrl[]): string {
        const entries = urls.map(url => [
            '  <url>',
            `    <loc>${TextFormatter.escapeHtml(url.loc)}</loc>`,
            `    <lastmod>${url.lastmod}</lastmod>`,
            `    <changefreq>${url.changefreq}</changefreq>`,
            `    <priority>${url.priority}</priority>`,
            '  </url>',
        ].join('\n'));

        return [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ...entries,
            '</urlset>',
        ].join('\n');
    }

    private robotsTxt(): string {
        return `User-agent: JoobleBot\nDisallow: /\nUser-agent: *\nDisallow: /admin\nSitemap: ${env.appUrl}/sitemap.xml`;
    }
}
