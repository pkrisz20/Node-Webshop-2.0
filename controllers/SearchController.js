const { db } = require("../config/db-config");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const { numberWithCommas } = require("../helpers/globalFunctions");
const languageHandler = require("../helpers/languageHandler");

const handleSearch = (req, res) => {
    let { keywords } = req.query;
    const lang = req.session.lang;

    // Redirect if something is fishy with the query param
    if ( typeof keywords !== "string" || keywords.length === 0 ) {
        return res.redirect(`/${ lang ?? process.env.FALLBACK_LANG }`);
    }
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

    var metas = {
        title: languageHandler("general.search", lang),
        type: "page",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the search page",
        // keywords: []
    };

    let galleryFound = {
        count: 0,
        results: []
    };
    let productsFound = {
        count: 0,
        results: []
    };
    let blogsFound = {
        count: 0,
        results: []
    };

    const searchProductsQuery = "SELECT products.id, products.name, products.image_thumbnail, categories.name AS 'category_name' FROM products INNER JOIN categories ON products.category_id = categories.id WHERE products.is_active = ? AND (";
    let query = keywords.split(' ');
    let formattedParams = '';

    if (query.length === 1) {
        searchProductsQuery += `json_extract(products.name, $.${ lang }) LIKE ?)`;
    }
    else if (query.length > 1) {
        query.forEach((keyword, index) => {

            formattedParams += index === query.length - 1 ? `json_extract(products.name, $.${ lang }) LIKE ?)` : `json_extract(products.name, $.${ lang }) LIKE ? OR`;
        });
    }

    // TODO: Finish search

    const searchCategoriesQuery = "SELECT categories.id, categories.name, categories.icon FROM categories WHERE json_extract(categories.name, ?) LIKE ?";

    return res.render("pages/search", {
        meta: metas,
        current_locale: req.session.lang,
        cart: cart,
        locales: ['hu', 'sr', 'en'],
        languageHandler: languageHandler,
        csrfToken: req.csrfToken()
    });

    db.query(searchProductsQuery, [1, paramLanguage, query], (err, product_result) => {
        if (err) {
            console.log(err);
            return res.status(500).render("500", {
                title: languageHandler("errors.server_error", lang ?? process.env.FALLBACK_LANG),
                current_locale: lang ?? process.env.FALLBACK_LANG,
                back_to_home: languageHandler("general.back_to_home", lang ?? process.env.FALLBACK_LANG),
                learn_more: languageHandler("general.information", lang ?? process.env.FALLBACK_LANG),
                csrfToken: req.csrfToken()
            });
        }

        else if (product_result) {

            product_result.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    name: getValueByLanguage(element.name, lang),
                    image: imagePathConverter(element.image_thumbnail, "products"),
                    category: getValueByLanguage(element.category_name, lang)
                }

                productsFound.results.push(tempObject);
            });

            productsFound.count = productsFound.results.length;

            db.query(searchCategoriesQuery, [paramLanguage, query], (err, categoryResult) => {

                if (err) {
                    console.log(err);
                    return res.status(500).json({ status: "error" });
                }

                else if (categoryResult) {

                    categoryResult.forEach(element => {
                        let tempObject = {
                            id: parseInt(element.id),
                            name: getValueByLanguage(element.name, lang),
                            icon: imagePathConverter(element.icon, "categories")
                        }

                        categoriesFound.push(tempObject);
                    });

                    resultsCount += categoriesFound.length;
                }

                if (categoriesFound.length == 0) categoriesFound = null;
                if (productsFound.length == 0) productsFound = null;
            });
        }
    });
}

module.exports = { handleSearch };
