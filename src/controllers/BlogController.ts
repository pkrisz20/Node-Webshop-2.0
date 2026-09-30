import type { Request, Response } from 'express';
import { Op } from 'sequelize';
import { appConfig } from '../config/app';
import { env } from '../config/env';
import { ApiResponse } from '../http/ApiResponse';
import { ErrorPage } from '../http/ErrorPage';
import { MetaBuilder } from '../http/MetaBuilder';
import { Article, ArticleComment } from '../models';
import { ArticlePresenter } from '../presenters/ArticlePresenter';
import { CommentPresenter } from '../presenters/CommentPresenter';
import { CommentService } from '../services/CommentService';
import { DateFormatter } from '../utils/DateFormatter';
import { LocalizedField } from '../utils/LocalizedField';
import { Pagination } from '../utils/Pagination';
import { Controller } from './Controller';

export class BlogController extends Controller {
    constructor(private readonly commentService = new CommentService()) {
        super();
    }

    readonly index = async (req: Request, res: Response): Promise<void> => {
        const { language } = req;
        const pagination = Pagination.fromQuery(req.query, appConfig.pagination.perPage);

        if (!pagination) {
            return ErrorPage.badRequest(req, res);
        }

        const { rows: articles, count } = await Article.findAndCountAll({
            attributes: [...Article.CARD_ATTRIBUTES, Article.commentsCountAttribute()],
            where: { is_active: 1 },
            order: [['date', 'DESC']],
            limit: pagination.limit,
            offset: pagination.offset,
        });

        const articlePresenter = new ArticlePresenter(language);
        const listPath = req.translate('slugs.blogs');

        res.render('pages/blogs', {
            pageCount: pagination.pageCount(count),
            currentPage: pagination.currentPage,
            articleLink: listPath,
            blogs: articles.map(article => articlePresenter.toCard(article)),
            meta: MetaBuilder.page(language, {
                title: req.translate('nav.blog'),
                description: req.translate('meta.blog_description'),
                path: listPath,
            }),
        });
    };

    readonly show = async (req: Request, res: Response): Promise<void> => {
        const { language } = req;
        const articleId = this.parseId(req.params.articleId);
        const article = articleId && await Article.findOne({ where: { id: articleId, is_active: 1 } });

        if (!article) {
            return ErrorPage.notFound(req, res);
        }

        const slug = LocalizedField.pick(article.slug, language);
        const articlePath = `${req.translate('slugs.article')}/${slug}/${article.id}`;

        if (req.params.slugName !== slug) {
            return res.redirect(301, `${env.appUrl}/${language}/${articlePath}`);
        }

        const [newestArticles, upcomingEvents, commentPage] = await Promise.all([
            Article.findAll({
                attributes: [...Article.CARD_ATTRIBUTES, Article.commentsCountAttribute()],
                where: {
                    is_active: 1,
                    id: { [Op.ne]: article.id },
                    date: { [Op.between]: [DateFormatter.monthsAgo(appConfig.newestArticlesMonths), DateFormatter.today()] },
                },
                order: [['id', 'DESC']],
                limit: appConfig.listLimits.newestArticles,
            }),
            Article.findAll({
                attributes: ['id', 'title', 'slug', 'image_thumbnail', 'date'],
                where: { is_active: 1, id: { [Op.ne]: article.id }, date: { [Op.gt]: DateFormatter.today() } },
                order: [['id', 'DESC']],
                limit: appConfig.listLimits.upcomingEvents,
            }),
            article.comments_allowed ? this.commentService.articleComments(article.id) : null,
        ]);

        const articlePresenter = new ArticlePresenter(language);
        const commentPresenter = new CommentPresenter(language);
        const blogDetails = articlePresenter.toDetails(article);

        res.render('pages/blog-details', {
            blogDetails,
            newestBlogs: newestArticles.map(newestArticle => articlePresenter.toCard(newestArticle)),
            nextEvents: upcomingEvents.map(event => articlePresenter.toEvent(event)),
            articleComments: commentPage?.comments.map(comment => commentPresenter.fromArticleComment(comment)) ?? [],
            showLoadMoreButton: commentPage?.hasMore ?? false,
            meta: MetaBuilder.page(language, {
                title: blogDetails.title,
                description: blogDetails.short_description ?? req.translate('meta.description'),
                path: articlePath,
                type: 'article',
                image: blogDetails.thumb_image,
            }),
        });
    };

    readonly storeComment = async (req: Request, res: Response): Promise<void> => {
        const articleId = this.parseId(req.params.itemId);

        const article = articleId && await Article.findOne({
            attributes: ['id'],
            where: { id: articleId, is_active: 1, comments_allowed: 1 },
        });

        if (!article) {
            return ApiResponse.fail(res, 'errors.unprocessable_data');
        }

        const { fullName, email, comment } = req.body;

        await ArticleComment.create({ name: fullName, email, comment, date: new Date(), blog_id: article.id });

        ApiResponse.success(res, { title: req.translate('general.process_success') });
    };

    readonly loadMoreComments = async (req: Request, res: Response): Promise<void> => {
        const articleId = this.parseId(req.body.blogID);
        const page = CommentService.parsePage(req.body.offsetNumber);

        if (!articleId || page === null) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        const { comments, hasMore } = await this.commentService.articleComments(articleId, page);
        const commentPresenter = new CommentPresenter(req.language);

        ApiResponse.success(res, {
            html_response_with_comments: commentPresenter.renderHtml(comments.map(comment => commentPresenter.fromArticleComment(comment))),
            removeLoadButton: !hasMore,
            offsetNumber: page + 1,
        });
    };
}
