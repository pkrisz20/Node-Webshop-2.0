const { db } = require("../config/db-config");
const moment = require("moment");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const { setMomentLocale, capitalizeFirstLetter } = require("../helpers/globalFunctions");

const getBlogDetails = (req, res) => {
    const { lang } = req.body;
    let { blogId } = req.params;
    let result = {};
    let newestBlogsArray = [];
    let incommingEvents = [];

    if (!lang || !blogId) {
        return res.status(400).json({ status: "error" });
    }

    const blogDetailsQuery = "SELECT id, title, description, image_thumbnail, date, comments_allowed FROM blogs WHERE is_active = ? AND id = ?";

    const newestBlogsQuery = "SELECT blogs.id, blogs.title, blogs.short_description, blogs.image_thumbnail, blogs.date, blogs.author, (SELECT COUNT(blog_comments.id) FROM blog_comments WHERE blog_comments.id = blogs.id) AS 'comments_count' FROM blogs WHERE blogs.is_active = ? AND (blogs.date BETWEEN ? AND ?)";

    const incommingEventsQuery = "SELECT blogs.id, blogs.title, blogs.image_thumbnail, blogs.date FROM blogs WHERE blogs.is_active = ? AND blogs.date > ?";

    db.query(blogDetailsQuery, [1, blogId], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ status: "error" });
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

            db.query(newestBlogsQuery,
                [
                    1,
                    moment(new Date()).subtract(3, 'months').format("YYYY-MM-DD"),
                    moment(new Date()).format("YYYY-MM-DD")
                ], (err, newestBlog) => {

                if (err) {
                    console.log(err);
                    return res.status(500).json({ status: "error" });
                }

                else if (newestBlog.length > 0) {
                    newestBlog.forEach(element => {
                        let tempObject = {
                            id: parseInt(element.id),
                            title: getValueByLanguage(element.title, lang),
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

                db.query(incommingEventsQuery, [1, moment(new Date()).format("YYYY-MM-DD")], (err, incommingEvent) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ status: "error" });
                    }

                    else if (incommingEvent.length > 0) {
                        incommingEvent.forEach(element => {
                            let tempObject = {
                                id: parseInt(element.id),
                                title: getValueByLanguage(element.title, lang),
                                image: imagePathConverter(element.image_thumbnail, "blogs"),
                                date: moment(element.date).fromNow(),
                            }

                            incommingEvents.push(tempObject);
                        });
                    }

                    return res.status(200).json({ status: 'success', result: result, newestBlogs: newestBlogsArray ?? [], nextEvents: incommingEvents ?? [] });
                });
            });
        }
    });
}

const getAllBlogs = (req, res) => {
    const { lang } = req.body;
    let { page } = req.query;
    let result = [];
    const sqlQueryPaginatedBlogs = "SELECT blogs.id, blogs.title, blogs.short_description, blogs.image_thumbnail, blogs.date, blogs.author, (SELECT COUNT(blog_comments.id) FROM blog_comments WHERE blog_comments.blog_id = blogs.id) AS 'comments_count' FROM blogs WHERE blogs.is_active = ? ORDER BY blogs.date DESC LIMIT ? OFFSET ?";

    try {
        page = parseInt(page);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ status: "error" });
    }

    if (!lang || typeof page !== "number" || page <= 0) {
        return res.status(400).json({ status: "error" });
    }

    let pageOffset = (page - 1) * parseInt(process.env.PAGINATION);

    // Select limit - offset elements
    db.query(sqlQueryPaginatedBlogs, [1, parseInt(process.env.PAGINATION), pageOffset], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ status: "error" });
        }

        else if (data.length > 0) {
            setMomentLocale(lang);

            data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    title: getValueByLanguage(element.title, lang),
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
                    return res.status(500).json({ status: "error" });
                }

                else if (elementsCount) {

                    let leftOver = elementsCount[0].each_article_count % parseInt(process.env.PAGINATION);
                    let pageCount = parseInt(elementsCount[0].each_article_count / parseInt(process.env.PAGINATION));
                    pageCount = leftOver > 0 ? pageCount + 1 : pageCount;

                    return res.status(200).json({ status: 'success', pagination: pageCount, result: result ?? [] });
                }
            });
        }
    });
}

const getBlogsComments = (req, res) => {
    const { lang } = req.body;
    const { itemId } = req.body;
    let result = [];
    const sqlQuery = "SELECT blog_comments.id, blog_comments.name, blog_comments.comment, blog_comments.date FROM blog_comments WHERE blog_comments.is_active = ? AND blog_comments.blog_id = ?";

    if (!lang || !itemId) {
        return res.status(400).json({ status: "error" });
    }

    db.query(sqlQuery, [1, itemId], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ status: "error" });
        }

        else if (data.length > 0) {
            setMomentLocale(lang);

            data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    name: element.name,
                    description: element.comment,
                    date: element.date,
                }

                result.push(tempObject);
            });

            result = result.map(item => {
                return {
                    ...item,
                    date: moment(item.date, "YYYY-MM-DD HH:mm").fromNow()
                };
            });
        }

        return res.status(200).json({ status: 'success', comments: result ?? [] });
    });
}

const handleBlogComment = (req, res) => {
    const { lang } = req.body;
    const { fullName } = req.body;
    const { email } = req.body;
    const { comment } = req.body;
    const { itemId } = req.body;

    if (!lang || !fullName || !email || !comment || !itemId) {
        return res.status(400).json({ status: "error" });
    }

    const sqlQueryInsertComment = "INSERT INTO blog_comments (name, email, comment, date, blog_id) VALUES (?, ?, ?, ?, ?)";

    db.query(sqlQueryInsertComment, [fullName, email, comment, moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), itemId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ status: "error" });
        }

        return !result ? res.status(500).json({ status: 'error' }) : res.status(200).json({ status: 'success' });
    });
}

module.exports = { getAllBlogs, getBlogsComments, getBlogDetails, handleBlogComment };
