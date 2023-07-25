const { db } = require("../config/db-config");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");

const getCartItems = (req, res, next) => {
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    var cartProductIds = [];
    let cartItems = req.session.cart ?? [];

    cartProductIds = cartItems?.map(item => {
        return item.productId;
    });

    if ( cartProductIds.length > 0 ) {

        let countParams = Array(cartProductIds.length).fill("?").join(",");

        db.query(`SELECT id, name, price, image_thumbnail, discount_value, max_order_count FROM products WHERE id IN (${ countParams })`, [...cartProductIds], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).render("500", {
                    title: languageHandler("errors.server_error", lang ?? process.env.FALLBACK_LANG),
                    current_locale: req.session.lang,
                    back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
                    learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
                    csrfToken: req.csrfToken()
                });
            }

            else if (result.length > 0) {

                cartItems?.forEach(cartItem => {

                    result.forEach(databaseItem => {

                        if (cartItem.productId === databaseItem.id) {
                            cartItem.productName = getValueByLanguage(databaseItem.name, lang),
                            cartItem.maxQuantity = parseInt(databaseItem.max_order_count),
                            cartItem.price = databaseItem.discount_value != null ? parseInt(databaseItem.discount_value) : parseInt(databaseItem.price),
                            cartItem.image = imagePathConverter(databaseItem.image_thumbnail, "products")
                        }
                    });
                });

                cartItems = cartItems?.map(item => {
                    return {
                        ...item,
                        quantity: parseInt(item.quantity)
                    }
                });

                let totalPrice = cartItems.reduce((total, product) => product.quantity * product.price + total, 0);
                let totalCount = cartItems.length;

                req.session.cart = cartItems;
                req.session.totalPrice = totalPrice;
                req.session.totalCount = totalCount;
                return next();
            }
        });
    }

    else if ( cartProductIds.length == 0 ) {
        req.session.cart = [];
        req.session.totalPrice = 0;
        req.session.totalCount = 0;
        return next();
    }
}

module.exports = { getCartItems };
