const { db } = require("../config/db-config");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const languageHandler = require("../helpers/languageHandler");
const { numberWithCommas } = require("../helpers/globalFunctions");

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
                current_locale: req.session.lang
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
            current_locale: req.session.lang,
            cart: cart,
            locales: ['hu', 'sr', 'en'],
            languageHandler: languageHandler
        });
    });
}

module.exports = { getFAQ };
