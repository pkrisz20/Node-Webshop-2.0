const DoDatabaseQuery = require("../helpers/databaseQueryHelper");
const moment = require("moment");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const { setMomentLocale, capitalizeFirstLetter, numberWithCommas, limitText, escapeHtml } = require("../helpers/globalFunctions");
const languageHandler = require("../helpers/languageHandler");
const dateTimeHelper = require('../helpers/dateTimeHelper');
const errorHandler = require('../middleware/errorHandler');
const { showNotFoundPage, showBadRequestPage } = require("../helpers/showErrorPages");
const metaDefault = require('../config/meta');
const { sequelize, Article, ArticleComment } = require("../models");
const { Sequelize } = require('sequelize');
const { getSlug } = require("../helpers/admin/slugHelper");

const getBlogDetails = async (req, res) => {
    // Cart converting stuffs
    var cart = {
        items: req.session.cart ?? [],
        totalCount: req.session.totalCount,
        totalPrice: numberWithCommas(req.session.totalPrice)
    };
    cart.items = cart.items.map(item => {
        return {
            ...item,
            price: numberWithCommas(item.price)
        }
    });

    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    let { slugName, articleId } = req.params;
    let result = {};
    let showLoadMoreButton = false;

    try {
        const data = await Article.findOne({
            attributes: [
                'id',
                'title',
                'description',
                'short_description',
                'slug',
                'author',
                'image_thumbnail',
                'images',
                'date',
                'comments_allowed'
            ],
            where: {
                is_active: 1,
                id: articleId,
            },
        });

        if (!data) {
            return showNotFoundPage(req, res);
        }
        else if (data) {
            var currentSlug = getSlug(data.slug, lang);

            if (slugName !== currentSlug) {
                return res.redirect(301, process.env.APP_URL + `/${ lang }/` + languageHandler('slugs.article', lang) + `/${ currentSlug }/${ articleId }`);
            }

            setMomentLocale(lang);

            result = {
                id: parseInt(data.id),
                slug: currentSlug,
                title: getValueByLanguage(data.title, lang),
                short_description: getValueByLanguage(data.short_description, lang),
                description: getValueByLanguage(data.description, lang),
                author: data.author,
                thumb_image: imagePathConverter(data.image_thumbnail, "blogs"),
                images: imagePathConverter(JSON.parse(data.images), "blogs") ?? [],
                isAllowed: Boolean(data.comments_allowed),
                date: dateTimeHelper.formatDateByLang(data.date, lang ?? process.env.FALLBACK_LANG).toLocaleLowerCase()
            }

            var metas = {
                ...metaDefault,
                title: limitText(result.title, metaDefault.limits['title']) + metaDefault['separator'] + metaDefault['title'],
                lang: metaDefault.langs[lang],
                type: "article",
                url: `${ process.env.APP_URL }/${ lang }/` + languageHandler('slugs.article', lang) + `/${ currentSlug }/${ articleId }`,
                description: limitText(result.short_description ?? languageHandler('meta.description', lang), metaDefault.limits['description']),
                image: {
                    src: result.thumb_image ?? metaDefault['default_og_images'],
                    width: metaDefault['og:image:width'],
                    height: metaDefault['og:image:height'],
                },
            }
        }

        const newestBlog = await Article.findAll({
            attributes: [
                'id',
                'title',
                'slug',
                'short_description',
                'image_thumbnail',
                'date',
                'is_important',
                'author',
                [
                    sequelize.literal(`(SELECT COUNT(blog_comments.id) FROM blog_comments WHERE blog_comments.blog_id = Article.id)`),
                    'comments_count',
                ],
            ],
            where: {
                is_active: 1,
                id: {
                    [Sequelize.Op.ne]: result.id,
                },
                date: {
                    [Sequelize.Op.between]: [moment(new Date()).subtract(3, 'months').format("YYYY-MM-DD"), moment(new Date()).format("YYYY-MM-DD")],
                },
            },
            order: [['id', 'DESC']],
            limit: 15,
        });

        if (newestBlog.length > 0) {
            var newestBlogsArray = newestBlog.map(element => {
                return {
                    id: parseInt(element.id),
                    title: getValueByLanguage(element.title, lang),
                    slug: getSlug(element.slug, lang),
                    shortDescription: getValueByLanguage(element.short_description, lang),
                    image: imagePathConverter(element.image_thumbnail, "blogs"),
                    author: element.author,
                    fullDate: dateTimeHelper.formatDateByLang(element.date, lang ?? process.env.FALLBACK_LANG),
                    relativeDate: capitalizeFirstLetter(moment(element.date, "YYYY-MM-DD").fromNow()),
                    commentsCount: element.dataValues.comments_count,
                    isImportant: Boolean(element.is_important) ?? false
                }
            });
        }

        const events_data = await Article.findAll({
            attributes: ['id', 'title', 'slug', 'image_thumbnail', 'date'],
            where: {
                is_active: 1,
                date: {
                    [Sequelize.Op.gt]: moment(new Date()).format("YYYY-MM-DD"),
                },
                id: {
                    [Sequelize.Op.ne]: result.id,
                },
            },
            order: [['id', 'DESC']],
            limit: 12,
        });

        if (events_data.length > 0) {
            var incommingEvents = events_data.map(element => {
                return {
                    id: parseInt(element.id),
                    title: getValueByLanguage(element.title, lang),
                    slug: getSlug(element.slug, lang),
                    image: imagePathConverter(element.image_thumbnail, "blogs"),
                    date: moment(element.date).fromNow(),
                }
            });
        }

        // Select article comments, if they are not disabled
        if (result.isAllowed) {
            const comments_data = await ArticleComment.findAll({
                attributes: ['id', 'name', 'comment', 'date'],
                where: {
                    is_active: 1,
                    blog_id: result.id,
                },
                order: [['date', 'DESC']],
                limit: parseInt(process.env.COUNT_COMMENTS_SHOW),
            });

            if (comments_data.length > 0) {
                var articleComments = comments_data.map(element => {
                    return {
                        id: parseInt(element.id),
                        name: element.name,
                        description: element.comment,
                        date: moment(element.date, "YYYY-MM-DD HH:mm").fromNow()
                    }
                });

                const eachCommentsCount = await ArticleComment.count({
                    where: {
                        is_active: 1,
                        blog_id: result.id,
                    },
                });

                if (eachCommentsCount > parseInt(process.env.COUNT_COMMENTS_SHOW)) {
                    showLoadMoreButton = true;
                }
            }
        }

        return res.render("pages/blog-details", {
            blogDetails: result,
            newestBlogs: newestBlogsArray ?? [],
            nextEvents: incommingEvents ?? [],
            articleComments: articleComments ?? [],
            showLoadMoreButton: showLoadMoreButton ?? false,
            meta: metas,
            cart: cart,
        });
    }
    catch (error) {
        return errorHandler(error, req, res, 'blogsController');
    }
}

const getAllBlogs = async (req, res) => {
    // Cart converting stuffs
    var cart = {
        items: req.session.cart ?? [],
        totalCount: req.session.totalCount,
        totalPrice: numberWithCommas(req.session.totalPrice)
    };
    cart.items = cart.items.map(item => {
        return {
            ...item,
            price: numberWithCommas(item.price)
        }
    });

    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    let pageCount = 0;
    let { page = 1 } = req.query;
    page = parseInt(page);
    if (isNaN(page)) return showBadRequestPage(req, res);
    if (page <= 0) return showBadRequestPage(req, res);

    var metas = {
        ...metaDefault,
        title: languageHandler("nav.blog", lang) + metaDefault['separator'] + metaDefault['title'],
        lang: metaDefault.langs[lang],
        type: "website",
        url: `${ process.env.APP_URL }/${ lang }/` + languageHandler('slugs.blogs', lang),
        description: languageHandler('meta.blog_description', lang),
        image: {
            src: metaDefault['default_og_images'],
            width: metaDefault['og:image:width'],
            height: metaDefault['og:image:height'],
        },
    };

    let pageOffset = (page - 1) * parseInt(process.env.PAGINATION);
    setMomentLocale(lang);

    try {
        // Select limit - offset elements
        const data = await Article.findAll({
            where: {
                is_active: 1,
            },
            attributes: [
                'id',
                'title',
                'slug',
                'short_description',
                'image_thumbnail',
                'date',
                'is_important',
                'author',
                [
                    sequelize.literal(`(SELECT COUNT(blog_comments.id) FROM blog_comments WHERE blog_comments.blog_id = Article.id)`),
                    'comments_count',
                ],
            ],
            order: [['date', 'DESC']],
            limit: parseInt(process.env.PAGINATION),
            offset: pageOffset,
        });

        if (data.length > 0) {
            var result = data.map(element => {
                return {
                    id: parseInt(element.id),
                    title: getValueByLanguage(element.title, lang),
                    slug: getSlug(element.slug, lang),
                    shortDescription: limitText(getValueByLanguage(element.short_description ?? null, lang)),
                    image: imagePathConverter(element.image_thumbnail, "blogs"),
                    author: element.author,
                    fullDate: dateTimeHelper.formatDateByLang(element.date, lang),
                    relativeDate: capitalizeFirstLetter(moment(element.date, "YYYY-MM-DD").fromNow()),
                    commentsCount: element.dataValues.comments_count,
                    isImportant: Boolean(element.is_important) ?? false,
                }
            });

            // Select for pagination count
            const elementsCount = await Article.count({
                where: {
                    is_active: 1,
                },
            });

            if (elementsCount > 0) {
                let leftOver = elementsCount % parseInt(process.env.PAGINATION);
                pageCount = parseInt(elementsCount / parseInt(process.env.PAGINATION));
                pageCount = leftOver > 0 ? pageCount + 1 : pageCount;
            }
        }

        return res.render("pages/blogs", {
            pageCount: parseInt(pageCount ?? 0),
            currentPage: parseInt(page ?? 0),
            articleLink: languageHandler('slugs.blogs', lang) ?? null,
            blogs: result ?? [],
            meta: metas,
            cart: cart,
        });
    }
    catch (error) {
        return errorHandler(error, req, res, 'blogsController');
    }
}

const handleBlogComment = async (req, res) => {
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    const { fullName, email, comment } = req.body;

    if (isNaN(parseInt(req.params.itemId))) {
        return res.status(200).json({
            status: "error",
            title: languageHandler("errors.error", lang),
            content: languageHandler("errors.unprocessable_data", lang),
            csrfToken: req.csrfToken()
        });
    }

    try {
        const result = await ArticleComment.create({
            name: fullName,
            email: email,
            comment: comment,
            date: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            blog_id: req.params.itemId,
        });

        if (!result) {
            return res.status(200).json({
                status: "error",
                title: languageHandler("errors.error", lang),
                content: languageHandler("errors.common_error", lang),
                csrfToken: req.csrfToken()
            });
        }
        else if (result) {
            return res.status(200).json({ status: "success", title: languageHandler("general.process_success", lang) });
        }
    }
    catch (error) {
        errorHandler(error, req, res, 'blogsController', 317, true);

        return res.status(200).json({
            status: "error",
            title: languageHandler("errors.error", lang),
            content: languageHandler("errors.common_error", lang),
            csrfToken: req.csrfToken()
        });
    }
}

const ajaxLoadMoreComments = async (req, res) => {
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    let { offsetNumber, blogID } = req.body;
    let commentsHtml = "";
    let removeLoadButton = true;
    offsetNumber = parseInt(offsetNumber);
    blogID = parseInt(blogID);

    if (isNaN(offsetNumber) || isNaN(blogID)) {
        return res.status(200).json({
            status: "error",
            title: languageHandler('errors.error', lang),
            message: languageHandler('errors.wrong_data', lang),
            csrfToken: req.csrfToken()
        });
    }

    offsetNumber = offsetNumber * parseInt(process.env.COUNT_COMMENTS_SHOW);

    try {
        const comments_data = await ArticleComment.findAll({
            where: {
                is_active: 1,
                blog_id: blogID,
            },
            attributes: ['name', 'comment', 'date'],
            order: [['date', 'DESC']],
            limit: parseInt(process.env.COUNT_COMMENTS_SHOW),
            offset: offsetNumber,
        });

        if (comments_data.length > 0) {
            setMomentLocale(lang);

            // Parse the comments into HTML response
            comments_data.forEach(item => {
                commentsHtml += `
                    <div class="comments-container-box">
                        <div class="content">
                            <div class="content__top">
                                <strong class="content__top-name">${ escapeHtml(item.name) }</strong>
                            </div>
                        <p class="content-comment">${ escapeHtml(item.comment) }</p>
                        <time class="content-date"><i class="fas fa-history"></i> ${ moment(item.date, "YYYY-MM-DD HH:mm").fromNow() }</time>
                    </div>
                </div>`;
            });

            // Calculate the leftover comments from db (still show load more button or not)
            const commentsCount = await ArticleComment.count({
                where: {
                    is_active: 1,
                    blog_id: blogID
                }
            });

            // Offsetnumber => the number of comments which have to skipped
            // COUNT_COMMENTS_SHOW => the number of comments which can be loaded by default & on button click to load more
            // In this if statement has to be Offsetnumber + the COUNT_COMMENTS_SHOW, because already the first comments are loaded
            if (commentsCount > (offsetNumber + parseInt(process.env.COUNT_COMMENTS_SHOW))) {
                removeLoadButton = false;
            }
        }

        return res.status(200).json({
            status: "success",
            html_response_with_comments: commentsHtml ?? '',
            removeLoadButton: removeLoadButton ?? true,
            offsetNumber: (offsetNumber / parseInt(process.env.COUNT_COMMENTS_SHOW)) + 1,
            csrfToken: req.csrfToken()
        });
    }
    catch (error) {
        errorHandler(error, req, res, 'blogsController', 410, true);

        return res.status(200).json({
            status: "error",
            title: languageHandler('errors.error', lang),
            message: languageHandler('errors.common_error', lang),
            csrfToken: req.csrfToken()
        });
    }
};

module.exports = { getAllBlogs, getBlogDetails, handleBlogComment, ajaxLoadMoreComments };
