const { db } = require("../config/db-config");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const moment = require("moment");
const { setMomentLocale, capitalizeFirstLetter } = require("../helpers/globalFunctions");

const getFeaturedProducts = (req, res) => {
    const { lang } = req.body;
    let result = [];
    const sqlQuery = "SELECT id, name, image_thumbnail, price, discount_value, is_available, is_delivered, max_order_count FROM products WHERE is_active = ? AND is_featured = ?";

    if (!lang) {
        return res.status(400).json({ status: "error" });
    }

    db.query(sqlQuery, [1, 1], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ status: "error" });
        }

        else if (data.length > 0) {
            data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    name: getValueByLanguage(element.name, lang),
                    image: imagePathConverter(element.image_thumbnail, "products"),
                    price: element.price,
                    isOnDiscount: Boolean(element.discount_value),
                    discount: element.discount_value,
                    isAvailable: Boolean(element.is_available),
                    isPostable: Boolean(element.is_delivered),
                    maxQuantity: parseInt(element.max_order_count)
                }

                result.push(tempObject);
            });
        }

        return res.status(200).json({ status: 'success', products: result ?? [] });
    });
}

const getFeaturedBlogs = (req, res) => {
    const { lang } = req.body;
    let result = [];
    const sqlQuery = "SELECT blogs.id, blogs.title, blogs.short_description, blogs.image_thumbnail, blogs.date, blogs.author, (SELECT COUNT(blog_comments.id) FROM blog_comments WHERE blog_comments.blog_id = blogs.id) AS 'comments_count' FROM blogs WHERE blogs.is_active = ? AND blogs.is_featured = ?";

    if (!lang) {
        return res.status(400).json({ status: "error" });
    }

    db.query(sqlQuery, [1, 1], (err, data) => {
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
        }

        return res.status(200).json({ status: 'success', blogs: result ?? [] });
    });
}

const getHeroItems = (req, res) => {
    const { lang } = req.body;
    let result = [];
    const sqlQuery = "SELECT id, title, subtitle, target_page, image, link, button_text FROM hero WHERE is_active = ?";

    if (!lang) {
        return res.status(400).json({ status: "error" });
    }

    db.query(sqlQuery, 1, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ status: "error" });
        }

        else if (data.length > 0) {
            data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    text: getValueByLanguage(element.title, lang),
                    subText: getValueByLanguage(element.subtitle, lang),
                    image: imagePathConverter(element.image, "heros"),
                    link: getValueByLanguage(element.link, lang),
                    button: getValueByLanguage(element.button_text, lang),
                    targetPage: element.target_page ?? "blank"
                }

                result.push(tempObject);
            });
        }

        return res.status(200).json({ status: 'success', heroItems: result ?? [] });
    });
}

const getFeaturedGalleries = (req, res) => {
    const { lang } = req.body;
    let result = [];
    const sqlQuery = "SELECT galleries.id, galleries.gallery_name, galleries.gallery_thumbnail, categories.name AS 'category_name' FROM galleries, categories WHERE galleries.is_active = ? AND galleries.is_featured = ? AND galleries.id = categories.id";

    if (!lang) {
        return res.status(400).json({ status: "error" });
    }

    db.query(sqlQuery, [1, 1], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ status: "error" });
        }

        else if (data.length > 0) {
            setMomentLocale(lang);

            data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    name: getValueByLanguage(element.gallery_name, lang),
                    source: imagePathConverter(element.gallery_thumbnail, "gallery"),
                    category: getValueByLanguage(element.category_name, lang)
                }

                result.push(tempObject);
            });

            result = result.map(item => {
                return {
                    ...item,
                    category: capitalizeFirstLetter(item.category)
                };
            });
        }

        return res.status(200).json({ status: 'success', featuredGalleries: result ?? [] });
    });
}

module.exports = { getFeaturedProducts, getHeroItems, getFeaturedBlogs, getFeaturedGalleries };
