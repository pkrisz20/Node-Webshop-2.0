const DoDatabaseQuery = require("../helpers/databaseQueryHelper");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const languageHandler = require("../helpers/languageHandler");
const { numberWithCommas } = require("../helpers/globalFunctions");
const errorHandler = require('../middleware/errorHandler');
const { showNotFoundPage } = require("../helpers/showErrorPages");
const metaDefault = require('../config/meta');
const gdprCookies = require('../config/gdpr');

const getFAQ = async (req, res) => {
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
        ...metaDefault,
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

    try {
        const data = await DoDatabaseQuery(sqlQuery, [1]);

        if (data.length > 0) {

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
            showPopupCartInformation: req.session.showPopupCartInformation,
            webshopCategories: req.webshopCategories,
            staticContent: req.static_content,
            wishlistTotalNumber: req.wishlistTotalNumber,
            gdprCookies: gdprCookies,
            gdprAcceptedCookies: JSON.parse(req.cookies['allowed_cookie_types'] ?? '[]'),
            csrfToken: req.csrfToken()
        });
    }
    catch (error) {
        return errorHandler(error, req, res, 'staticController');
    }
}

// Not used
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
        ...metaDefault,
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
        showPopupCartInformation: req.session.showPopupCartInformation,
        webshopCategories: req.webshopCategories,
        staticContent: req.static_content,
        wishlistTotalNumber: req.wishlistTotalNumber,
        gdprCookies: gdprCookies,
        gdprAcceptedCookies: JSON.parse(req.cookies['allowed_cookie_types'] ?? '[]'),
        csrfToken: req.csrfToken()
    });
}

const handleGDPR = (req, res) => {
    try {
        // Enable the endpoint, if the GDPR consent component is enabled
        if (process.env.GDPR_ENABLED || false) {

            let allowed_cookies = req.body['allowed_cookies[]'];

            // If the payload is empty, then create an array with the necessary consent type
            if ( !allowed_cookies ) {
                allowed_cookies = ['necessary'];
            }

            // Force the necessary type anyway
            if (!allowed_cookies.includes('necessary')) {
                allowed_cookies.push('necessary');
            }

            // Set the new cookie with settings for accepted consent types
            res.cookie('allowed_cookie_types', JSON.stringify(allowed_cookies), {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 365,
                secure: process.env.APP_DEBUG === 'false',
            });

            return res.status(200).json({
                status: "success",
                csrfToken: req.csrfToken()
            });
        }
        else {
            return res.status(200).json({
                status: "error",
                title: languageHandler("errors.not_found", req.session.lang ?? process.env.FALLBACK_LANG),
                csrfToken: req.csrfToken()
            });
        }
    }
    catch (error) {
        errorHandler(error, req, res, 'staticContentsController', 162, true);

        return res.status(200).json({
            status: "error",
            title: languageHandler("errors.server_error", req.session.lang ?? process.env.FALLBACK_LANG),
            message: languageHandler("errors.common_error", req.session.lang ?? process.env.FALLBACK_LANG),
            csrfToken: req.csrfToken()
        });
    }
}

const getStaticPage = async (req, res) => {
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

    let { routeName } = req.params;
    var { DB_CONFIG } = req;
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;

    try {
        const content = await DoDatabaseQuery("SELECT title, short_description, description, slug FROM static_contents WHERE slug = ?", [routeName]);

        if (content.length > 0) {
            const staticSiteTitle = getValueByLanguage(content[0].title, lang);
            const staticSiteShort = getValueByLanguage(content[0].short_description, lang);
            const staticSiteDescription = getValueByLanguage(content[0].description, lang);
            const contentSlug = content[0].slug;

            var metas = {
                ...metaDefault,
                title: staticSiteTitle + metaDefault['separator'] + metaDefault['title'],
                lang: metaDefault.langs[lang],
                type: "website",
                url: `${ process.env.APP_URL }/${ lang }/${ contentSlug }`,
                description: staticSiteShort ? staticSiteShort : languageHandler('meta.description', lang),
                image: {
                    src: metaDefault['default_og_images'],
                    width: metaDefault['og:image:width'],
                    height: metaDefault['og:image:height'],
                },
            };

            return res.render("pages/static-page", {
                meta: metas,
                contentTitle: staticSiteTitle,
                contentShortDescription: staticSiteShort,
                contentDescription: staticSiteDescription,
                contentSlug: contentSlug,
                current_locale: lang,
                cart: cart,
                locales: ['hu', 'sr', 'en'],
                languageHandler: languageHandler,
                DB_CONFIG: DB_CONFIG,
                showPopupCartInformation: req.session.showPopupCartInformation,
                webshopCategories: req.webshopCategories,
                staticContent: req.static_content,
                wishlistTotalNumber: req.wishlistTotalNumber,
                gdprCookies: gdprCookies,
                gdprAcceptedCookies: JSON.parse(req.cookies['allowed_cookie_types'] ?? '[]'),
                csrfToken: req.csrfToken()
            });
        }

        return showNotFoundPage(req, res);
    }
    catch (error) {
        return errorHandler(error, req, res, 'staticController', 238);
    }
}

module.exports = { getFAQ, getGDPR, handleGDPR, getStaticPage };
