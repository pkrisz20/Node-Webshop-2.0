const { db } = require("../config/db-config");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const { setMomentLocale, numberWithCommas } = require("../helpers/globalFunctions");
const moment = require("moment");
const languageHandler = require("../helpers/languageHandler");

const getProductDetails = (req, res) => {
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
    let similarProducts = [];

    const sqlQuery = "SELECT id, name, description, images, image_thumbnail, price, discount_value, is_available, is_delivered, max_order_count, comments_allowed, category_id FROM products WHERE is_active = ? AND slug = ?";

    const similarProductsQuery = "SELECT products.id, products.name, products.slug, products.image_thumbnail, products.price, products.discount_value, products.is_available, products.is_delivered, products.max_order_count FROM products WHERE (products.is_active = ? AND products.category_id = ? AND products.id != ?)";

    db.query(sqlQuery, [1, slug], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).render("500", { current_locale: req.session.lang });
        }

        else if (data.length > 0) {
            result = {
                id: parseInt(data[0].id),
                name: getValueByLanguage(data[0].name, lang),
                description: getValueByLanguage(data[0].description, lang),
                thumbnailImage: imagePathConverter(data[0].image_thumbnail, "products"),
                images: imagePathConverter(JSON.parse(data[0].images), "products"),
                price: numberWithCommas(data[0].price),
                isOnDiscount: Boolean(data[0].discount_value),
                discount: data[0].discount_value != null ? numberWithCommas(data[0].discount_value) : null,
                isAvailable: Boolean(data[0].is_available),
                isPostable: Boolean(data[0].is_delivered),
                maxQuantity: parseInt(data[0].max_order_count),
                isAllowed: Boolean(data[0].comments_allowed)
            }

            db.query(similarProductsQuery, [1, data[0].category_id, data[0].id], (err, similars) => {
                if (err) {
                    console.log(err);
                    return res.status(500).render("500", { current_locale: req.session.lang });
                }

                else if (similars.length > 0) {

                    similars.forEach(element => {
                        let tempObject = {
                            id: parseInt(element.id),
                            name: getValueByLanguage(element.name, lang),
                            slug: element.slug,
                            image: imagePathConverter(element.image_thumbnail, "products"),
                            price: numberWithCommas(element.price),
                            isOnDiscount: Boolean(element.discount_value),
                            discount: element.discount_value != null ? numberWithCommas(element.discount_value) : null,
                            isAvailable: Boolean(element.is_available),
                            isPostable: Boolean(element.is_delivered),
                            maxQuantity: parseInt(element.max_order_count)
                        }

                        similarProducts.push(tempObject);
                    });
                }

                var metas = {
                    title: result.name,
                    type: "article",
                    image: `${ process.env.APP_URL }/images/logo.png`,
                    description: `This is the product details page for ${ result.name }`,
                    // keywords: []
                };

                return res.render("pages/product-details", {
                    productDetails: result,
                    similarProducts: similarProducts ?? [],
                    meta: metas,
                    current_locale: req.session.lang,
                    cart: cart,
                    locales: ['hu', 'sr', 'en'],
                    languageHandler: languageHandler
                });
            });
        }
    });
}

const getAllProducts = (req, res) => {
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
    const lang  = req.session.lang;
    let { category = 0, page = 1 } = req.query;
    let result = [];
    var metas = {
        title: languageHandler("general.products", lang),
        type: "page",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the product list page",
        // keywords: []
    };

    page = parseInt(page);
    category = parseInt(category);

    if ( isNaN(page) || isNaN(category) ) {
        return res.status(400).render("400", { current_locale: req.session.lang });
    }

    let sqlQuery = "SELECT id, name, slug, image_thumbnail, price, discount_value, is_available, is_delivered, max_order_count FROM products WHERE is_active = ? ORDER BY id DESC";

    if (typeof page !== "number" || page <= 0) {
        return res.status(400).render("400", { current_locale: req.session.lang });
    }

    if (typeof category === "number" && category !== 0) {
        sqlQuery += " AND category_id = ?";
    }

    sqlQuery += " LIMIT ? OFFSET ?";
    let pageOffset = (page - 1) * parseInt(process.env.PAGINATION);

    db.query(sqlQuery, (typeof category === "number" && category > 0) ? [1, category, parseInt(process.env.PAGINATION), pageOffset] : [1, parseInt(process.env.PAGINATION), pageOffset], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).render("500", { current_locale: req.session.lang });
        }

        else if (data.length > 0) {
            data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    name: getValueByLanguage(element.name, lang),
                    slug: element.slug,
                    image: imagePathConverter(element.image_thumbnail, "products"),
                    price: numberWithCommas(element.price),
                    isOnDiscount: Boolean(element.discount_value),
                    discount: element.discount_value != null ? numberWithCommas(element.discount_value) : null,
                    isAvailable: Boolean(element.is_available),
                    isPostable: Boolean(element.is_delivered),
                    maxQuantity: parseInt(element.max_order_count)
                }

                result.push(tempObject);
            });

            let selectForPagination = "SELECT COUNT(products.id) AS 'each_article_count' FROM products WHERE products.is_active = ?";

            if (typeof category === "number" && category > 0) {
                selectForPagination += " AND products.category_id = ?";
            }

            // Select for pagination count
            db.query(selectForPagination, (typeof category === "number" && category > 0) ? [1, category] : 1, (err, elementsCount) => {
                if (err) {
                    console.log(err);
                    return res.status(500).render("500", { current_locale: req.session.lang });
                }

                else if (elementsCount) {

                    let leftOver = elementsCount[0].each_article_count % parseInt(process.env.PAGINATION);
                    let pageCount = parseInt(elementsCount[0].each_article_count / parseInt(process.env.PAGINATION));
                    pageCount = leftOver > 0 ? pageCount + 1 : pageCount;

                    return res.render("pages/products", {
                        pageCount: pageCount,
                        currentPage: page,
                        articleLink: "products",
                        products: result ?? [],
                        meta: metas,
                        current_locale: req.session.lang,
                        cart: cart,
                        locales: ['hu', 'sr', 'en'],
                        languageHandler: languageHandler
                    });
                }
            });
        }
    });
}

const getProductComments = (req, res) => {
    const { lang } = req.body;
    const { itemId } = req.body;
    let result = [];
    const sqlQuery = "SELECT product_comments.id, product_comments.name, product_comments.comment, product_comments.date FROM product_comments WHERE product_comments.is_active = ? AND product_comments.product_id = ?";

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

const handleProductComment = (req, res) => {
    const { lang } = req.body;
    const { fullName } = req.body;
    const { email } = req.body;
    const { comment } = req.body;
    const { itemId } = req.body;

    if (!lang || !fullName || !email || !comment || !itemId) {
        return res.status(400).json({ status: "error" });
    }

    const sqlQueryInsertComment = "INSERT INTO product_comments (name, email, comment, date, product_id) VALUES (?, ?, ?, ?, ?)";

    db.query(sqlQueryInsertComment, [fullName, email, comment, moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), itemId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ status: "error" });
        }

        return !result ? res.status(500).json({ status: 'error' }) : res.status(200).json({ status: 'success' });
    });
}

const getCategories = (req, res) => {
    const { lang } = req.body;
    let result = [];
    const sqlQuery = "SELECT id, name, icon FROM categories";

    if (!lang) {
        return res.status(400).json({ status: "error" });
    }

    db.query(sqlQuery, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ status: "error" });
        }

        else if (data.length > 0) {
            data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    name: getValueByLanguage(element.name, lang),
                    icon: imagePathConverter(element.icon, "categories")
                }

                result.push(tempObject);
            });
        }

        return res.status(200).json({ status: 'success', result: result ?? [] });
    });
};

module.exports = { getProductDetails, getAllProducts, getProductComments, handleProductComment, getCategories };
