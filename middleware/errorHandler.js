const { logEvents } = require("./logEvents");

const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}`, "errors.log");
    console.error(err.stack);
    console.log(process.env.FALLBACK_LANG);
    return res.status(500).render("500", { current_locale: req.session.lang ?? process.env.FALLBACK_LANG });
}

module.exports = errorHandler;
