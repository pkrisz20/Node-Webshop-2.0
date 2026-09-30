const errorHandler = require("../middleware/errorHandler");
const getValueByLanguage = require("./getValueByLanguage");
const { Config } = require("../models");

const getConfigFromDb = async (req, res, next) => {

    let globalConfigDB = {};
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;

    try {
        let rawConfigData = await Config.findAll();

        for (const item of rawConfigData) {
            globalConfigDB[item.config_key] = item.config_value;
        }

        // Get the value from json by current lang
        globalConfigDB.home_page_title = getValueByLanguage(globalConfigDB.home_page_title, lang);
        globalConfigDB.home_page_text = getValueByLanguage(globalConfigDB.home_page_text, lang);

        req.DB_CONFIG = globalConfigDB; // Share with the controller methods
        res.locals.DB_CONFIG = globalConfigDB; // Share with every template file
        return next();
    }
    catch (err) {
        return errorHandler(err, req, res, "getConfigFromDb", 27);
    }
}

module.exports = getConfigFromDb;
