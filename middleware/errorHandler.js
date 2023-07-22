const { logEvents } = require("./logEvents");
const languageHandler = require("../helpers/languageHandler");

const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}`, "errors.log");
    console.error(err.stack);
    return res.status(500).render("500", {
        title: languageHandler("errors.server_error", req.session.lang ?? process.env.FALLBACK_LANG),
        back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
        learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
        current_locale: req.session.lang ?? process.env.FALLBACK_LANG
    });
}

module.exports = errorHandler;
