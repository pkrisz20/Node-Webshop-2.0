const { db } = require("../config/db-connection");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const { showServerErrorPage } = require("../helpers/showErrorPages");

const selectStaticContents = ( req, res, next ) => {

    const static_contents = {};
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    const staticContentsSQL = "SELECT id, title, slug, content_name FROM static_contents";

    db.query(staticContentsSQL, (err, contents_list) => {

        if (err) {
            console.log(err);
            return showServerErrorPage(req, res);
        }

        if (contents_list.length > 0) {

            contents_list.forEach(staticContent => {
                static_contents[staticContent.content_name] = {
                    id: parseInt(staticContent.id),
                    title: getValueByLanguage(staticContent.title, lang),
                    slug: staticContent.slug
                }
            });
        }

        req.static_content = static_contents ?? null;
        return next();
    });
}

module.exports = selectStaticContents;
