const DoDatabaseQuery = require("../helpers/databaseQueryHelper");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const languageHandler = require("../helpers/languageHandler");
const errorHandler = require('../middleware/errorHandler');
const { numberWithCommas } = require('../helpers/globalFunctions');
const metaDefault = require('../config/meta');
const gdprCookies = require('../config/gdpr');

const getEmployees = async (req, res) => {
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
    let employees = [];
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;

    var metas = {
        ...metaDefault,
        title: languageHandler("nav.about", lang) + metaDefault['separator'] + metaDefault['title'],
        lang: metaDefault.langs[lang],
        type: "website",
        url: `${ process.env.APP_URL }/${ lang }/` + languageHandler('slugs.about_us', lang),
        description: languageHandler('meta.about_us_description', lang),
        image: {
            src: metaDefault['default_og_images'],
            width: metaDefault['og:image:width'],
            height: metaDefault['og:image:height'],
        },
    };

    const sqlQuery = "SELECT name, description, position, image, facebook, tiktok, instagram, email, phone FROM employees WHERE is_active = ?";

    try {
        const data = await DoDatabaseQuery(sqlQuery, [1]);

        if (data.length > 0) {

            data.forEach(element => {
                let tempObject = {
                    name: element.name,
                    desc: getValueByLanguage(element.description, lang),
                    image: imagePathConverter(element.image, "employees"),
                    position: getValueByLanguage(element.position, lang),
                    contact: {
                        facebook: element.facebook,
                        tiktok: element.tiktok,
                        instagram: element.instagram,
                        email: element.email,
                        phone: element.phone
                    }
                }

                employees.push(tempObject);
            });
        }

        return res.render("pages/about", {
            employees: employees ?? [],
            pageData: {
                shortDesc: getValueByLanguage(DB_CONFIG["about_us_short"] ?? null, lang),
                longDesc: getValueByLanguage(DB_CONFIG["about_us_long"] ?? null, lang),
            },
            meta: metas,
            current_locale: lang,
            DB_CONFIG: DB_CONFIG,
            cart: cart,
            locales: ['hu', 'sr', 'en'],
            languageHandler: languageHandler,
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
        return errorHandler(error, req, res, 'employeesController', 88);
    }
}

module.exports= { getEmployees };
