const { db } = require("../config/db-connection");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const languageHandler = require("../helpers/languageHandler");
const { numberWithCommas } = require("../helpers/globalFunctions");
const { showServerErrorPage } = require("../helpers/showErrorPages");
const metaDefault = require('../config/meta');

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

    var { DB_CONFIG } = req;
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    let result = [];

    var metas = {
        title: languageHandler("nav.FAQ", lang) + metaDefault['separator'] + metaDefault['title'],
        lang: metaDefault.langs[lang],
        type: "website",
        url: `${ process.env.APP_URL }/${ lang }/faq`,
        description: languageHandler('meta.FAQ_description', lang),
        image: {
            src: metaDefault['default_og_images'],
            width: metaDefault['og:image:width'],
            height: metaDefault['og:image:height'],
        },
    };

    const sqlQuery = "SELECT question, answer FROM faq WHERE is_active = ? ORDER BY id DESC";

    db.query(sqlQuery, 1, (err, data) => {
        if (err) {
            console.log(err);
            return showServerErrorPage(req, res);
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
            DB_CONFIG: DB_CONFIG,
            webshopCategories: req.webshopCategories,
            wishlistTotalNumber: req.wishlistTotalNumber,
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

    var { DB_CONFIG } = req;
    var metas = {
        title: languageHandler("nav.gdpr", req.session.lang ?? process.env.FALLBACK_LANG),
        type: "website",
        url: `${ process.env.APP_URL }/${ req.session.lang ?? process.env.FALLBACK_LANG }/gdpr`,
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the GDPR page",
        // keywords: []
    };

    return res.render("pages/gdpr", {
        meta: metas,
        current_locale: req.session.lang ?? process.env.FALLBACK_LANG,
        cart: cart,
        locales: ['hu', 'sr', 'en'],
        languageHandler: languageHandler,
        DB_CONFIG: DB_CONFIG,
        webshopCategories: req.webshopCategories,
        wishlistTotalNumber: req.wishlistTotalNumber,
        csrfToken: req.csrfToken()
    });
}

const handleGDPR = (req, res) => {
    const { gdpr_email } = req.body;

    // TODO: Finish GDPR request handle
}

module.exports = { getFAQ, getGDPR, handleGDPR };
