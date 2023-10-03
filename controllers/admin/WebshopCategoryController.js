const { db } = require("../../config/db-connection");
const getValueByLanguage = require("../../helpers/getValueByLanguage");
const { setMomentLocale } = require("../../helpers/globalFunctions");
const moment = require("moment");
const languageHandler = require("../../helpers/languageHandler");

const getWebshopCategoryList = (req, res) => {
    var metas = {
        title: 'Admin category list page',
        type: "webiste",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the Webshop category list page",
        // keywords: []
    };
    setMomentLocale("hu");

    let webshopCategories = [];
    const lang = req.session.lang ?? process.env.ADMIN_LANG;
    const selectWebshopCategories = "SELECT id, name, created_at, updated_at, (SELECT COUNT(products.id) FROM products WHERE products.category_id = categories.id) AS 'products_count' FROM categories";

    db.query(selectWebshopCategories, (err, category_list) => {

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

        if (category_list.length > 0) {

            category_list.forEach(category => {
                let tempObject = {
                    id: parseInt(category.id),
                    name: getValueByLanguage(category.name, lang),
                    date: category.updated_at != null ? category.updated_at : category.created_at,
                    productsCount: category.products_count ?? 0
                }

                webshopCategories.push(tempObject);
            });

            webshopCategories = webshopCategories.map(item => {
                return {
                    ...item,
                    date: moment(item.date).format("YYYY. MMMM DD. HH:mm:ss"),
                };
            });
        }

        return res.render("admin/categories/list", {
            meta: metas,
            webshopCategories: webshopCategories ?? [],
            csrfToken: req.csrfToken()
        });
    });
}

module.exports = { getWebshopCategoryList };
