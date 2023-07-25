const { db } = require("../config/db-config");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const languageHandler = require("../helpers/languageHandler");
const { numberWithCommas } = require("../helpers/globalFunctions");
const getFrontTranslations = require("../helpers/frontTranslations");

const getFAQ = (req, res) => {
    // Cart converting stuffs
    var cart = {
        items: req.session.cart ?? [],
        totalCount: req.session.totalCount,
        totalPrice: numberWithCommas(req.session.totalPrice)
    };
    cart.items = cart.items.map(item => {
        return {
            ...item,
            price: numberWithCommas(item.price)
        }
    });

    const lang = req.session.lang;
    let result = [];
    var metas = {
        title: languageHandler("nav.FAQ", lang),
        type: "page",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the FAQ page",
        // keywords: []
    };

    const sqlQuery = "SELECT question, answer FROM faq WHERE is_active = ? ORDER BY id DESC";

    db.query(sqlQuery, 1, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).render("500", {
                title: languageHandler("errors.server_error", lang ?? process.env.FALLBACK_LANG),
                current_locale: lang ?? process.env.FALLBACK_LANG,
                back_to_home: languageHandler("general.back_to_home", lang ?? process.env.FALLBACK_LANG),
                learn_more: languageHandler("general.information", lang ?? process.env.FALLBACK_LANG),
                csrfToken: req.csrfToken()
            });
        }

        else if (data.length > 0) {

            data.forEach(element => {
                let tempObject = {
                    question: getValueByLanguage(element.question, lang),
                    answer: getValueByLanguage(element.answer, lang)
                }

                result.push(tempObject);
            });
        }

        return res.render("pages/faq", {
            questions: result ?? [],
            meta: metas,
            current_locale: req.session.lang ?? process.env.FALLBACK_LANG,
            cart: cart,
            locales: ['hu', 'sr', 'en'],
            languageHandler: languageHandler,
            csrfToken: req.csrfToken()
        });
    });
}

const getGDPR = (req, res) => {
    // Cart converting stuffs
    var cart = {
        items: req.session.cart ?? [],
        totalCount: req.session.totalCount,
        totalPrice: numberWithCommas(req.session.totalPrice)
    };
    cart.items = cart.items.map(item => {
        return {
            ...item,
            price: numberWithCommas(item.price)
        }
    });

    var metas = {
        title: languageHandler("nav.gdpr", req.session.lang ?? process.env.FALLBACK_LANG),
        type: "page",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the GDPR page",
        // keywords: []
    };

    return res.render("pages/gdpr", {
        meta: metas,
        current_locale: req.session.lang ?? process.env.FALLBACK_LANG,
        cart: cart,
        locales: ['hu', 'sr', 'en'],
        frontTranslations: getFrontTranslations(req.session.lang ?? process.env.FALLBACK_LANG),
        languageHandler: languageHandler,
        csrfToken: req.csrfToken()
    });
}

const handleGDPR = (req, res) => {
    const { gdpr_email } = req.body;

    // TODO: Finish GDPR request handle
}

module.exports = { getFAQ, getGDPR, handleGDPR };
