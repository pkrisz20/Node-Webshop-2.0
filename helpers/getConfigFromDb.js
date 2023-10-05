const { db } = require("../config/db-connection");
const languageHandler = require("../helpers/languageHandler");

const getConfigFromDb = ( req, res, next ) => {

    const globalConfigDB = {};
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;

    db.query("SELECT config_key, config_value FROM config", (err, config_data) => {

        if (err) {
            return res.status(500).render("500", {
                title: languageHandler("errors.server_error", lang ?? process.env.FALLBACK_LANG),
                current_locale: req.session.lang ?? process.env.FALLBACK_LANG,
                back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
                learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
                csrfToken: req.csrfToken()
            });
        }

        else if ( config_data.length > 0 ) {
            for (const item of config_data) {
                globalConfigDB[item.config_key] = item.config_value;
            }

            req.DB_CONFIG = globalConfigDB;
            return next();
        }
    });
}

module.exports = getConfigFromDb;
