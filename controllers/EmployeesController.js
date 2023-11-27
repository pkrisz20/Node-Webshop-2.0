const { db } = require("../config/db-connection");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const languageHandler = require("../helpers/languageHandler");
const { numberWithCommas } = require('../helpers/globalFunctions');
const { showServerErrorPage } = require("../helpers/showErrorPages");

const getEmployees = (req, res) => {
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
    var lang = req.session.lang ?? process.env.FALLBACK_LANG;
    var metas = {
        title: languageHandler("nav.about", lang ?? process.env.FALLBACK_LANG),
        type: "website",
        url: `${ process.env.APP_URL }/${ lang ?? process.env.FALLBACK_LANG }/about`,
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the about page, here can the guests read about us"
    };
    const sqlQuery = "SELECT name, position, image, facebook, tiktok, instagram, email, phone FROM employees WHERE is_active = ?";

    db.query(sqlQuery, 1, (err, data) => {
        if (err) {
            console.log(err);
            return showServerErrorPage(req, res);
        }

        else if (data.length > 0) {

            data.forEach(element => {
                let tempObject = {
                    name: element.name,
                    image: imagePathConverter(element.image, "employees"),
                    position: getValueByLanguage(element.position, lang ?? process.env.FALLBACK_LANG),
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
                shortDesc: "Short desc goes here",
                longDesc: "Long desc goes here",
            },
            meta: metas,
            current_locale: req.session.lang ?? process.env.FALLBACK_LANG,
            DB_CONFIG: DB_CONFIG,
            cart: cart,
            locales: ['hu', 'sr', 'en'],
            languageHandler: languageHandler,
            webshopCategories: req.webshopCategories,
            wishlistTotalNumber: req.wishlistTotalNumber,
            csrfToken: req.csrfToken()
        });
    });
}

module.exports= { getEmployees };
