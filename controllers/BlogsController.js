const DoDatabaseQuery = require("../helpers/databaseQueryHelper");
const moment = require("moment");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const { setMomentLocale, capitalizeFirstLetter, numberWithCommas, limitText, escapeHtml } = require("../helpers/globalFunctions");
const languageHandler = require("../helpers/languageHandler");
const formatDateByLang = require('../helpers/formatDateByLocale');
const errorHandler = require('../middleware/errorHandler');
const { showNotFoundPage, showBadRequestPage } = require("../helpers/showErrorPages");
const metaDefault = require('../config/meta');
const gdprCookies = require('../config/gdpr');

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
    var { DB_CONFIG } = req;
    const lang = req.session.lang;
    let { slug } = req.params;
    let result = {};
    let newestBlogsArray = [];
    let incommingEvents = [];
    let articleComments = [];
    let showLoadMoreButton = false;

    const blogDetailsQuery = "SELECT id, title, description, short_description, author, image_thumbnail, images, date, comments_allowed FROM blogs WHERE is_active = ? AND slug = ?";

    const newestBlogsQuery = "SELECT blogs.id, blogs.title, blogs.slug, blogs.short_description, blogs.image_thumbnail, blogs.date, blogs.is_important, blogs.author, (SELECT COUNT(blog_comments.id) FROM blog_comments WHERE blog_comments.id = blogs.id) AS 'comments_count' FROM blogs WHERE blogs.is_active = ? AND blogs.id != ? AND (blogs.date BETWEEN ? AND ?) ORDER BY blogs.id DESC LIMIT ?";

    const incommingEventsQuery = "SELECT blogs.id, blogs.title, blogs.slug, blogs.image_thumbnail, blogs.date FROM blogs WHERE blogs.is_active = ? AND blogs.date > ? AND blogs.id != ? ORDER BY blogs.id DESC LIMIT ?";

    try {
        const data = await DoDatabaseQuery(blogDetailsQuery, [1, slug]);

        if (data.length == 0) {
            return showNotFoundPage(req, res);
        }
        else if (data.length > 0) {
            setMomentLocale(lang);

            result = {
                id: parseInt(data[0].id),
                slug: slug,
                title: getValueByLanguage(data[0].title, lang),
                short_description: getValueByLanguage(data[0].short_description, lang),
                description: getValueByLanguage(data[0].description, lang),
                author: data[0].author,
                thumb_image: imagePathConverter(data[0].image_thumbnail, "blogs"),
                images: imagePathConverter(JSON.parse(data[0].images), "blogs") ?? [],
                isAllowed: Boolean(data[0].comments_allowed),
                date: formatDateByLang(data[0].date, lang ?? process.env.FALLBACK_LANG).toLocaleLowerCase()
            }

            var metas = {
                ...metaDefault,
                title: limitText(result.title, metaDefault.limits['title']) + metaDefault['separator'] + metaDefault['title'],
                lang: metaDefault.langs[lang],
                type: "article",
                url: `${ process.env.APP_URL }/${ lang }/blog/${ slug }`,
                description: limitText(result.short_description ?? languageHandler('meta.description', lang), metaDefault.limits['description']),
                image: {
                    src: result.thumb_image ?? metaDefault['default_og_images'],
                    width: metaDefault['og:image:width'],
                    height: metaDefault['og:image:height'],
                },
            }
        }

        const newestBlog = await DoDatabaseQuery(newestBlogsQuery, [1, result.id, moment(new Date()).subtract(3, 'months').format("YYYY-MM-DD"), moment(new Date()).format("YYYY-MM-DD"), 15]);

        if (newestBlog.length > 0) {
            newestBlog.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    title: getValueByLanguage(element.title, lang),
                    slug: element.slug,
                    shortDescription: getValueByLanguage(element.short_description, lang),
                    image: imagePathConverter(element.image_thumbnail, "blogs"),
                    author: element.author,
                    fullDate: element.date,
                    commentsCount: element.comments_count,
                    isImportant: Boolean(element.is_important) ?? false
                }

                newestBlogsArray.push(tempObject);
            });

            newestBlogsArray = newestBlogsArray.map(item => {
                return {
                    ...item,
                    fullDate: formatDateByLang(item.fullDate, lang ?? process.env.FALLBACK_LANG),
                    relativeDate: capitalizeFirstLetter(moment(item.fullDate, "YYYY-MM-DD").fromNow())
                };
            });
        }

        const incommingEvent = await DoDatabaseQuery(incommingEventsQuery, [1, moment(new Date()).format("YYYY-MM-DD"), result.id, 12]);

        if (incommingEvent.length > 0) {
            incommingEvent.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    title: getValueByLanguage(element.title, lang),
                    slug: element.slug,
                    image: imagePathConverter(element.image_thumbnail, "blogs"),
                    date: moment(element.date).fromNow(),
                }

                incommingEvents.push(tempObject);
            });
        }

        // Select article comments, if they are not disabled
        if (result.isAllowed) {
            const selectBlogComments = "SELECT blog_comments.id, blog_comments.name, blog_comments.comment, blog_comments.date FROM blog_comments WHERE blog_comments.is_active = ? AND blog_comments.blog_id = ? ORDER BY blog_comments.date DESC LIMIT ?";

            const comments_data = await DoDatabaseQuery(selectBlogComments, [1, result.id, parseInt(process.env.COUNT_COMMENTS_SHOW)]);

            if (comments_data.length > 0) {

                comments_data.forEach(element => {
                    let tempObject = {
                        id: parseInt(element.id),
                        name: element.name,
                        description: element.comment,
                        date: element.date,
                    }

                    articleComments.push(tempObject);
                });

                articleComments = articleComments.map(item => {
                    return {
                        ...item,
                        date: moment(item.date, "YYYY-MM-DD HH:mm").fromNow()
                    };
                });

                // Select the active comments count for this blog article to show the load more button or not
                const selectCommentsCountSQL = "SELECT COUNT(blog_comments.id) AS 'each_comments_count' FROM blog_comments WHERE blog_comments.is_active = ? AND blog_comments.blog_id = ?";
                const comments_count = await DoDatabaseQuery(selectCommentsCountSQL, [1, result.id]);

                if (comments_count[0].each_comments_count > parseInt(process.env.COUNT_COMMENTS_SHOW)) {
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
            current_locale: req.session.lang,
            cart: cart,
            locales: ['hu', 'sr', 'en'],
            languageHandler: languageHandler,
            wishlistTotalNumber: req.wishlistTotalNumber,
            DB_CONFIG: DB_CONFIG,
            showPopupCartInformation: req.session.showPopupCartInformation,
            webshopCategories: req.webshopCategories,
            staticContent: req.static_content,
            gdprCookies: gdprCookies,
            gdprAcceptedCookies: JSON.parse(req.cookies['allowed_cookie_types'] ?? '[]'),
            csrfToken: req.csrfToken()
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
    var { DB_CONFIG } = req;
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    let { page = 1 } = req.query;
    let result = [];
    let pageCount = 0;

    var metas = {
        ...metaDefault,
        title: languageHandler("nav.blog", lang) + metaDefault['separator'] + metaDefault['title'],
        lang: metaDefault.langs[lang],
        type: "website",
        url: `${ process.env.APP_URL }/${ lang }/blogs`,
        description: languageHandler('meta.blog_description', lang),
        image: {
            src: metaDefault['default_og_images'],
            width: metaDefault['og:image:width'],
            height: metaDefault['og:image:height'],
        },
    };

    page = parseInt(page);

    if ( isNaN(page) || page <= 0 ) {
        return showBadRequestPage(req, res);
    }

    const sqlQueryPaginatedBlogs = "SELECT blogs.id, blogs.title, blogs.slug, blogs.short_description, blogs.image_thumbnail, blogs.date, blogs.is_important, blogs.author, (SELECT COUNT(blog_comments.id) FROM blog_comments WHERE blog_comments.blog_id = blogs.id) AS 'comments_count' FROM blogs WHERE blogs.is_active = ? ORDER BY blogs.date DESC LIMIT ? OFFSET ?";

    let pageOffset = (page - 1) * parseInt(process.env.PAGINATION);
    setMomentLocale(lang);

    try {
        // Select limit - offset elements
        const data = await DoDatabaseQuery(sqlQueryPaginatedBlogs, [1, parseInt(process.env.PAGINATION), pageOffset]);

        if (data.length > 0) {

            data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    title: getValueByLanguage(element.title, lang),
                    slug: element.slug,
                    shortDescription: getValueByLanguage(element.short_description, lang),
                    image: imagePathConverter(element.image_thumbnail, "blogs"),
                    author: element.author,
                    fullDate: element.date,
                    commentsCount: element.comments_count,
                    isImportant: Boolean(element.is_important) ?? false,
                }

                result.push(tempObject);
            });

            result = result.map(item => {
                return {
                    ...item,
                    fullDate: formatDateByLang(item.fullDate, lang ?? process.env.FALLBACK_LANG),
                    relativeDate: capitalizeFirstLetter(moment(item.fullDate, "YYYY-MM-DD").fromNow()),
                    shortDescription: item.shortDescription ? limitText(item.shortDescription) : null
                };
            });

            // Select for pagination count
            const elementsCount = await DoDatabaseQuery("SELECT COUNT(blogs.id) AS 'each_article_count' FROM blogs WHERE blogs.is_active = ?", [1]);

            if (elementsCount) {
                let leftOver = elementsCount[0].each_article_count % parseInt(process.env.PAGINATION);
                pageCount = parseInt(elementsCount[0].each_article_count / parseInt(process.env.PAGINATION));
                pageCount = leftOver > 0 ? pageCount + 1 : pageCount;
            }
        }

        return res.render("pages/blogs", {
            pageCount: parseInt(pageCount ?? 0),
            currentPage: parseInt(page ?? 0),
            articleLink: "blogs" ?? null,
            blogs: result ?? [],
            meta: metas,
            current_locale: req.session.lang,
            cart: cart,
            locales: ['hu', 'sr', 'en'],
            languageHandler: languageHandler,
            DB_CONFIG: DB_CONFIG,
            showPopupCartInformation: req.session.showPopupCartInformation,
            wishlistTotalNumber: req.wishlistTotalNumber,
            webshopCategories: req.webshopCategories,
            staticContent: req.static_content,
            gdprCookies: gdprCookies,
            gdprAcceptedCookies: JSON.parse(req.cookies['allowed_cookie_types'] ?? '[]'),
            csrfToken: req.csrfToken()
        });
    }
    catch (error) {
        return errorHandler(error, req, res, 'blogsController');
    }
}

const handleBlogComment = async (req, res) => {
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    const { fullName } = req.body;
    const { email } = req.body;
    const { comment } = req.body;

    const sqlQueryInsertComment = "INSERT INTO blog_comments (name, email, comment, date, blog_id) VALUES (?, ?, ?, ?, ?)";

    try {
        const result = await DoDatabaseQuery(sqlQueryInsertComment, [fullName, email, comment, moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), req.params.itemId]);

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
    let selectedComments = [];
    let commentsHtml = "";
    let removeLoadButton = true;
    offsetNumber = parseInt(offsetNumber);
    blogID = parseInt(blogID);

    if ( isNaN(offsetNumber) || isNaN(blogID) ) {
        return res.status(200).json({
            status: "error",
            title: languageHandler('errors.error', lang),
            message: languageHandler('errors.wrong_data', lang),
            csrfToken: req.csrfToken()
        });
    }

    offsetNumber = offsetNumber * parseInt(process.env.COUNT_COMMENTS_SHOW);

    const selectMoreComments = "SELECT blog_comments.id, blog_comments.name, blog_comments.comment, blog_comments.date FROM blog_comments WHERE blog_comments.is_active = ? AND blog_comments.blog_id = ? ORDER BY blog_comments.date DESC LIMIT ? OFFSET ?";

    try {
        const comments_data = await DoDatabaseQuery(selectMoreComments, [1, blogID, parseInt(process.env.COUNT_COMMENTS_SHOW), offsetNumber]);

        if (comments_data.length > 0) {
            setMomentLocale(lang);

            comments_data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    name: element.name,
                    description: element.comment,
                    date: element.date,
                }

                selectedComments.push(tempObject);
            });

            selectedComments = selectedComments.map(item => {
                return {
                    ...item,
                    date: moment(item.date, "YYYY-MM-DD HH:mm").fromNow()
                };
            });

            // Parse the comments into HTML response
            selectedComments.forEach(comment => {
                commentsHtml += `
                    <div class="comments-container-box">
                        <div class="content">
                            <div class="content__top">
                                <strong class="content__top-name">${ escapeHtml(comment.name) }</strong>
                            </div>
                        <p class="content-comment">${ escapeHtml(comment.description) }</p>
                        <time class="content-date"><i class="fas fa-history"></i> ${ comment.date }</time>
                    </div>
                </div>`;
            });

            // Calculate the leftover comments from db (still show load more button or not)
            const selectCommentsCountSQL = "SELECT COUNT(blog_comments.id) AS 'each_comments_count' FROM blog_comments WHERE blog_comments.is_active = ? AND blog_comments.blog_id = ?";

            const comments_count = await DoDatabaseQuery(selectCommentsCountSQL, [1, blogID]);

            // Offsetnumber => the number of comments which have to skipped
            // COUNT_COMMENTS_SHOW => the number of comments which can be loaded by default & on button click to load more
            // In this if statement has to be Offsetnumber + the COUNT_COMMENTS_SHOW, because already the first comments are loaded
            if (comments_count[0].each_comments_count > (offsetNumber + parseInt(process.env.COUNT_COMMENTS_SHOW))) {
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
