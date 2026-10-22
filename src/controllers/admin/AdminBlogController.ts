import type { Request, Response } from 'express';
import { Op, type CreationAttributes, type WhereOptions } from 'sequelize';
import { appConfig } from '../../config/app';
import { ApiResponse } from '../../http/ApiResponse';
import { ErrorPage } from '../../http/ErrorPage';
import { FormInput } from '../../http/FormInput';
import { Article, ArticleComment } from '../../models';
import { DateFormatter } from '../../utils/DateFormatter';
import { ImageUrl } from '../../utils/ImageUrl';
import { LocalizedField } from '../../utils/LocalizedField';
import type { Pagination } from '../../utils/Pagination';
import { Slug } from '../../utils/Slug';
import { TextFormatter } from '../../utils/TextFormatter';
import { AdminController } from './AdminController';

type ArticleAttributes = Omit<CreationAttributes<Article>, 'id' | 'created_at' | 'updated_at'>;

const ARTICLE_FLAGS = ['is_active', 'is_featured', 'is_important', 'comments_allowed'] as const;

/** Blog articles and events, an event is an article dated in the future */
export class AdminBlogController extends AdminController {
    readonly index = async (req: Request, res: Response): Promise<void> => {
        const pagination = this.pagination(req);

        if (!pagination) {
            return ErrorPage.badRequest(req, res);
        }

        const { rows: articles, count } = await this.findArticles({ date: { [Op.lt]: DateFormatter.today() } }, pagination);

        res.render('admin/blogs/list', {
            meta: this.meta('Admin blogs list page', 'This is the blogs list page'),
            pageCount: pagination.pageCount(count),
            currentPage: pagination.currentPage,
            paginationLink: 'blogs',
            blogsList: articles.map(article => ({
                blogId: article.id,
                slug: LocalizedField.pick(article.slug, req.language),
                author: article.author,
                blogTitle: TextFormatter.limitText(LocalizedField.pick(article.title, req.language), appConfig.textLengths.adminListTitle),
                isActiveIcon: this.activityIcon(article.is_active),
                is_active: article.is_active,
                date: this.lastModified(article),
            })),
        });
    };

    readonly events = async (req: Request, res: Response): Promise<void> => {
        const pagination = this.pagination(req);

        if (!pagination) {
            return ErrorPage.badRequest(req, res);
        }

        const { rows: events, count } = await this.findArticles({ date: { [Op.gt]: DateFormatter.today() } }, pagination);

        res.render('admin/events/list', {
            meta: this.meta('Admin events list page', 'This is the events list page'),
            pageCount: pagination.pageCount(count),
            currentPage: pagination.currentPage,
            paginationLink: 'events',
            eventsList: events.map(event => ({
                eventId: event.id,
                slug: LocalizedField.pick(event.slug, req.language),
                eventDate: DateFormatter.toAdminDateTime(event.date),
                author: event.author,
                eventTitle: TextFormatter.limitText(LocalizedField.pick(event.title, req.language), appConfig.textLengths.adminListTitle),
                isActiveIcon: this.activityIcon(event.is_active),
                is_active: event.is_active,
                date: this.lastModified(event),
            })),
        });
    };

    readonly create = (_req: Request, res: Response): void => {
        res.render('admin/blogs/new', {
            meta: this.meta('Új cikk', 'This is the article upload page'),
        });
    };

    readonly store = async (req: Request, res: Response): Promise<void> => {
        const attributes = this.parseForm(req.body);

        if (!attributes) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        const article = await Article.create(attributes);

        this.respondSaved(res, `/admin/blogs/edit/${article.id}`);
    };

    readonly edit = async (req: Request, res: Response): Promise<void> => {
        const articleId = this.parseId(req.params.articleId);

        if (!articleId) {
            return ErrorPage.badRequest(req, res);
        }

        const article = await Article.findByPk(articleId);

        if (!article) {
            return res.redirect('/admin/blogs/new');
        }

        res.render('admin/blogs/edit', {
            formValues: {
                ...LocalizedField.toFormValues({
                    title: article.title,
                    short_description: article.short_description,
                    description: article.description,
                }),
                id: article.id,
                images: ImageUrl.listOf(article.images, 'blogs'),
                image_thumbnail: ImageUrl.of(article.image_thumbnail, 'blogs'),
                author: article.author,
                date: DateFormatter.toDateString(article.date),
                is_active: article.is_active,
                is_featured: article.is_featured,
                is_important: article.is_important,
                is_allowed: article.comments_allowed,
            },
            meta: this.meta('Szerkesztés', 'This is the article edit page'),
        });
    };

    readonly update = async (req: Request, res: Response): Promise<void> => {
        const articleId = this.parseId(req.params.articleId);
        const attributes = this.parseForm(req.body);
        const article = articleId && attributes ? await Article.findByPk(articleId) : null;

        if (!article || !attributes) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        await article.update(attributes);

        this.respondSaved(res, `/admin/blogs/edit/${article.id}`);
    };

    readonly comments = async (req: Request, res: Response): Promise<void> => {
        const pagination = this.pagination(req);

        if (!pagination) {
            return ErrorPage.badRequest(req, res);
        }

        const { rows, count } = await ArticleComment.findAndCountAll({
            include: [{ model: Article, as: 'article', attributes: ['title', 'slug', 'is_active'], required: true }],
            order: [['id', 'DESC']],
            limit: pagination.limit,
            offset: pagination.offset,
        });

        const comments = rows.map(comment => ({
            comment_id: comment.id,
            author_name: comment.name,
            email: comment.email,
            comment_text: comment.comment,
            is_active: comment.is_active,
            date: DateFormatter.toAdminDateTime(comment.date),
            isActive: this.activityIcon(comment.is_active),
            blogIsActive: comment.article?.is_active,
            blogName: TextFormatter.limitText(LocalizedField.pick(comment.article?.title, req.language), appConfig.textLengths.adminListTitle),
            blog_slug: LocalizedField.pick(comment.article?.slug, req.language),
        }));

        res.render('admin/blogs/comments', {
            meta: this.meta('Comments', 'This is the comments list page for blogs and events'),
            pageCount: pagination.pageCount(count),
            currentPage: pagination.currentPage,
            paginationLink: 'blogs/comments',
            activeComments: comments.filter(comment => comment.is_active === 1),
            newComments: comments.filter(comment => comment.is_active !== 1),
        });
    };

    readonly deleteComment = async (req: Request, res: Response): Promise<void> => {
        const commentId = this.parseId(req.params.commentId);
        const deletedCount = commentId ? await ArticleComment.destroy({ where: { id: commentId } }) : 0;

        this.respondDeleted(res, deletedCount);
    };

    private findArticles(where: WhereOptions<Article>, pagination: Pagination) {
        return Article.findAndCountAll({
            attributes: ['id', 'title', 'slug', 'date', 'author', 'is_active', 'created_at', 'updated_at'],
            where,
            order: [['id', 'DESC']],
            limit: pagination.limit,
            offset: pagination.offset,
        });
    }

    private parseForm(body: Record<string, unknown>): ArticleAttributes | null {
        const input = new FormInput(body);
        const flags = input.flags(ARTICLE_FLAGS);
        const author = input.text('author');

        if (!flags || !author || !input.isFilledInEveryLanguage('title')) {
            return null;
        }

        return {
            title: LocalizedField.stringify(input.localized('title')),
            slug: Slug.fromTitles(input.localized('title', { escape: false })),
            short_description: LocalizedField.stringify(input.localized('short_description')),
            description: LocalizedField.stringify(input.localized('article_description', { escape: false })),
            date: input.date('date'),
            author,
            ...flags,
        };
    }
}
