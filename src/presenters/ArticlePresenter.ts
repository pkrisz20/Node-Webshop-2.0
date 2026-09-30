import type { Language } from '../locales';
import type { Article } from '../models';
import { DateFormatter } from '../utils/DateFormatter';
import { Formatter } from '../utils/Formatter';
import { ImageUrl } from '../utils/ImageUrl';
import { LocalizedField } from '../utils/LocalizedField';

export class ArticlePresenter {
    constructor(private readonly language: Language) {}

    /** The comments count is available only when the query selected `Article.commentsCountAttribute()` */
    toCard(article: Article) {
        return {
            id: article.id,
            title: this.localized(article.title),
            slug: this.localized(article.slug),
            shortDescription: Formatter.limitText(this.localized(article.short_description)),
            image: ImageUrl.of(article.image_thumbnail, 'blogs'),
            author: article.author,
            fullDate: DateFormatter.formatByLanguage(article.date, this.language),
            relativeDate: Formatter.capitalizeFirstLetter(DateFormatter.fromNow(article.date, this.language)),
            commentsCount: article.getCommentsCount(),
            isImportant: Boolean(article.is_important),
        };
    }

    toEvent(article: Article) {
        return {
            id: article.id,
            title: this.localized(article.title),
            slug: this.localized(article.slug),
            image: ImageUrl.of(article.image_thumbnail, 'blogs'),
            date: DateFormatter.fromNow(article.date, this.language),
        };
    }

    toDetails(article: Article) {
        return {
            id: article.id,
            slug: this.localized(article.slug),
            title: this.localized(article.title),
            short_description: this.localized(article.short_description),
            description: this.localized(article.description),
            author: article.author,
            thumb_image: ImageUrl.of(article.image_thumbnail, 'blogs'),
            images: ImageUrl.listOf(article.images, 'blogs'),
            isAllowed: Boolean(article.comments_allowed),
            date: DateFormatter.formatByLanguage(article.date, this.language).toLowerCase(),
        };
    }

    private localized(json: string | null | undefined): string | null {
        return LocalizedField.pick(json, this.language);
    }
}
