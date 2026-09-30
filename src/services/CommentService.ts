import { appConfig } from '../config/app';
import { ArticleComment, ProductComment } from '../models';

export interface CommentPage<TComment> {
    comments: TComment[];
    hasMore: boolean;
}

/** Paginates the active comments, the "load more" button requests the next page */
export class CommentService {
    private readonly pageSize = appConfig.pagination.commentsPerPage;

    async productComments(productId: number, page = 0): Promise<CommentPage<ProductComment>> {
        const offset = page * this.pageSize;
        const { rows, count } = await ProductComment.findAndCountAll({
            where: { product_id: productId, is_active: 1 },
            order: [['date', 'DESC']],
            limit: this.pageSize,
            offset,
        });

        return { comments: rows, hasMore: count > offset + this.pageSize };
    }

    async articleComments(articleId: number, page = 0): Promise<CommentPage<ArticleComment>> {
        const offset = page * this.pageSize;
        const { rows, count } = await ArticleComment.findAndCountAll({
            where: { blog_id: articleId, is_active: 1 },
            order: [['date', 'DESC']],
            limit: this.pageSize,
            offset,
        });

        return { comments: rows, hasMore: count > offset + this.pageSize };
    }

    /** Page number sent by the "load more" button, null for invalid input */
    static parsePage(value: unknown): number | null {
        const page = Number(value);
        return Number.isInteger(page) && page >= 0 ? page : null;
    }
}
