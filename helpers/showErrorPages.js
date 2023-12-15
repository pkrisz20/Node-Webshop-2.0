const languageHandler = require("./languageHandler");

const showServerErrorPage = (req, res) => {
    return res.status(500).render("500", {
        title: languageHandler("errors.server_error", req.session.lang ?? process.env.FALLBACK_LANG),
        current_locale: req.session.lang,
        back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
        learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
        csrfToken: req.csrfToken()
    });
};

const showBadRequestPage = (req, res) => {
    return res.status(400).render("400", {
        title: languageHandler("errors.wrong_data", req.session.lang ?? process.env.FALLBACK_LANG),
        current_locale: req.session.lang,
        back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
        learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
        csrfToken: req.csrfToken()
    });
};

const showUnauthorizedUserPage = (req, res) => {
    return res.status(401).render("401", {
        title: languageHandler("errors.unauthorized", req.session.lang ?? process.env.FALLBACK_LANG),
        subtitle: languageHandler("errors.no_permission", req.session.lang ?? process.env.FALLBACK_LANG),
        current_locale: req.session.lang ?? process.env.FALLBACK_LANG,
        login_text: languageHandler("validations.login", req.session.lang ?? process.env.FALLBACK_LANG),
        back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
        learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
        csrfToken: req.csrfToken()
    });
};

const showNotFoundPage = (req, res) => {
    return res.status(404).render('404', {
        current_locale: req.session.lang ?? process.env.FALLBACK_LANG,
        title: languageHandler("errors.not_found", req.session.lang ?? process.env.FALLBACK_LANG),
        back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
        learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
        csrfToken: req.csrfToken()
    });
};

const showForbiddenPage = (req, res) => {
    return res.status(403).render('403', {
        current_locale: req.session.lang ?? process.env.FALLBACK_LANG,
        title: languageHandler("errors.forbidden", req.session.lang ?? process.env.FALLBACK_LANG),
        back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
        learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
        csrfToken: req.csrfToken()
    });
};

module.exports = { showServerErrorPage, showBadRequestPage, showUnauthorizedUserPage, showNotFoundPage, showForbiddenPage };
