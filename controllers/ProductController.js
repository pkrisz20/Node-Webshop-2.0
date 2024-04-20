const { db } = require("../config/db-connection");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const { setMomentLocale, numberWithCommas, limitText, escapeHtml } = require("../helpers/globalFunctions");
const moment = require("moment");
const errorHandler = require('../middleware/errorHandler');
const languageHandler = require("../helpers/languageHandler");
const { showNotFoundPage, showBadRequestPage } = require("../helpers/showErrorPages");
const metaDefault = require('../config/meta');
const gdprCookies = require('../config/gdpr');

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

    var wishlist = req.session.wishlist ?? [];
    var { DB_CONFIG } = req;
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    let { slug } = req.params;
    let result = {};
    let similarProducts = [];
    let productComments = [];
    let isAlreadyInCart = false;
    let showLoadMoreButton = false;

    const sqlQuery = "SELECT products.id, products.name, products.description, products.short_description, products.images, products.image_thumbnail, products.price, products.discount_value, products.is_available, products.is_delivered, products.max_order_count, products.comments_allowed, products.category_id, categories.name AS 'category_name', AVG(COALESCE(product_comments.rating, 0)) AS 'average_rating', COUNT(product_comments.rating) AS 'all_ratings_count' FROM products INNER JOIN categories ON products.category_id = categories.id LEFT JOIN product_comments ON products.id = product_comments.product_id WHERE products.is_active = ? AND products.slug = ?";

    db.query(sqlQuery, [1, slug], (err, data) => {
        if (err) {
            return errorHandler(err, req, res, 'productController', 40);
        }

        else if (data.length === 0) {
            return showNotFoundPage(req, res);
        }

        else if (data.length > 0) {
            result = {
                id: parseInt(data[0].id),
                slug: slug,
                category_name: getValueByLanguage(data[0].category_name, lang),
                name: getValueByLanguage(data[0].name, lang),
                short: data[0].short_description ? getValueByLanguage(data[0].short_description, lang) : null,
                description: getValueByLanguage(data[0].description, lang),
                thumbnailImage: imagePathConverter(data[0].image_thumbnail, "products"),
                images: imagePathConverter(JSON.parse(data[0].images), "products") ?? [],
                price: numberWithCommas(data[0].price),
                isOnDiscount: Boolean(data[0].discount_value),
                discount: data[0].discount_value != null ? numberWithCommas(data[0].discount_value) : null,
                savings: data[0].discount_value != null ? numberWithCommas(data[0].price - data[0].discount_value) : null,
                averageRating: Math.ceil(data[0].average_rating),
                allRatingsCount: data[0].all_ratings_count,
                isAvailable: Boolean(data[0].is_available),
                isPostable: Boolean(data[0].is_delivered),
                maxQuantity: parseInt(data[0].max_order_count),
                isAllowed: Boolean(data[0].comments_allowed),
                saved_in_wishlist: wishlist.includes(data[0].id),
            }

            var metas = {
                ...metaDefault,
                title: limitText(result.name, metaDefault.limits['title']) + metaDefault['separator'] + metaDefault['title'],
                lang: metaDefault.langs[lang],
                type: "article",
                url: `${ process.env.APP_URL }/${ lang }/products/${ slug }`,
                description: limitText(result.short ?? languageHandler('meta.description', lang), metaDefault.limits['description']),
                image: {
                    src: result.thumbnailImage ?? metaDefault['default_og_images'],
                    width: metaDefault['og:image:width'],
                    height: metaDefault['og:image:height'],
                },
            };

            isAlreadyInCart = cart?.items?.some(cartItem => cartItem.productId == result.id);

            const similarProductsQuery = "SELECT products.id, products.name, products.short_description, products.slug, products.image_thumbnail, products.price, products.discount_value, products.is_available, products.is_delivered, products.max_order_count FROM products WHERE (products.is_active = ? AND products.category_id = ? AND products.id != ?)";

            db.query(similarProductsQuery, [1, parseInt(data[0].category_id), result.id], (err, similars) => {
                if (err) {
                    return errorHandler(err, req, res, 'productController', 89);
                }

                else if (similars.length > 0) {

                    similars.forEach(element => {
                        let tempObject = {
                            id: parseInt(element.id),
                            name: getValueByLanguage(element.name, lang),
                            short: element.short_description ? limitText(getValueByLanguage(element.short_description, lang)) : null,
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

                    // Check for is the product already in the cart
                    let productIdsInCart = cart?.items?.map(item => item.productId);

                    similarProducts?.forEach(similarProduct => {

                        similarProduct.already_in_cart = productIdsInCart.includes(similarProduct.id);
                        similarProduct.saved_in_wishlist = wishlist.includes(similarProduct.id);
                    });
                }

                // Select product comments, if they are not disabled
                if (result.isAllowed) {
                    const selectProductComments = "SELECT product_comments.id, product_comments.name, product_comments.is_verified_purchase, product_comments.rating, product_comments.comment, product_comments.date FROM product_comments WHERE product_comments.is_active = ? AND product_comments.product_id = ? ORDER BY product_comments.date DESC LIMIT ?";

                    db.query(selectProductComments, [1, result.id, parseInt(process.env.COUNT_COMMENTS_SHOW)], (comments_err, comments_data) => {
                        if (comments_err) {
                            return errorHandler(comments_err, req, res, 'productController', 128);
                        }

                        else if ( comments_data.length === 0 ) {
                            return res.render("pages/product-details", {
                                productDetails: result,
                                isAlreadyInCart: isAlreadyInCart ?? false,
                                similarProducts: similarProducts ?? [],
                                articleComments: productComments ?? [],
                                showLoadMoreButton: showLoadMoreButton ?? false,
                                meta: metas,
                                current_locale: lang,
                                cart: cart,
                                locales: ['hu', 'sr', 'en'],
                                languageHandler: languageHandler,
                                DB_CONFIG: DB_CONFIG,
                                webshopCategories: req.webshopCategories,
                                staticContent: req.static_content,
                                wishlistTotalNumber: req.wishlistTotalNumber,
                                gdprCookies: gdprCookies,
                                gdprAcceptedCookies: JSON.parse(req.cookies['allowed_cookie_types'] ?? '[]'),
                                csrfToken: req.csrfToken()
                            });
                        }

                        else if (comments_data.length > 0) {
                            setMomentLocale(lang);

                            comments_data.forEach(element => {
                                let tempObject = {
                                    id: parseInt(element.id),
                                    rating: parseInt(element.rating),
                                    name: element.name,
                                    is_verified: Boolean(element.is_verified_purchase ?? false),
                                    description: element.comment,
                                    date: element.date,
                                }

                                productComments.push(tempObject);
                            });

                            productComments = productComments.map(item => {
                                return {
                                    ...item,
                                    date: moment(item.date, "YYYY-MM-DD HH:mm").fromNow()
                                };
                            });

                            // Select the active comments count for this product to show the load more button or not
                            const selectCommentsCountSQL = "SELECT COUNT(product_comments.id) AS 'each_comments_count' FROM product_comments WHERE product_comments.is_active = ? AND product_comments.product_id = ?";

                            db.query(selectCommentsCountSQL, [1, result.id], (comments_count_err, comments_count) => {
                                if ( comments_count_err ) {
                                    return errorHandler(comments_count_err, req, res, 'productController', 181);
                                }

                                else if (comments_count[0].each_comments_count > parseInt(process.env.COUNT_COMMENTS_SHOW)) {
                                    showLoadMoreButton = true;
                                }

                                return res.render("pages/product-details", {
                                    productDetails: result,
                                    isAlreadyInCart: isAlreadyInCart ?? false,
                                    similarProducts: similarProducts ?? [],
                                    articleComments: productComments ?? [],
                                    showLoadMoreButton: showLoadMoreButton ?? false,
                                    meta: metas,
                                    current_locale: lang,
                                    cart: cart,
                                    locales: ['hu', 'sr', 'en'],
                                    languageHandler: languageHandler,
                                    DB_CONFIG: DB_CONFIG,
                                    webshopCategories: req.webshopCategories,
                                    staticContent: req.static_content,
                                    wishlistTotalNumber: req.wishlistTotalNumber,
                                    gdprCookies: gdprCookies,
                                    gdprAcceptedCookies: JSON.parse(req.cookies['allowed_cookie_types'] ?? '[]'),
                                    csrfToken: req.csrfToken()
                                });
                            });
                        }
                    });
                }

                else if (!result.isAllowed) {
                    return res.render("pages/product-details", {
                        productDetails: result,
                        isAlreadyInCart: isAlreadyInCart ?? false,
                        similarProducts: similarProducts ?? [],
                        articleComments: productComments ?? [],
                        showLoadMoreButton: showLoadMoreButton ?? false,
                        meta: metas,
                        current_locale: lang,
                        cart: cart,
                        locales: ['hu', 'sr', 'en'],
                        languageHandler: languageHandler,
                        DB_CONFIG: DB_CONFIG,
                        webshopCategories: req.webshopCategories,
                        staticContent: req.static_content,
                        wishlistTotalNumber: req.wishlistTotalNumber,
                        gdprCookies: gdprCookies,
                        gdprAcceptedCookies: JSON.parse(req.cookies['allowed_cookie_types'] ?? '[]'),
                        csrfToken: req.csrfToken()
                    });
                }
            });
        }
    });
};

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

    var wishlist = req.session.wishlist ?? [];
    var { DB_CONFIG } = req;
    const lang  = req.session.lang ?? process.env.FALLBACK_LANG;
    let { page = 1 } = req.query;
    page = parseInt(page);

    if (isNaN(page) || page <= 0) {
        return showBadRequestPage(req, res);
    }

    let result = [];

    var metas = {
        ...metaDefault,
        title: languageHandler("general.products", lang) + metaDefault['separator'] + metaDefault['title'],
        lang: metaDefault.langs[lang],
        type: "website",
        url: `${ process.env.APP_URL }/${ lang }/poducts`,
        description: languageHandler('meta.product_description', lang),
        image: {
            src: metaDefault['default_og_images'],
            width: metaDefault['og:image:width'],
            height: metaDefault['og:image:height'],
        },
    };

    let sqlQuery = "SELECT id, name, slug, image_thumbnail, short_description, price, discount_value, is_new, is_available, is_delivered, max_order_count FROM products WHERE is_active = ? ORDER BY id DESC LIMIT ? OFFSET ?";

    let pageOffset = (page - 1) * parseInt(process.env.PAGINATION);

    db.query(sqlQuery, [1, parseInt(process.env.PAGINATION), pageOffset], (err, data) => {
        if (err) {
            return errorHandler(err, req, res, 'productController', 285);
        }

        else if (data.length == 0) {
            return res.render("pages/products", {
                pageCount: 0,
                productsTotalCount: 0,
                main_title: languageHandler('general.products', lang),
                products: [],
                meta: metas,
                main_title: languageHandler('general.products', lang),
                category_short_desc: null,
                current_locale: req.session.lang ?? process.env.FALLBACK_LANG,
                cart: cart,
                locales: ['hu', 'sr', 'en'],
                languageHandler: languageHandler,
                DB_CONFIG: DB_CONFIG,
                webshopCategories: req.webshopCategories,
                staticContent: req.static_content,
                wishlistTotalNumber: req.wishlistTotalNumber,
                gdprCookies: gdprCookies,
                gdprAcceptedCookies: JSON.parse(req.cookies['allowed_cookie_types'] ?? '[]'),
                csrfToken: req.csrfToken()
            });
        }

        else if (data.length > 0) {
            data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    name: getValueByLanguage(element.name, lang),
                    slug: element.slug,
                    short: element.short_description ? limitText(getValueByLanguage(element.short_description, lang)) : null,
                    image: imagePathConverter(element.image_thumbnail, "products"),
                    price: numberWithCommas(element.price),
                    isOnDiscount: Boolean(element.discount_value),
                    discount: element.discount_value != null ? numberWithCommas(element.discount_value) : null,
                    isAvailable: Boolean(element.is_available),
                    isPostable: Boolean(element.is_delivered),
                    isNew: Boolean(element.is_new),
                    maxQuantity: parseInt(element.max_order_count)
                }

                result.push(tempObject);
            });

            // Check for is the product already in the cart
            let productIdsInCart = cart?.items?.map(item => item.productId);

            result?.forEach(resultItem => {

                resultItem.already_in_cart = productIdsInCart.includes(resultItem.id);
                resultItem.saved_in_wishlist = wishlist.includes(resultItem.id);
            });

            let selectForPagination = "SELECT COUNT(products.id) AS 'each_article_count' FROM products WHERE products.is_active = ?";

            // Select for pagination count
            db.query(selectForPagination, 1, (err, elementsCount) => {
                if (err) {
                    return errorHandler(err, req, res, 'productController', 345);
                }

                else if (elementsCount) {

                    let leftOver = elementsCount[0].each_article_count % parseInt(process.env.PAGINATION);
                    let pageCount = parseInt(elementsCount[0].each_article_count / parseInt(process.env.PAGINATION));
                    pageCount = leftOver > 0 ? pageCount + 1 : pageCount;

                    return res.render("pages/products", {
                        pageCount: parseInt(pageCount),
                        currentPage: parseInt(page),
                        articleLink: "products",
                        products: result ?? [],
                        productsTotalCount: elementsCount[0].each_article_count ?? 0,
                        main_title: languageHandler('general.products', lang),
                        category_short_desc: null,
                        meta: metas,
                        current_locale: req.session.lang ?? process.env.FALLBACK_LANG,
                        cart: cart,
                        locales: ['hu', 'sr', 'en'],
                        languageHandler: languageHandler,
                        DB_CONFIG: DB_CONFIG,
                        webshopCategories: req.webshopCategories,
                        staticContent: req.static_content,
                        wishlistTotalNumber: req.wishlistTotalNumber,
                        gdprCookies: gdprCookies,
                        gdprAcceptedCookies: JSON.parse(req.cookies['allowed_cookie_types'] ?? '[]'),
                        csrfToken: req.csrfToken()
                    });
                }
            });
        }
    });
};

const handleProductComment = (req, res) => {
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    const { fullName } = req.body;
    const { email } = req.body;
    const { comment } = req.body;
    const { rating } = req.body;

    const sqlQueryInsertComment = "INSERT INTO product_comments (name, email, comment, date, rating, product_id) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(sqlQueryInsertComment, [fullName, email, comment, moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), rating, req.params.itemId], (err, result) => {
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
};

const getCategoryProducts = (req, res) => {
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

    var wishlist = req.session.wishlist ?? [];
    var { DB_CONFIG } = req;
    const lang  = req.session.lang ?? process.env.FALLBACK_LANG;
    let { page = 1 } = req.query;
    page = parseInt(page);

    if (isNaN(page) || page <= 0) {
        return showBadRequestPage(req, res);
    }
    let { slug } = req.params;
    let result = [];

    let checkForCategory = "SELECT name, short_description AS 'category_short_description' FROM categories WHERE slug = ?";

    db.query(checkForCategory, slug, (checking_err, category_data) => {
        if (checking_err) {
            return errorHandler(checking_err, req, res, 'productController', 443);
        }

        else if (category_data.length === 0) {
            return showNotFoundPage(req, res);
        }

        else if (category_data.length > 0) {
            const selectedCategoryName = getValueByLanguage(category_data[0].name, lang);
            const selectedCategoryShortDescription = category_data[0].category_short_description ? getValueByLanguage(category_data[0].category_short_description, lang) : null;

            var metas = {
                ...metaDefault,
                title: limitText(selectedCategoryName, metaDefault.limits['title']) + metaDefault['separator'] + metaDefault['title'],
                lang: metaDefault.langs[lang],
                type: "website",
                url: `${ process.env.APP_URL }/${ lang }/products/category/${ slug }`,
                description: limitText(selectedCategoryShortDescription ?? languageHandler('meta.product_description', lang), metaDefault.limits['description']),
                image: {
                    src: result.thumbnailImage ?? metaDefault['default_og_images'],
                    width: metaDefault['og:image:width'],
                    height: metaDefault['og:image:height'],
                },
            };

            let sqlQuery = "SELECT products.id, products.name, products.slug, products.short_description, products.image_thumbnail, products.price, products.discount_value, products.is_available, products.is_delivered, products.is_new, products.max_order_count FROM products INNER JOIN categories ON products.category_id = categories.id WHERE products.is_active = ? AND categories.slug = ? ORDER BY id DESC LIMIT ? OFFSET ?";

            let pageOffset = (page - 1) * parseInt(process.env.PAGINATION);

            db.query(sqlQuery, [1, slug, parseInt(process.env.PAGINATION), pageOffset], (err, data) => {
                if (err) {
                    return errorHandler(err, req, res, 'productController', 474);
                }

                else if (data.length === 0) {
                    return res.render("pages/products", {
                        pageCount: 0,
                        main_title: selectedCategoryName,
                        productsTotalCount: 0,
                        products: [],
                        meta: metas,
                        category_short_desc: null,
                        current_locale: req.session.lang ?? process.env.FALLBACK_LANG,
                        cart: cart,
                        locales: ['hu', 'sr', 'en'],
                        languageHandler: languageHandler,
                        DB_CONFIG: DB_CONFIG,
                        webshopCategories: req.webshopCategories,
                        staticContent: req.static_content,
                        wishlistTotalNumber: req.wishlistTotalNumber,
                        gdprCookies: gdprCookies,
                        gdprAcceptedCookies: JSON.parse(req.cookies['allowed_cookie_types'] ?? '[]'),
                        csrfToken: req.csrfToken()
                    });
                }

                else if (data.length > 0) {
                    data.forEach(element => {
                        let tempObject = {
                            id: parseInt(element.id),
                            name: getValueByLanguage(element.name, lang),
                            slug: element.slug,
                            category_short_description: element.category_short_description ? getValueByLanguage(element.category_short_description, lang) : null,
                            short: element.short_description ? limitText(getValueByLanguage(element.short_description, lang)) : null,
                            image: imagePathConverter(element.image_thumbnail, "products"),
                            price: numberWithCommas(element.price),
                            isOnDiscount: Boolean(element.discount_value),
                            discount: element.discount_value != null ? numberWithCommas(element.discount_value) : null,
                            isAvailable: Boolean(element.is_available),
                            isPostable: Boolean(element.is_delivered),
                            isNew: Boolean(element.is_new),
                            maxQuantity: parseInt(element.max_order_count)
                        }

                        result.push(tempObject);
                    });

                    // Check for is the product already in the cart
                    let productIdsInCart = cart?.items?.map(item => item.productId);

                    result?.forEach(resultItem => {

                        resultItem.already_in_cart = productIdsInCart.includes(resultItem.id);
                        resultItem.saved_in_wishlist = wishlist.includes(resultItem.id);
                    });

                    let selectForPagination = "SELECT COUNT(products.id) AS 'each_article_count' FROM products INNER JOIN categories ON products.category_id = categories.id WHERE products.is_active = ? AND categories.slug = ?";

                    // Select for pagination count
                    db.query(selectForPagination, [1, slug], (err_count, elementsCount) => {
                        if (err_count) {
                            return errorHandler(err_count, req, res, 'productController', 534);
                        }

                        else if (elementsCount) {

                            let leftOver = elementsCount[0].each_article_count % parseInt(process.env.PAGINATION);
                            let pageCount = parseInt(elementsCount[0].each_article_count / parseInt(process.env.PAGINATION));
                            pageCount = leftOver > 0 ? pageCount + 1 : pageCount;

                            return res.render("pages/products", {
                                pageCount: parseInt(pageCount),
                                currentPage: parseInt(page),
                                articleLink: `products/category/${ slug }`,
                                productsTotalCount: elementsCount[0].each_article_count ?? 0,
                                products: result ?? [],
                                main_title: selectedCategoryName,
                                category_short_desc: selectedCategoryShortDescription,
                                meta: metas,
                                current_locale: req.session.lang ?? process.env.FALLBACK_LANG,
                                cart: cart,
                                locales: ['hu', 'sr', 'en'],
                                languageHandler: languageHandler,
                                DB_CONFIG: DB_CONFIG,
                                webshopCategories: req.webshopCategories,
                                staticContent: req.static_content,
                                wishlistTotalNumber: req.wishlistTotalNumber,
                                gdprCookies: gdprCookies,
                                gdprAcceptedCookies: JSON.parse(req.cookies['allowed_cookie_types'] ?? '[]'),
                                csrfToken: req.csrfToken()
                            });
                        }
                    });
                }
            });
        }
    });
};

const ajaxLoadMoreComments = (req, res) => {
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    let { offsetNumber, productID } = req.body;
    let selectedComments = [];
    let commentsHtml = "";
    let removeLoadButton = true;
    offsetNumber = parseInt(offsetNumber);
    productID = parseInt(productID);

    if ( isNaN(offsetNumber) || isNaN(productID) ) {
        return res.status(200).json({
            status: "error",
            title: languageHandler('errors.error', lang),
            message: languageHandler('errors.wrong_data', lang),
            csrfToken: req.csrfToken()
        });
    }

    offsetNumber = offsetNumber * parseInt(process.env.COUNT_COMMENTS_SHOW);

    const selectMoreComments = "SELECT product_comments.id, product_comments.name, product_comments.is_verified_purchase, product_comments.comment, product_comments.date FROM product_comments WHERE product_comments.is_active = ? AND product_comments.product_id = ? ORDER BY product_comments.date DESC LIMIT ? OFFSET ?";

    db.query(selectMoreComments, [1, productID, parseInt(process.env.COUNT_COMMENTS_SHOW), offsetNumber], (comments_err, comments_data) => {
        if (comments_err) {
            console.log(comments_err);
            return res.status(200).json({
                status: "error",
                title: languageHandler('errors.error', lang),
                message: languageHandler('errors.common_error', lang),
                csrfToken: req.csrfToken()
            });
        }

        else if (comments_data.length > 0) {
            setMomentLocale(lang);

            comments_data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    name: element.name,
                    is_verified: Boolean(element.is_verified_purchase ?? false),
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
                                <strong class="content__top-name">${ escapeHtml(comment.name) }</strong>`;

                            if ( comment.is_verified ) {
                                commentsHtml += '<span class="content__top-badge"><i class="fas fa-check-circle icon"></i>' + languageHandler("products.verified_purchase", lang) + '</span>';
                            }

                        commentsHtml += `</div>
                        <p class="content-comment">${ escapeHtml(comment.description) }</p>
                        <time class="content-date"><i class="fas fa-history"></i> ${ comment.date }</time>
                    </div>
                </div>`;
            });

            // Calculate the leftover comments from db (still show load more button or not)
            const selectCommentsCountSQL = "SELECT COUNT(product_comments.id) AS 'each_comments_count' FROM product_comments WHERE product_comments.is_active = ? AND product_comments.product_id = ?";

            db.query(selectCommentsCountSQL, [1, productID], (comments_count_err, comments_count) => {
                if ( comments_count_err ) {
                    console.log(comments_count_err);
                    return res.status(200).json({
                        status: "error",
                        title: languageHandler('errors.error', lang),
                        message: languageHandler('errors.common_error', lang),
                        csrfToken: req.csrfToken()
                    });
                }

                // Offsetnumber => the number of comments which have to skipped
                // COUNT_COMMENTS_SHOW => the number of comments which can be loaded by default & on button click to load more
                // In this if statement has to be Offsetnumber + the COUNT_COMMENTS_SHOW, because already the first comments are loaded
                else if (comments_count[0].each_comments_count > (offsetNumber + parseInt(process.env.COUNT_COMMENTS_SHOW))) {
                    removeLoadButton = false;
                }

                return res.status(200).json({
                    status: "success",
                    html_response_with_comments: commentsHtml ?? '',
                    removeLoadButton: removeLoadButton ?? true,
                    offsetNumber: (offsetNumber / parseInt(process.env.COUNT_COMMENTS_SHOW)) + 1,
                    csrfToken: req.csrfToken()
                });
            });
        }
    });
};

const wishlistHandler = (req, res) => {
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    let { operation } = req.body;
    let { productId } = req.params;
    productId = parseInt(productId);
    var wishlist = req.session.wishlist ?? [];

    // Check for valid number & operation name
    if ( isNaN(productId) || (operation !== 'add' && operation !== 'remove') ) {
        return res.status(200).json({
            status: "error",
            title: languageHandler('errors.error', lang),
            message: languageHandler('errors.wrong_data', lang),
            csrfToken: req.csrfToken()
        });
    }

    if ( operation === 'add' ) {

        let sqlQuery = "SELECT products.id FROM products WHERE products.id = ? AND products.is_active = ?";

        db.query(sqlQuery, [productId, 1], (err, data) => {
            if (err) {
                console.log(err);
                return res.status(200).json({
                    status: "error",
                    title: languageHandler('errors.error', lang),
                    message: languageHandler('errors.server_error', lang),
                    csrfToken: req.csrfToken()
                });
            }

            else if (data.length === 0) {
                return res.status(200).json({
                    status: "error",
                    title: languageHandler('errors.error', lang),
                    message: languageHandler('errors.common_error', lang),
                    csrfToken: req.csrfToken()
                });
            }

            else if (data.length > 0) {
                wishlist.push(parseInt(data[0].id));
                req.session.wishlist = wishlist ?? [];
                operation = 'remove';

                return res.status(200).json({
                    status: "success",
                    title: languageHandler('products.added_to_wishlist', lang),
                    operation: operation,
                    finishedTask: 'added',
                    wishlistTotalNumber: req.session.wishlist.length,
                    csrfToken: req.csrfToken()
                });
            }
        });
    }

    else if ( operation === 'remove' ) {
        let hasTheProductId = wishlist?.some(item => item === productId);

        if ( hasTheProductId ) {
            wishlist = wishlist?.filter(item => item !== productId);
            req.session.wishlist = wishlist ?? [];
            operation = 'add';

            return res.status(200).json({
                status: "success",
                title: languageHandler('products.removed_from_wishlist', lang),
                operation: operation,
                finishedTask: 'removed',
                wishlistTotalNumber: req.session.wishlist.length,
                csrfToken: req.csrfToken()
            });
        }
        else if ( !hasTheProductId ) {
            return res.status(200).json({
                status: "error",
                title: languageHandler('errors.error', lang),
                message: languageHandler('errors.common_error', lang),
                csrfToken: req.csrfToken()
            });
        }
    }
};

const getWishlistListPage = ( req, res, next ) => {
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
    let wishlistProductIds = req.session.wishlist ?? [];
    let countParams = Array(wishlistProductIds.length).fill("?").join(",");
    let wishlistProductsList = [];

    var metas = {
        ...metaDefault,
        title: languageHandler("general.wishlist", lang) + metaDefault['separator'] + metaDefault['title'],
        lang: metaDefault.langs[lang],
        type: "website",
        url: `${ process.env.APP_URL }/${ lang }/wishlist`,
        description: languageHandler("meta.wishlist_description", lang) + metaDefault['separator'] + metaDefault['title'],
        image: {
            src: metaDefault['default_og_images'],
            width: metaDefault['og:image:width'],
            height: metaDefault['og:image:height'],
        },
    };

    if (wishlistProductIds.length === 0) {
        return res.render('pages/wishlist', {
            meta: metas,
            current_locale: lang,
            cart: cart,
            DB_CONFIG: DB_CONFIG,
            locales: ['hu', 'sr', 'en'],
            languageHandler: languageHandler,
            webshopCategories: req.webshopCategories,
            staticContent: req.static_content,
            wishlistProducts: wishlistProductsList ?? [],
            wishlistTotalNumber: wishlistProductsList.length,
            gdprCookies: gdprCookies,
            gdprAcceptedCookies: JSON.parse(req.cookies['allowed_cookie_types'] ?? '[]'),
            csrfToken: req.csrfToken()
        });
    }

    const selectWishlistProducts = `SELECT id, name, slug, image_thumbnail, short_description, price, discount_value, is_available, is_new, is_delivered, max_order_count FROM products WHERE id IN (${ countParams }) AND is_active = ? ORDER BY id DESC`;

    db.query(selectWishlistProducts, [...wishlistProductIds, 1], (err, data) => {
        if (err) {
            return errorHandler(err, req, res, 'productController', 821);
        }

        else if (data.length === 0) {
            return res.render('pages/wishlist', {
                meta: metas,
                current_locale: lang,
                cart: cart,
                DB_CONFIG: DB_CONFIG,
                locales: ['hu', 'sr', 'en'],
                languageHandler: languageHandler,
                webshopCategories: req.webshopCategories,
                staticContent: req.static_content,
                wishlistProducts: wishlistProductsList ?? [],
                wishlistTotalNumber: wishlistProductsList.length,
                gdprCookies: gdprCookies,
                gdprAcceptedCookies: JSON.parse(req.cookies['allowed_cookie_types'] ?? '[]'),
                csrfToken: req.csrfToken()
            });
        }

        else if (data.length > 0) {

            data.forEach(wishlistItem => {
                let result = {
                    id: parseInt(wishlistItem.id),
                    name: getValueByLanguage(wishlistItem.name, lang),
                    slug: wishlistItem.slug,
                    short: wishlistItem.short_description ? limitText(getValueByLanguage(wishlistItem.short_description, lang)) : null,
                    image: imagePathConverter(wishlistItem.image_thumbnail, "products"),
                    price: numberWithCommas(wishlistItem.price),
                    isOnDiscount: Boolean(wishlistItem.discount_value),
                    discount: wishlistItem.discount_value != null ? numberWithCommas(wishlistItem.discount_value) : null,
                    isAvailable: Boolean(wishlistItem.is_available),
                    isPostable: Boolean(wishlistItem.is_delivered),
                    isNew: Boolean(wishlistItem.is_new),
                    maxQuantity: parseInt(wishlistItem.max_order_count)
                }

                wishlistProductsList.push(result);
            });

            // Check for is the product already in the cart
            let productIdsInCart = cart?.items?.map(item => item.productId);

            wishlistProductsList?.forEach(wishlistItem => {

                wishlistItem.already_in_cart = productIdsInCart.includes(wishlistItem.id);
                wishlistItem.saved_in_wishlist = true;
            });

            return res.render('pages/wishlist', {
                meta: metas,
                current_locale: lang,
                cart: cart,
                locales: ['hu', 'sr', 'en'],
                DB_CONFIG: DB_CONFIG,
                languageHandler: languageHandler,
                webshopCategories: req.webshopCategories,
                staticContent: req.static_content,
                wishlistProducts: wishlistProductsList ?? [],
                wishlistTotalNumber: wishlistProductsList.length,
                gdprCookies: gdprCookies,
                gdprAcceptedCookies: JSON.parse(req.cookies['allowed_cookie_types'] ?? '[]'),
                csrfToken: req.csrfToken()
            });
        }
    });
};

module.exports = { getProductDetails, getAllProducts, handleProductComment, getCategoryProducts, ajaxLoadMoreComments, wishlistHandler, getWishlistListPage };
