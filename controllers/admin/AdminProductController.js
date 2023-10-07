const { db } = require("../../config/db-connection");
const getValueByLanguage = require("../../helpers/getValueByLanguage");
const { setMomentLocale } = require("../../helpers/globalFunctions");
const { getIconByActivity } = require('../../helpers/admin/getIconByActivity');
const languageHandler = require("../../helpers/languageHandler");
const moment = require("moment");

const getWebshopProductList = (req, res) => {
    var metas = {
        title: 'Admin products list page',
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
        return res.status(400).render("400", {
            title: languageHandler("errors.wrong_data", lang ?? process.env.ADMIN_LANG),
            current_locale: req.session.lang,
            back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.ADMIN_LANG),
            learn_more: languageHandler("general.information", req.session.lang ?? process.env.ADMIN_LANG),
            csrfToken: req.csrfToken()
        });
    }

    const selectWebshopProducts = "SELECT products.id, products.name, products.discount_value, products.is_active, products.created_at, products.updated_at, categories.name AS 'category_name' FROM products INNER JOIN categories ON products.category_id = categories.id ORDER BY products.id DESC LIMIT ? OFFSET ?";

    let pageOffset = (page - 1) * parseInt(process.env.ADMIN_PAGINATION);

    db.query(selectWebshopProducts, [parseInt(process.env.ADMIN_PAGINATION), pageOffset], (err, products_list) => {

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
                    date: moment(item.date).format("YYYY. MMMM DD. HH:mm:ss"),
                };
            });

            let selectForPagination = "SELECT COUNT(products.id) AS 'each_article_count' FROM products";

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

module.exports = { getWebshopProductList };
