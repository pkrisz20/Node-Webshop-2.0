const { db } = require("../../config/db-connection");
const getValueByLanguage = require("../../helpers/getValueByLanguage");
const { setMomentLocale } = require("../../helpers/globalFunctions");
const { showServerErrorPage } = require("../../helpers/showErrorPages");
const moment = require("moment");

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
            return showServerErrorPage(req, res);
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

const deleteWebshopCategory = (req, res) => {
    let { categoryId } = req.params;

    const deleteCategoryQuery = "DELETE FROM categories WHERE id = ?";

    db.query(deleteCategoryQuery, categoryId, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(200).json({ status: "error" });
        }
        else {
            return res.status(200).json({ status: "success" });
        }
    });
}

module.exports = { getWebshopCategoryList, deleteWebshopCategory };
