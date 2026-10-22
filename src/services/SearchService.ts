import { col, fn, literal, Op, where, type WhereOptions } from 'sequelize';
import type { Language } from '../locales';
import { Article, Gallery, Product, WebshopCategory } from '../models';

interface SearchOptions {
    language: Language;
    limit?: number;
}

export class SearchService {
    /** Splits the search text into words, returns an empty array for invalid input */
    static parseKeywords(text: unknown): string[] {
        if (typeof text !== 'string') {
            return [];
        }

        return text.split(' ').map(word => word.trim()).filter(word => word.length > 0);
    }

    findProducts(keywords: string[], { language, limit }: SearchOptions): Promise<Product[]> {
        return Product.findAll({
            attributes: [...Product.CARD_ATTRIBUTES],
            include: [{ model: WebshopCategory, as: 'category', attributes: ['name'] }],
            where: { is_active: 1, ...this.matchesAnyKeyword('Product.name', keywords, language) },
            limit,
        });
    }

    findArticles(keywords: string[], { language, limit }: SearchOptions): Promise<Article[]> {
        return Article.findAll({
            attributes: Article.cardAttributesWithCommentsCount(),
            where: { is_active: 1, ...this.matchesAnyKeyword('Article.title', keywords, language) },
            limit,
        });
    }

    findGalleries(keywords: string[], { language, limit }: SearchOptions): Promise<Gallery[]> {
        return Gallery.findAll({
            attributes: ['id', 'gallery_name', 'slug', 'gallery_date', 'gallery_thumbnail'],
            where: { is_active: 1, ...this.matchesAnyKeyword('Gallery.gallery_name', keywords, language) },
            limit,
        });
    }

    /** Case-insensitive LIKE search on one language of a localized JSON column */
    private matchesAnyKeyword(column: string, keywords: string[], language: Language): WhereOptions {
        // The JSON path is a literal: Sequelize doubles the "$" of plain fn() string arguments in SELECT queries.
        // It is safe, because the language is always one of the validated language codes.
        const jsonPath = literal(`'$.${language}'`);
        const localizedValue = fn('LOWER', fn('JSON_UNQUOTE', fn('JSON_EXTRACT', col(column), jsonPath)));

        return {
            [Op.or]: keywords.map(keyword => where(localizedValue, { [Op.like]: `%${this.escapeLikePattern(keyword.toLowerCase())}%` })),
        };
    }

    private escapeLikePattern(text: string): string {
        return text.replace(/[\\%_]/g, character => `\\${character}`);
    }
}
