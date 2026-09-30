const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const errorHandler = require("../middleware/errorHandler");
const { WebshopCategory } = require("../models");
const { getSlug } = require("./admin/slugHelper");

const selectWebshopCategories = async (req, res, next) => {

    const lang = req.session.lang ?? process.env.FALLBACK_LANG;

    try {
        let webshopCategories = await WebshopCategory.findAll({
            attributes: ['id', 'name', 'slug', 'image'],
        });

        if (webshopCategories.length > 0) {

            webshopCategories = webshopCategories.map(category => {
                return {
                    id: parseInt(category.id),
                    name: getValueByLanguage(category.name, lang),
                    category_image: imagePathConverter(category.image, "categories"),
                    category_slug: getSlug(category.slug, lang)
                }
            });
        }

        res.locals.webshopCategories = webshopCategories ?? [];
        return next();
    }
    catch (err) {
        return errorHandler(err, req, res, "selectWebshopCategories", 16);
    }
}

module.exports = selectWebshopCategories;
