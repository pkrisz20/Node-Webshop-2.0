import { col, fn } from 'sequelize';
import { appConfig } from '../config/app';
import { ArticleComment, ProductComment } from '../models';

export interface CommentPage<TComment> {
    comments: TComment[];
    hasMore: boolean;
}

export interface ProductRating {
    average: number;
    count: number;
}

interface RatingRow {
    average: number | string | null;
    count: number | string;
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

    /** Average and count of the ratings, comments without rating count as 0 in the average */
    async productRating(productId: number): Promise<ProductRating> {
        const row = await ProductComment.findOne({
            attributes: [
                [fn('AVG', fn('COALESCE', col('rating'), 0)), 'average'],
                [fn('COUNT', col('rating')), 'count'],
            ],
            where: { product_id: productId },
            raw: true,
        }) as unknown as RatingRow | null;

        return {
            average: Number(row?.average ?? 0),
            count: Number(row?.count ?? 0),
        };
    }
}
