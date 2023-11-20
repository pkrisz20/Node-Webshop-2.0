const { db } = require("../../config/db-connection");
const getValueByLanguage = require("../../helpers/getValueByLanguage");
const { setMomentLocale, limitText } = require("../../helpers/globalFunctions");
const { getIconByActivity } = require('../../helpers/admin/getIconByActivity');
const { showServerErrorPage, showBadRequestPage } = require("../../helpers/showErrorPages");
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

module.exports = { getBlogsList, getBlogsCommentsList, getEventsList, deleteArticleComment };
