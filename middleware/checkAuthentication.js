const languageHandler = require('../helpers/languageHandler');

const isAuthenticated = async (req, res, next) => {
    try {
        // Check if session exists and user is authenticated
        if ( req.session.authenticated === true ) {
            req.session.lang = "hu";
            return next();  // User is authenticated, proceed to the next middleware
        }
        else {
            return res.status(401).render("401", {
                title: languageHandler("errors.unauthorized", req.session.lang ?? process.env.FALLBACK_LANG),
                subtitle: languageHandler("errors.no_permission", req.session.lang ?? process.env.FALLBACK_LANG),
                current_locale: req.session.lang ?? process.env.FALLBACK_LANG,
                login_text: languageHandler("validations.login", req.session.lang ?? process.env.FALLBACK_LANG),
                back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
                learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
                csrfToken: req.csrfToken()
            });
        }
    }
    catch (error) {
        return res.status(500).render("500", {
            title: languageHandler("errors.server_error", req.session.lang ?? process.env.FALLBACK_LANG),
            current_locale: req.session.lang ?? process.env.FALLBACK_LANG,
            back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
            learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
            csrfToken: req.csrfToken()
        });
    }
};

module.exports = isAuthenticated;
