const { db } = require("../../config/db-connection");
const getValueByLanguage = require("../../helpers/getValueByLanguage");
const languageHandler = require("../../helpers/languageHandler");
const { setMomentLocale, limitText } = require("../../helpers/globalFunctions");
const { getIconByActivity } = require('../../helpers/admin/getIconByActivity');
const { showServerErrorPage, showBadRequestPage } = require("../../helpers/showErrorPages");
const moment = require("moment");

const getWebshopProductList = (req, res) => {
    var metas = {
        title: 'Admin products',
        type: "webiste",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the products list page",
        // keywords: []
    };
    setMomentLocale("hu");

    let webshopProducts = [];
    const lang = req.session.lang ?? process.env.ADMIN_LANG;
    let { page = 1 } = req.query;
    page = parseInt(page);

    if (isNaN(page) || page <= 0) {
        return showBadRequestPage(req, res);
    }

    const selectWebshopProducts = "SELECT products.id, products.name, products.discount_value, products.is_active, products.created_at, products.updated_at, categories.name AS 'category_name' FROM products INNER JOIN categories ON products.category_id = categories.id ORDER BY products.id DESC LIMIT ? OFFSET ?";

    let pageOffset = (page - 1) * parseInt(process.env.ADMIN_PAGINATION);

    db.query(selectWebshopProducts, [parseInt(process.env.ADMIN_PAGINATION), pageOffset], (err, products_list) => {

        if (err) {
            console.log(err);
            return showServerErrorPage(req, res);
        }

        else if (products_list.length == 0) {
            return res.render("admin/products/list", {
                meta: metas,
                pageCount: 0,
                webshopProducts: webshopProducts ?? [],
                csrfToken: req.csrfToken()
            });
        }

        else if (products_list.length > 0) {

            products_list.forEach(product => {
                let tempObject = {
                    productId: parseInt(product.id),
                    productName: getValueByLanguage(product.name, lang),
                    isOnDiscount: getIconByActivity(product.discount_value ?? 0),
                    is_active: getIconByActivity(product.is_active ?? 0),
                    date: product.updated_at != null ? product.updated_at : product.created_at,
                    productCategory: getValueByLanguage(product.category_name, lang),
                }

                webshopProducts.push(tempObject);
            });

            webshopProducts = webshopProducts.map(item => {
                return {
                    ...item,
                    productName: limitText(item.productName, 40),
                    date: moment(item.date).format("YYYY. MMMM DD. HH:mm:ss"),
                };
            });

            let selectForPagination = "SELECT COUNT(products.id) AS 'each_article_count' FROM products";

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

                    return res.render("admin/products/list", {
                        meta: metas,
                        pageCount: parseInt(pageCount),
                        currentPage: parseInt(page),
                        paginationLink: "products",
                        webshopProducts: webshopProducts ?? [],
                        csrfToken: req.csrfToken()
                    });
                }
            });
        }
    });
}

const getProductCommentsList = (req, res) => {
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
        return showBadRequestPage(req, res);
    }

    const selectProductComments = "SELECT product_comments.id AS 'comment_id', product_comments.name AS 'author_name', product_comments.email, product_comments.is_verified_purchase, product_comments.comment AS 'comment_text', product_comments.is_active, product_comments.date, products.name AS 'product_name', products.slug AS 'product_slug', products.is_active AS 'product_is_active' FROM product_comments INNER JOIN products ON product_comments.product_id = products.id ORDER BY product_comments.id DESC LIMIT ? OFFSET ?";

    let pageOffset = (page - 1) * parseInt(process.env.ADMIN_PAGINATION);

    db.query(selectProductComments, [parseInt(process.env.ADMIN_PAGINATION), pageOffset], (err, product_comments_list) => {

        if (err) {
            console.log(err);
            return showServerErrorPage(req, res);
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
                    isVerified: getIconByActivity(item.is_verified_purchase ?? 0),
                    isVerifiedInteger: parseInt(item.is_verified_purchase ?? 0),
                    productName: limitText(getValueByLanguage(item.product_name, lang ?? process.env.ADMIN_LANG), 40),
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

                    return showServerErrorPage(req, res);
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

const updateCommentVerficationBadge = (req, res) => {
    const { commentId } = req.params;
    let { activationStatus } = req.body;

    activationStatus = parseInt(activationStatus);
    if ( isNaN(activationStatus) ) {
        return res.status(200).json({ status: "error", csrfToken: req.csrfToken() });
    }

    const updateBadgeVerificationSQL = "UPDATE product_comments SET is_verified_purchase = ? WHERE id = ?";

    // Toggle the current value ( 1 <=> 0 )
    // If it's 1 => 0
    // If it's 0 => 1
    activationStatus = activationStatus === 1 ? 0 : 1;

    db.query(updateBadgeVerificationSQL, [activationStatus, commentId], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(200).json({ status: "error", csrfToken: req.csrfToken() });
        }

        return res.status(200).json({
            status: "success",
            csrfToken: req.csrfToken()
        });
    });
}

module.exports = { getWebshopProductList, getProductCommentsList, updateCommentVerficationBadge };
