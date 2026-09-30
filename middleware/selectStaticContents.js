const { getSlug } = require("../helpers/admin/slugHelper");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const errorHandler = require("./errorHandler");
const { StaticContent } = require("../models");

const selectStaticContents = async (req, res, next) => {
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;

    try {
        let static_contents = await StaticContent.findAll({
            attributes: ['id', 'title', 'slug', 'content_name'],
        });

        if (static_contents.length > 0) {
            static_contents.forEach(staticContent => {
                static_contents[staticContent.content_name] = {
                    id: parseInt(staticContent.id),
                    title: getValueByLanguage(staticContent.title, lang),
                    slug: getSlug(staticContent.slug, lang)
                }
            });
        }

        res.locals.staticContent = static_contents ?? null;
        return next();
    }
    catch (error) {
        return errorHandler(err, req, res, "selectStaticContents", 6);
    }
}

module.exports = selectStaticContents;
