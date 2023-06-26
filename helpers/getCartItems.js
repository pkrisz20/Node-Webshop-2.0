const { db } = require("../config/db-config");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const { numberWithCommas } = require('../helpers/globalFunctions');

const getCartItems = (req, res) => {
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    var cartProductIds = [];
    let cartItems = req.session.cart ?? [];

    cartProductIds = cartItems?.map(item => {
        return item.productId;
    });

    if ( cartProductIds.length > 0 ) {

        let countParams = Array(cartProductIds.length).fill("?").join(",");

        console.log('[...cartProductIds]', [...cartProductIds]);
        console.log(`SELECT id, name, price, image_thumbnail, discount_value FROM products WHERE id IN (${ countParams })`);

        db.query(`SELECT id, name, price, image_thumbnail, discount_value FROM products WHERE id IN (${ countParams })`, [...cartProductIds], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).render("500", { current_locale: req.session.lang });
            }

            else if (result.length > 0) {
                console.table("result in function", result);

                cartItems = result?.map(cartItem => {
                    return {
                        ...cartItem,
                        price: cartItem.discount_value != null ? numberWithCommas(cartItem.discount_value) : numberWithCommas(cartItem.price),
                        productName: getValueByLanguage(cartItem.productName, lang),
                        image: imagePathConverter(cartItem.image_thumbnail, "products")
                    };
                });

                let totalPrice = cartItems.reduce((total, product) => product.quantity * product.price + total, 0);
                let totalCount = cartItems.length;

                req.session.cart = cartItems;

                console.log('req.session.cart', req.session.cart);

                let cart = {
                    items: req.session.cart ?? [],
                    totalCount, totalCount,
                    totalPrice: totalPrice
                };

                return cart;
            }
        });
    }

    else if ( cartProductIds.length == 0 ) {
        // console.log('there NO in cart');

        return {
            items: [],
            totalCount: 0,
            totalPrice: 0
        };
    }
}

module.exports = { getCartItems };
