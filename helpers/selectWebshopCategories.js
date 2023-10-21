const { db } = require("../config/db-connection");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const { showServerErrorPage } = require("../helpers/showErrorPages");

const selectWebshopCategories = ( req, res, next ) => {

    const webshopCategories = [];
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    const webshopCategoriesSQL = "SELECT id, name, slug, image FROM categories";

    db.query(webshopCategoriesSQL, (err, category_list) => {

        if (err) {
            console.log(err);
            return showServerErrorPage(req, res);
        }

        if (category_list.length > 0) {

            category_list.forEach(category => {
                let tempObject = {
                    id: parseInt(category.id),
                    name: getValueByLanguage(category.name, lang),
                    category_image: imagePathConverter(category.image, "categories"),
                    category_slug: category.slug
                }

                webshopCategories.push(tempObject);
            });
        }

        req.webshopCategories = webshopCategories ?? [];
        return next();
    });
}

module.exports = selectWebshopCategories;
