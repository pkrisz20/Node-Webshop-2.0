import type { Article } from '../models';
import { DateFormatter } from '../utils/DateFormatter';
import { ImageUrl } from '../utils/ImageUrl';
import { TextFormatter } from '../utils/TextFormatter';
import { Presenter } from './Presenter';

export class ArticlePresenter extends Presenter {
    /** The comments count is available only when the query selected `Article.commentsCountAttribute()` */
    toCard(article: Article) {
        return {
            id: article.id,
            title: this.localized(article.title),
            slug: this.localized(article.slug),
            shortDescription: TextFormatter.limitText(this.localized(article.short_description)),
            image: ImageUrl.of(article.image_thumbnail, 'blogs'),
            author: article.author,
            fullDate: DateFormatter.formatByLanguage(article.date, this.language),
            relativeDate: TextFormatter.capitalizeFirstLetter(DateFormatter.fromNow(article.date, this.language)),
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
            commentsAllowed: Boolean(article.comments_allowed),
            date: DateFormatter.formatByLanguage(article.date, this.language).toLowerCase(),
        };
    }
}
