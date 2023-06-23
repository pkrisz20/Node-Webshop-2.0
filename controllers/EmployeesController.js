const { db } = require("../config/db-config");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const languageHandler = require("../helpers/languageHandler");
const { getCartItems } = require("../helpers/getCartItems");

const getEmployees = (req, res) => {
    let cart = getCartItems(req, res);
    let employees = [];
    var lang = req.session.lang;
    var metas = {
        title: "About",
        type: "article",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the about page, here can the guests read about us"
    };

    const sqlQuery = "SELECT name, position, image, facebook, twitter, instagram, email, phone FROM employees WHERE is_active = ?";

    db.query(sqlQuery, 1, (err, data) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500).render("500");
        }

        else if (data.length > 0) {

            data.forEach(element => {
                let tempObject = {
                    name: element.name,
                    image: imagePathConverter(element.image, "employees"),
                    position: getValueByLanguage(element.position, lang),
                    contact: {
                        facebook: element.facebook,
                        twitter: element.twitter,
                        instagram: element.instagram,
                        email: element.email,
                        phone: element.phone
                    }
                }

                employees.push(tempObject);
            });
        }

        return res.render("about", {
            employees: employees ?? [],
            meta: metas,
            current_locale: req.session.lang,
            cart: cart,
            locales: ['hu', 'sr', 'en'],
            languageHandler: languageHandler
        });
    });
}

module.exports= { getEmployees };
