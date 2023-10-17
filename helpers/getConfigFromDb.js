const { db } = require("../config/db-connection");
const languageHandler = require("../helpers/languageHandler");
const { showServerErrorPage } = require("../helpers/showErrorPages");

const getConfigFromDb = ( req, res, next ) => {

    const globalConfigDB = {};
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;

    db.query("SELECT config_key, config_value FROM config", (err, config_data) => {

        if (err) {
            return showServerErrorPage(req, res);
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
