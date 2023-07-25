const { db } = require("../config/db-config");
const moment = require("moment");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const { setMomentLocale, capitalizeFirstLetter, numberWithCommas } = require("../helpers/globalFunctions");
const languageHandler = require("../helpers/languageHandler");
const getFrontTranslations = require("../helpers/frontTranslations");

const getBlogDetails = (req, res) => {
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
    const lang = req.session.lang;
    let { slug } = req.params;
    let result = {};
    let newestBlogsArray = [];
    let incommingEvents = [];
    let articleComments = [];

    const blogDetailsQuery = "SELECT id, title, description, image_thumbnail, date, comments_allowed FROM blogs WHERE is_active = ? AND slug = ?";

    const newestBlogsQuery = "SELECT blogs.id, blogs.title, blogs.slug, blogs.short_description, blogs.image_thumbnail, blogs.date, blogs.author, (SELECT COUNT(blog_comments.id) FROM blog_comments WHERE blog_comments.id = blogs.id) AS 'comments_count' FROM blogs WHERE blogs.is_active = ? AND blogs.id != ? AND (blogs.date BETWEEN ? AND ?) ORDER BY blogs.id DESC LIMIT ?";

    const incommingEventsQuery = "SELECT blogs.id, blogs.title, blogs.slug, blogs.image_thumbnail, blogs.date FROM blogs WHERE blogs.is_active = ? AND blogs.date > ? ORDER BY blogs.id DESC LIMIT ?";

    db.query(blogDetailsQuery, [1, slug], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).render("500", {
                title: languageHandler("errors.server_error", lang ?? process.env.FALLBACK_LANG),
                current_locale: req.session.lang,
                back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
                learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
                csrfToken: req.csrfToken()
            });
        }

        else if (data.length == 0) {
            return res.status(404).render('404', {
                current_locale: lang ?? process.env.FALLBACK_LANG,
                title: languageHandler("errors.not_found", lang ?? process.env.FALLBACK_LANG),
                back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
                learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
                csrfToken: req.csrfToken()
            });
        }

        else if (data.length > 0) {
            setMomentLocale(lang);

            result = {
                id: parseInt(data[0].id),
                title: getValueByLanguage(data[0].title, lang),
                description: getValueByLanguage(data[0].description, lang),
                image: imagePathConverter(data[0].image_thumbnail, "blogs"),
                isAllowed: Boolean(data[0].comments_allowed),
                date: moment(data[0].date).format("YYYY. MMMM DD.").toLocaleLowerCase()
            }

            // Select article comments, if they are not disabled
            if (result.isAllowed) {
                const selectBlogComments = "SELECT blog_comments.id, blog_comments.name, blog_comments.comment, blog_comments.date FROM blog_comments WHERE blog_comments.is_active = ? AND blog_comments.blog_id = ?";

                db.query(selectBlogComments, [1, result.id], (comments_err, comments_data) => {
                    if (comments_err) {
                        console.log(comments_err);
                        return res.status(500).render("500", {
                            title: languageHandler("errors.server_error", lang ?? process.env.FALLBACK_LANG),
                            current_locale: req.session.lang,
                            back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
                            learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
                            csrfToken: req.csrfToken()
                        });
                    }

                    else if (comments_data.length > 0) {

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
                    }
                });
            }

            var metas = {
                title: result.title,
                type: "article",
                image: `${ process.env.APP_URL }/images/logo.png`,
                description: `This is the details blog page of ${ result.title }`,
                // keywords: []
            };

            db.query(newestBlogsQuery, [1, result.id, moment(new Date()).subtract(3, 'months').format("YYYY-MM-DD"), moment(new Date()).format("YYYY-MM-DD"), 15], (err, newestBlog) => {

                if (err) {
                    console.log(err);
                    return res.status(500).render("500", {
                        title: languageHandler("errors.server_error", lang ?? process.env.FALLBACK_LANG),
                        current_locale: req.session.lang,
                        back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
                        learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
                        csrfToken: req.csrfToken()
                    });
                }

                else if (newestBlog.length > 0) {
                    newestBlog.forEach(element => {
                        let tempObject = {
                            id: parseInt(element.id),
                            title: getValueByLanguage(element.title, lang),
                            slug: element.slug,
                            shortDescription: getValueByLanguage(element.short_description, lang),
                            image: imagePathConverter(element.image_thumbnail, "blogs"),
                            author: element.author,
                            fullDate: element.date,
                            commentsCount: element.comments_count
                        }

                        newestBlogsArray.push(tempObject);
                    });

                    newestBlogsArray = newestBlogsArray.map(item => {
                        return {
                            ...item,
                            fullDate: moment(item.fullDate).format("YYYY MMMM DD."),
                            relativeDate: capitalizeFirstLetter(moment(item.fullDate, "YYYY-MM-DD").fromNow())
                        };
                    });
                }

                db.query(incommingEventsQuery, [1, moment(new Date()).format("YYYY-MM-DD"), 8], (err, incommingEvent) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).render("500", {
                            title: languageHandler("errors.server_error", lang ?? process.env.FALLBACK_LANG),
                            current_locale: req.session.lang,
                            back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
                            learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
                            csrfToken: req.csrfToken()
                        });
                    }

                    else if (incommingEvent.length > 0) {
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

                    return res.render("pages/blog-details", {
                        blogDetails: result,
                        newestBlogs: newestBlogsArray ?? [],
                        nextEvents: incommingEvents ?? [],
                        articleComments: articleComments ?? [],
                        frontTranslations: result.isAllowed ? getFrontTranslations(req.session.lang) : {},
                        meta: metas,
                        current_locale: req.session.lang,
                        cart: cart,
                        locales: ['hu', 'sr', 'en'],
                        languageHandler: languageHandler,
                        csrfToken: req.csrfToken()
                    });
                });
            });
        }
    });
}

const getAllBlogs = (req, res) => {
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
    const lang = req.session.lang;
    let { page = 1 } = req.query;
    let result = [];
    var metas = {
        title: languageHandler("nav.blog", lang),
        type: "page",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the blog list page",
        // keywords: []
    };

    page = parseInt(page);

    if ( isNaN(page) ) {
        return res.status(400).render("400", {
            title: languageHandler("errors.wrong_data", lang ?? process.env.FALLBACK_LANG),
            current_locale: req.session.lang,
            back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
            learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
            csrfToken: req.csrfToken()
        });
    }

    const sqlQueryPaginatedBlogs = "SELECT blogs.id, blogs.title, blogs.slug, blogs.short_description, blogs.image_thumbnail, blogs.date, blogs.author, (SELECT COUNT(blog_comments.id) FROM blog_comments WHERE blog_comments.blog_id = blogs.id) AS 'comments_count' FROM blogs WHERE blogs.is_active = ? ORDER BY blogs.date DESC LIMIT ? OFFSET ?";

    if (typeof page !== "number" || page <= 0) {
        return res.status(400).render("400", {
            title: languageHandler("errors.wrong_data", lang ?? process.env.FALLBACK_LANG),
            current_locale: req.session.lang,
            back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
            learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
            csrfToken: req.csrfToken()
        });
    }

    let pageOffset = (page - 1) * parseInt(process.env.PAGINATION);
    setMomentLocale(lang);

    // Select limit - offset elements
    db.query(sqlQueryPaginatedBlogs, [1, parseInt(process.env.PAGINATION), pageOffset], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).render("500", {
                title: languageHandler("errors.server_error", lang ?? process.env.FALLBACK_LANG),
                current_locale: req.session.lang,
                back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
                learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
                csrfToken: req.csrfToken()
            });
        }

        else if (data.length == 0) {
            return res.render("pages/blogs", {
                pageCount: 0,
                blogs: [],
                meta: metas,
                current_locale: req.session.lang,
                cart: cart,
                locales: ['hu', 'sr', 'en'],
                languageHandler: languageHandler,
                csrfToken: req.csrfToken()
            });
        }

        else if (data.length > 0) {

            data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    title: getValueByLanguage(element.title, lang),
                    slug: element.slug,
                    shortDescription: getValueByLanguage(element.short_description, lang),
                    image: imagePathConverter(element.image_thumbnail, "blogs"),
                    author: element.author,
                    fullDate: element.date,
                    commentsCount: element.comments_count
                }

                result.push(tempObject);
            });

            result = result.map(item => {
                return {
                    ...item,
                    fullDate: moment(item.fullDate).format("YYYY MMMM DD."),
                    relativeDate: capitalizeFirstLetter(moment(item.fullDate, "YYYY-MM-DD").fromNow())
                };
            });

            // Select for pagination count
            db.query("SELECT COUNT(blogs.id) AS 'each_article_count' FROM blogs WHERE blogs.is_active = ?", 1, (err, elementsCount) => {
                if (err) {
                    console.log(err);
                    return res.status(500).render("500", {
                        title: languageHandler("errors.server_error", lang ?? process.env.FALLBACK_LANG),
                        current_locale: req.session.lang,
                        back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
                        learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
                        csrfToken: req.csrfToken()
                    });
                }

                else if (elementsCount) {

                    let leftOver = elementsCount[0].each_article_count % parseInt(process.env.PAGINATION);
                    let pageCount = parseInt(elementsCount[0].each_article_count / parseInt(process.env.PAGINATION));
                    pageCount = leftOver > 0 ? pageCount + 1 : pageCount;

                    return res.render("pages/blogs", {
                        pageCount: pageCount,
                        currentPage: page,
                        articleLink: "blogs",
                        blogs: result ?? [],
                        meta: metas,
                        current_locale: req.session.lang,
                        cart: cart,
                        locales: ['hu', 'sr', 'en'],
                        languageHandler: languageHandler,
                        csrfToken: req.csrfToken()
                    });
                }
            });
        }
    });
}

const handleBlogComment = (req, res) => {
    const lang = req.session.lang;
    const { fullName } = req.body;
    const { email } = req.body;
    const { comment } = req.body;

    const sqlQueryInsertComment = "INSERT INTO blog_comments (name, email, comment, date, blog_id) VALUES (?, ?, ?, ?, ?)";

    db.query(sqlQueryInsertComment, [fullName, email, comment, moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), req.params.itemId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(200).json({
                status: "error",
                title: languageHandler("errors.error", lang ?? process.env.FALLBACK_LANG),
                content: languageHandler("errors.common_error", lang ?? process.env.FALLBACK_LANG)
            });
        }

        if (!result) {
            return res.status(200).json({
                status: "error",
                title: languageHandler("errors.error", lang ?? process.env.FALLBACK_LANG),
                content: languageHandler("errors.common_error", lang ?? process.env.FALLBACK_LANG)
            });
        }
        else if (result) {
            return res.status(200).json({ status: "success", title: languageHandler("general.process_success", lang ?? process.env.FALLBACK_LANG) });
        }
    });
}

module.exports = { getAllBlogs, getBlogDetails, handleBlogComment };
