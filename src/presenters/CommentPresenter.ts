import type { Language } from '../locales';
import type { ArticleComment, ProductComment } from '../models';
import { DateFormatter } from '../utils/DateFormatter';
import { Formatter } from '../utils/Formatter';
import { Translator } from '../utils/Translator';

export interface CommentView {
    id: number;
    name: string;
    description: string;
    date: string;
    rating?: number;
    is_verified?: boolean;
}

export class CommentPresenter {
    constructor(private readonly language: Language) {}

    fromProductComment(comment: ProductComment): CommentView {
        return {
            id: comment.id,
            rating: comment.rating ?? 0,
            name: comment.name,
            is_verified: Boolean(comment.is_verified_purchase),
            description: comment.comment,
            date: DateFormatter.fromNow(comment.date, this.language),
        };
    }

    fromArticleComment(comment: ArticleComment): CommentView {
        return {
            id: comment.id,
            name: comment.name,
            description: comment.comment,
            date: DateFormatter.fromNow(comment.date, this.language),
        };
    }

    /** HTML of the comments loaded by the "load more" button */
    renderHtml(comments: CommentView[]): string {
        return comments.map(comment => `
            <div class="comments-container-box">
                <div class="content">
                    <div class="content__top">
                        <strong class="content__top-name">${Formatter.escapeHtml(comment.name)}</strong>
                        ${this.renderVerifiedBadge(comment)}
                        ${this.renderRating(comment)}
                    </div>
                    <p class="content-comment">${Formatter.escapeHtml(comment.description)}</p>
                    <time class="content-date"><i class="fas fa-history"></i> ${comment.date}</time>
                </div>
            </div>`).join('');
    }

    private renderVerifiedBadge(comment: CommentView): string {
        if (!comment.is_verified) {
            return '';
        }

        const label = Translator.translate('products.verified_purchase', this.language);
        return `<span class="content__top-badge"><i class="fas fa-check-circle icon"></i>${label}</span>`;
    }

    private renderRating(comment: CommentView): string {
        if (!comment.rating || comment.rating <= 0) {
            return '';
        }

        return `<span class="content__top-rating">${'<i class="fas fa-star"></i>'.repeat(comment.rating)}</span>`;
    }
}
