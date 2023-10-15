const { db } = require("../../config/db-connection");
const getValueByLanguage = require("../../helpers/getValueByLanguage");
const { setMomentLocale } = require("../../helpers/globalFunctions");
const { getIconByActivity } = require('../../helpers/admin/getIconByActivity');
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
        return res.status(400).render("400", {
            title: languageHandler("errors.wrong_data", lang ?? process.env.ADMIN_LANG),
            current_locale: req.session.lang,
            back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.ADMIN_LANG),
            learn_more: languageHandler("general.information", req.session.lang ?? process.env.ADMIN_LANG),
            csrfToken: req.csrfToken()
        });
    }

    const selectBlogsList = "SELECT id, title, slug, date, author, is_active, created_at, updated_at FROM blogs WHERE date < ? ORDER BY id DESC LIMIT ? OFFSET ?";

    let pageOffset = (page - 1) * parseInt(process.env.ADMIN_PAGINATION);

    db.query(selectBlogsList, [moment(new Date()).format("YYYY-MM-DD"), parseInt(process.env.ADMIN_PAGINATION), pageOffset], (err, blogs_list) => {

        if (err) {
            console.log(err);
            return res.status(500).render("500", {
                title: languageHandler("errors.server_error", lang ?? process.env.ADMIN_LANG),
                current_locale: req.session.lang ?? process.env.ADMIN_LANG,
                back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.ADMIN_LANG),
                learn_more: languageHandler("general.information", req.session.lang ?? process.env.ADMIN_LANG),
                csrfToken: req.csrfToken()
            });
        }

        else if (blogs_list.length == 0) {
            return res.render("admin/products/list", {
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
                    date: moment(item.date).format("YYYY. MMMM DD. HH:mm:ss"),
                };
            });

            let selectForPagination = "SELECT COUNT(blogs.id) AS 'each_article_count' FROM blogs";

            // Select for pagination count
            db.query(selectForPagination, (err_pagination, elementsCount) => {
                if (err_pagination) {
                    console.log(err_pagination);

                    return res.status(500).render("500", {
                        title: languageHandler("errors.server_error", lang ?? process.env.ADMIN_LANG),
                        current_locale: req.session.lang,
                        back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.ADMIN_LANG),
                        learn_more: languageHandler("general.information", req.session.lang ?? process.env.ADMIN_LANG),
                        csrfToken: req.csrfToken()
                    });
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
        title: 'Admin comments list page for products',
        type: "webiste",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the comments list page for products",
        // keywords: []
    };
    setMomentLocale("hu");

    let activeComments = [];
    let newComments = [];
    const lang = req.session.lang ?? process.env.ADMIN_LANG;
    let { page = 1 } = req.query;
    page = parseInt(page);

    if (isNaN(page) || page <= 0) {
        return res.status(400).render("400", {
            title: languageHandler("errors.wrong_data", lang ?? process.env.ADMIN_LANG),
            current_locale: req.session.lang,
            back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.ADMIN_LANG),
            learn_more: languageHandler("general.information", req.session.lang ?? process.env.ADMIN_LANG),
            csrfToken: req.csrfToken()
        });
    }

    const selectProductComments = "SELECT product_comments.id AS 'comment_id', product_comments.name AS 'author_name', product_comments.email, product_comments.comment AS 'comment_text', product_comments.is_active, product_comments.date, products.name AS 'product_name', products.slug AS 'product_slug', products.is_active AS 'product_is_active' FROM product_comments INNER JOIN products ON product_comments.product_id = products.id ORDER BY product_comments.id DESC LIMIT ? OFFSET ?";

    let pageOffset = (page - 1) * parseInt(process.env.ADMIN_PAGINATION);

    db.query(selectProductComments, [parseInt(process.env.ADMIN_PAGINATION), pageOffset], (err, product_comments_list) => {

        if (err) {
            console.log(err);
            return res.status(500).render("500", {
                title: languageHandler("errors.server_error", lang ?? process.env.ADMIN_LANG),
                current_locale: req.session.lang ?? process.env.ADMIN_LANG,
                back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.ADMIN_LANG),
                learn_more: languageHandler("general.information", req.session.lang ?? process.env.ADMIN_LANG),
                csrfToken: req.csrfToken()
            });
        }

        else if (product_comments_list.length == 0) {
            return res.render("admin/products/comments", {
                meta: metas,
                pageCount: 0,
                activeComments: activeComments ?? [],
                newComments: newComments ?? [],
                csrfToken: req.csrfToken()
            });
        }

        else if (product_comments_list.length > 0) {

            product_comments_list = product_comments_list.map(item => {
                return {
                    ...item,
                    isActive: getIconByActivity(item.is_active ?? 0),
                    productIsActive: item.product_is_active,
                    productName: getValueByLanguage(item.product_name, lang ?? process.env.ADMIN_LANG),
                    date: moment(item.date).format("YYYY. MMMM DD. HH:mm:ss"),
                };
            });

            activeComments = product_comments_list.filter(comment => comment.is_active === 1);
            newComments = product_comments_list.filter(comment => comment.is_active !== 1);

            let selectForPagination = "SELECT COUNT(product_comments.id) AS 'each_article_count' FROM product_comments";

            // Select for pagination count
            db.query(selectForPagination, (err_pagination, elementsCount) => {
                if (err_pagination) {
                    console.log(err_pagination);

                    return res.status(500).render("500", {
                        title: languageHandler("errors.server_error", lang ?? process.env.ADMIN_LANG),
                        current_locale: req.session.lang,
                        back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.ADMIN_LANG),
                        learn_more: languageHandler("general.information", req.session.lang ?? process.env.ADMIN_LANG),
                        csrfToken: req.csrfToken()
                    });
                }

                else if (elementsCount) {

                    let leftOver = elementsCount[0].each_article_count % parseInt(process.env.ADMIN_PAGINATION);
                    let pageCount = parseInt(elementsCount[0].each_article_count / parseInt(process.env.ADMIN_PAGINATION));
                    pageCount = leftOver > 0 ? pageCount + 1 : pageCount;

                    return res.render("admin/products/comments", {
                        meta: metas,
                        pageCount: parseInt(pageCount),
                        currentPage: parseInt(page),
                        paginationLink: "products/comments",
                        activeComments: activeComments ?? [],
                        newComments: newComments ?? [],
                        csrfToken: req.csrfToken()
                    });
                }
            });
        }
    });
}

module.exports = { getBlogsList, getBlogsCommentsList };
