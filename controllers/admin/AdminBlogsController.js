const { db } = require("../../config/db-connection");
const getValueByLanguage = require("../../helpers/getValueByLanguage");
const imagePathConverter = require("../../helpers/imagePathConverter");
const { setMomentLocale, limitText, escapeHtml } = require("../../helpers/globalFunctions");
const { getIconByActivity } = require('../../helpers/admin/getIconByActivity');
const { showServerErrorPage, showBadRequestPage } = require("../../helpers/showErrorPages");
const getValidFormValues = require("../../helpers/admin/getValidFormValues");
const { generateUniqueSlug } = require("../../helpers/admin/generateSlug");
const languageHandler = require("../../helpers/languageHandler");
const moment = require("moment");

const getBlogsList = (req, res) => {
    var metas = {
        title: 'Admin blogs list page',
        type: "webiste",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the blogs list page",
        // keywords: []
    };
    setMomentLocale("hu");

    let blogsList = [];
    const lang = req.session.lang ?? process.env.ADMIN_LANG;
    let { page = 1 } = req.query;
    page = parseInt(page);

    if (isNaN(page) || page <= 0) {
        return showBadRequestPage(req, res);
    }

    const selectBlogsList = "SELECT id, title, slug, author, is_active, created_at, updated_at FROM blogs WHERE date < ? ORDER BY id DESC LIMIT ? OFFSET ?";

    let pageOffset = (page - 1) * parseInt(process.env.ADMIN_PAGINATION);

    db.query(selectBlogsList, [moment(new Date()).format("YYYY-MM-DD"), parseInt(process.env.ADMIN_PAGINATION), pageOffset], (err, blogs_list) => {

        if (err) {
            console.log(err);
            return showServerErrorPage(req, res);
        }

        else if (blogs_list.length == 0) {
            return res.render("admin/blogs/list", {
                meta: metas,
                pageCount: 0,
                blogsList: blogsList ?? [],
                csrfToken: req.csrfToken()
            });
        }

        else if (blogs_list.length > 0) {

            blogs_list.forEach(blog => {
                let tempObject = {
                    blogId: parseInt(blog.id),
                    slug: blog.slug,
                    author: blog.author,
                    blogTitle: getValueByLanguage(blog.title, lang),
                    isActiveIcon: getIconByActivity(blog.is_active ?? 0),
                    is_active: parseInt(blog.is_active),
                    date: blog.updated_at != null ? blog.updated_at : blog.created_at,
                }

                blogsList.push(tempObject);
            });

            blogsList = blogsList.map(item => {
                return {
                    ...item,
                    blogTitle: limitText(item.blogTitle, 40),
                    date: moment(item.date).format("YYYY. MMMM DD. HH:mm:ss"),
                };
            });

            let selectForPagination = "SELECT COUNT(blogs.id) AS 'each_article_count' FROM blogs WHERE blogs.date < ?";

            // Select for pagination count
            db.query(selectForPagination, moment(new Date()).format("YYYY-MM-DD"), (err_pagination, elementsCount) => {
                if (err_pagination) {
                    console.log(err_pagination);

                    return showServerErrorPage(req, res);
                }

                else if (elementsCount) {

                    let leftOver = elementsCount[0].each_article_count % parseInt(process.env.ADMIN_PAGINATION);
                    let pageCount = parseInt(elementsCount[0].each_article_count / parseInt(process.env.ADMIN_PAGINATION));
                    pageCount = leftOver > 0 ? pageCount + 1 : pageCount;

                    return res.render("admin/blogs/list", {
                        meta: metas,
                        pageCount: parseInt(pageCount),
                        currentPage: parseInt(page),
                        paginationLink: "blogs",
                        blogsList: blogsList ?? [],
                        csrfToken: req.csrfToken()
                    });
                }
            });
        }
    });
}

const getBlogsCommentsList = (req, res) => {
    var metas = {
        title: 'Comments',
        type: "webiste",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the comments list page for blogs and events",
        // keywords: []
    };
    setMomentLocale("hu");

    let activeComments = [];
    let newComments = [];
    const lang = req.session.lang ?? process.env.ADMIN_LANG;
    let { page = 1 } = req.query;
    page = parseInt(page);

    if (isNaN(page) || page <= 0) {
        return showBadRequestPage(req, res);
    }

    const selectBlogsComments = "SELECT blog_comments.id AS 'comment_id', blog_comments.name AS 'author_name', blog_comments.email, blog_comments.comment AS 'comment_text', blog_comments.is_active, blog_comments.date, blogs.title AS 'blog_name', blogs.slug AS 'blog_slug', blogs.is_active AS 'blog_is_active' FROM blog_comments INNER JOIN blogs ON blog_comments.blog_id = blogs.id ORDER BY blog_comments.id DESC LIMIT ? OFFSET ?";

    let pageOffset = (page - 1) * parseInt(process.env.ADMIN_PAGINATION);

    db.query(selectBlogsComments, [parseInt(process.env.ADMIN_PAGINATION), pageOffset], (err, blog_comments_list) => {

        if (err) {
            console.log(err);
            return showServerErrorPage(req, res);
        }

        else if (blog_comments_list.length === 0) {
            return res.render("admin/blogs/comments", {
                meta: metas,
                pageCount: 0,
                activeComments: activeComments ?? [],
                newComments: newComments ?? [],
                csrfToken: req.csrfToken()
            });
        }

        else if (blog_comments_list.length > 0) {

            blog_comments_list = blog_comments_list.map(item => {
                return {
                    ...item,
                    isActive: getIconByActivity(item.is_active ?? 0),
                    blogIsActive: parseInt(item.blog_is_active),
                    blogName: limitText(getValueByLanguage(item.blog_name, lang ?? process.env.ADMIN_LANG), 40),
                    date: moment(item.date).format("YYYY. MMMM DD. HH:mm:ss"),
                };
            });

            activeComments = blog_comments_list.filter(comment => comment.is_active === 1);
            newComments = blog_comments_list.filter(comment => comment.is_active !== 1);

            let selectForPagination = "SELECT COUNT(blog_comments.id) AS 'each_article_count' FROM blog_comments";

            // Select for pagination count
            db.query(selectForPagination, (err_pagination, elementsCount) => {
                if (err_pagination) {
                    console.log(err_pagination);

                    return showServerErrorPage(req, res);
                }

                else if (elementsCount) {

                    let leftOver = elementsCount[0].each_article_count % parseInt(process.env.ADMIN_PAGINATION);
                    let pageCount = parseInt(elementsCount[0].each_article_count / parseInt(process.env.ADMIN_PAGINATION));
                    pageCount = leftOver > 0 ? pageCount + 1 : pageCount;

                    return res.render("admin/blogs/comments", {
                        meta: metas,
                        pageCount: parseInt(pageCount),
                        currentPage: parseInt(page),
                        paginationLink: "blogs/comments",
                        activeComments: activeComments ?? [],
                        newComments: newComments ?? [],
                        csrfToken: req.csrfToken()
                    });
                }
            });
        }
    });
}

const getEventsList = (req, res) => {
    var metas = {
        title: 'Admin events list page',
        type: "webiste",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the events list page",
        // keywords: []
    };
    setMomentLocale("hu");

    let eventsList = [];
    const lang = req.session.lang ?? process.env.ADMIN_LANG;
    let { page = 1 } = req.query;
    page = parseInt(page);

    if (isNaN(page) || page <= 0) {
        return showBadRequestPage(req, res);
    }

    const selectEventsList = "SELECT id, title, slug, date, author, is_active, created_at, updated_at FROM blogs WHERE date > ? ORDER BY id DESC LIMIT ? OFFSET ?";

    let pageOffset = (page - 1) * parseInt(process.env.ADMIN_PAGINATION);

    db.query(selectEventsList, [moment(new Date()).format("YYYY-MM-DD"), parseInt(process.env.ADMIN_PAGINATION), pageOffset], (err, events_list) => {

        if (err) {
            console.log(err);
            return showServerErrorPage(req, res);
        }

        else if (events_list.length === 0) {
            return res.render("admin/events/list", {
                meta: metas,
                pageCount: 0,
                eventsList: eventsList ?? [],
                csrfToken: req.csrfToken()
            });
        }

        else if (events_list.length > 0) {

            events_list.forEach(event => {
                let tempObject = {
                    eventId: parseInt(event.id),
                    slug: event.slug,
                    eventDate: event.date,
                    author: event.author,
                    eventTitle: getValueByLanguage(event.title, lang),
                    isActiveIcon: getIconByActivity(event.is_active ?? 0),
                    is_active: parseInt(event.is_active),
                    date: event.updated_at != null ? event.updated_at : event.created_at,
                }

                eventsList.push(tempObject);
            });

            eventsList = eventsList.map(item => {
                return {
                    ...item,
                    eventTitle: limitText(item.eventTitle, 40),
                    date: moment(item.date).format("YYYY. MMMM DD. HH:mm:ss"),
                    eventDate: moment(item.eventDate).format("YYYY. MMMM DD. HH:mm:ss"),
                };
            });

            let selectForPagination = "SELECT COUNT(blogs.id) AS 'each_article_count' FROM blogs WHERE blogs.date > ?";

            // Select for pagination count
            db.query(selectForPagination, moment(new Date()).format("YYYY-MM-DD"), (err_pagination, elementsCount) => {
                if (err_pagination) {
                    console.log(err_pagination);

                    return showServerErrorPage(req, res);
                }

                else if (elementsCount) {

                    let leftOver = elementsCount[0].each_article_count % parseInt(process.env.ADMIN_PAGINATION);
                    let pageCount = parseInt(elementsCount[0].each_article_count / parseInt(process.env.ADMIN_PAGINATION));
                    pageCount = leftOver > 0 ? pageCount + 1 : pageCount;

                    return res.render("admin/events/list", {
                        meta: metas,
                        pageCount: parseInt(pageCount),
                        currentPage: parseInt(page),
                        paginationLink: "events",
                        eventsList: eventsList ?? [],
                        csrfToken: req.csrfToken()
                    });
                }
            });
        }
    });
}

const deleteArticleComment = (req, res) => {
    let { commentId } = req.params;

    const deleteArticleCommentQuery = "DELETE FROM blog_comments WHERE id = ?";

    db.query(deleteArticleCommentQuery, commentId, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(200).json({ status: "error" });
        }
        else {
            return res.status(200).json({ status: "success" });
        }
    });
}

const getArticleUploadPage = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    var metas = {
        title: "Új cikk",
        type: "website",
        url: `${ process.env.APP_URL }/admin/blogs/new`,
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the article upload page",
    };

    return res.render("admin/blogs/new", {
        meta: metas,
        current_locale: lang,
        csrfToken: req.csrfToken()
    });
}

const handleArticleUpload = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    let articleData = req.body;

    // Boolean types data check
    let is_active = parseInt(articleData.is_active ?? 0);
    let is_featured = parseInt(articleData.is_featured ?? 0);
    let comments_allowed = parseInt(articleData.comments_allowed ?? 0);

    if (
        isNaN(is_active)
        || isNaN(is_featured)
        || isNaN(comments_allowed)
        || !articleData['author']
    )
    {
        return res.status(200).json({
            status: 'error',
            title: languageHandler('errors.error', lang),
            text: languageHandler('errors.wrong_data', lang),
            csrfToken: req.csrfToken()
        });
    }

    // The article names are required
    let articleTitles = {
        en: escapeHtml(articleData['title[en]']),
        sr: escapeHtml(articleData['title[sr]']),
        hu: escapeHtml(articleData['title[hu]']),
    };
    // The short description simple textarea, it's a string
    let shortDescriptions = {
        en: articleData['short_description[en]'].length > 0 ? escapeHtml(articleData['short_description[en]']) : null,
        sr: articleData['short_description[sr]'].length > 0 ? escapeHtml(articleData['short_description[sr]']) : null,
        hu: articleData['short_description[hu]'].length > 0 ? escapeHtml(articleData['short_description[hu]']) : null
    };

    let longDescriptions = {
        en: articleData['article_description[en]'] ?? null,
        sr: articleData['article_description[sr]'] ?? null,
        hu: articleData['article_description[hu]'] ?? null
    };

    const SQLInsertArticle = "INSERT INTO blogs (title, short_description, description, date, author, is_active, is_featured, comments_allowed, created_at) VALUES(?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(
        SQLInsertArticle,
        [
            JSON.stringify(articleTitles),
            JSON.stringify(shortDescriptions),
            JSON.stringify(longDescriptions),
            articleData['date'],
            articleData['author'],
            is_active,
            is_featured,
            comments_allowed,
            moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        ],
        (err, data) => {
            if (err) {
                console.log(err);
                return res.status(200).json({ status: "error", csrfToken: req.csrfToken() });
            }

            else if (data.affectedRows > 0) {

                // Slug generate for product with inserted id
                let generatedSlug = generateUniqueSlug(articleData["name[en]"], data.insertId);

                if ( generatedSlug === false ) {
                    return res.status(200).json({
                        status: 'error',
                        title: languageHandler('errors.error', lang),
                        text: languageHandler('errors.slug_error', lang),
                        csrfToken: req.csrfToken()
                    });
                }
                else {
                    const updateSlugForArticle = "UPDATE blogs SET slug = ? WHERE id = ?";

                    db.query(updateSlugForArticle,
                        [
                            generatedSlug,
                            data.insertId
                        ],
                        (update_err, queryStatus) => {
                            if (update_err) {
                                console.log(update_err);
                                return res.status(200).json({ status: "error", csrfToken: req.csrfToken() });
                            }
                            else if (queryStatus.changedRows > 0) {
                                return res.status(200).json({
                                    status: "success",
                                    redirect_url: `/admin/blogs/edit/${ data.insertId }`,
                                    csrfToken: req.csrfToken()
                                });
                            }
                            else {
                                return res.status(200).json({
                                    status: 'error',
                                    title: languageHandler('errors.error', lang),
                                    csrfToken: req.csrfToken()
                                });
                            }
                        }
                    );
                }
            }
        }
    );
}

const getArticleEditPage = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    var metas = {
        title: "Szerkesztés",
        type: "website",
        url: `${ process.env.APP_URL }/blogs/edit`,
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the article edit page",
    };

    let { articleId } = req.params;
    articleId = parseInt(articleId);

    if ( isNaN(articleId) ) {
        return showBadRequestPage(req, res);
    }

    // function params => Table, database ID, callback
    getValidFormValues('blogs', articleId, function (err, DBformData) {
        // If there is ANY error, then the ID does not exist -> show new upload form
        if (err) {
            return res.redirect('/admin/blogs/new');
        }

        // If HAS form values, then show edit page
        else if ( DBformData.length > 0 ) {

            const validLanguages = process.env.VALID_LANGS.split(',');
            let formValues = DBformData[0];
            let formattedValues = {
                en: {},
                hu: {},
                sr: {}
            };

            setMomentLocale("hu");

            // Convert & format the form values
            validLanguages.forEach(currentLanguage => {
                formattedValues[currentLanguage].title = getValueByLanguage(formValues.title, currentLanguage);
                formattedValues[currentLanguage].short_description = formValues.short_description != null ? getValueByLanguage(formValues.short_description, currentLanguage) : null;
                formattedValues[currentLanguage].description = formValues.description != null ? getValueByLanguage(formValues.description, currentLanguage) : null;
            });

            formattedValues.images = formValues.images != null ? imagePathConverter(JSON.parse(formValues.images), 'blogs') : null;
            formattedValues.image_thumbnail = formValues.image_thumbnail != null ? imagePathConverter(formValues.image_thumbnail, 'blogs') : null;
            formattedValues.id = parseInt(formValues.id);
            formattedValues.author = formValues.author;
            formattedValues.date = moment(formValues.date).format("YYYY-MM-DD");
            formattedValues.is_active = parseInt(formValues.is_active);
            formattedValues.is_featured = parseInt(formValues.is_featured);
            formattedValues.comments_allowed = parseInt(formValues.comments_allowed);

            return res.render("admin/blogs/edit", {
                formValues: formattedValues,
                meta: metas,
                current_locale: lang,
                csrfToken: req.csrfToken()
            });
        }

        // If NO form values, then show new article upload page
        else if ( DBformData.length === 0 ) {
            return res.redirect('/admin/blogs/new');
        }
    });
}

const handleEditArticle = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    let articleData = req.body;
    let { articleId } = req.params;

    // Boolean types data check
    let is_active = parseInt(articleData.is_active ?? 0);
    let is_featured = parseInt(articleData.is_featured ?? 0);
    let comments_allowed = parseInt(articleData.comments_allowed ?? 0);
    articleId = parseInt(articleId);

    if (
        isNaN(is_active)
        || isNaN(is_featured)
        || isNaN(comments_allowed)
        || isNaN(articleId)
        || !articleData['author']
    )
    {
        return res.status(200).json({
            status: 'error',
            title: languageHandler('errors.error', lang),
            text: languageHandler('errors.wrong_data', lang),
            csrfToken: req.csrfToken()
        });
    }

    // The product names are required
    let titleNames = {
        en: escapeHtml(articleData['title[en]']),
        sr: escapeHtml(articleData['title[sr]']),
        hu: escapeHtml(articleData['title[hu]']),
    };
    // The short description simple textarea, it's a string
    let shortDescriptions = {
        en: articleData['short_description[en]'].length > 0 ? escapeHtml(articleData['short_description[en]']) : null,
        sr: articleData['short_description[sr]'].length > 0 ? escapeHtml(articleData['short_description[sr]']) : null,
        hu: articleData['short_description[hu]'].length > 0 ? escapeHtml(articleData['short_description[hu]']) : null
    };

    // NOTE: For some reason here I do not need to escape the HTML, cause it stores in db as escaped format
    let longDescriptions = {
        en: articleData['article_description[en]'] ?? null,
        sr: articleData['article_description[sr]'] ?? null,
        hu: articleData['article_description[hu]'] ?? null
    };

    const SQLUpdateArticle = "UPDATE blogs SET title = ?, short_description = ?, description = ?, date = ?, author = ?, is_active = ?, is_featured = ?, comments_allowed = ?, updated_at = ? WHERE id = ?";

    db.query(
        SQLUpdateArticle,
        [
            JSON.stringify(titleNames),
            JSON.stringify(shortDescriptions),
            JSON.stringify(longDescriptions),
            articleData['date'],
            articleData['author'],
            is_active,
            is_featured,
            comments_allowed,
            moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            articleId
        ],
        (err, data) => {
            if (err) {
                console.log(err);
                return res.status(200).json({ status: "error", csrfToken: req.csrfToken() });
            }

            else if (data.affectedRows > 0) {
                return res.status(200).json({
                    status: "success",
                    redirect_url: `/admin/blogs/edit/${ articleId }`,
                    csrfToken: req.csrfToken()
                });
            }
        }
    );
}

module.exports = {
    getBlogsList,
    getBlogsCommentsList,
    getEventsList,
    deleteArticleComment,
    getArticleUploadPage,
    handleArticleUpload,
    getArticleEditPage,
    handleEditArticle
};
