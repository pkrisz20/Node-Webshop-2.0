const { db } = require("../config/db-config");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const { numberWithCommas } = require('../helpers/globalFunctions');

const getCartItems = (req, res) => {
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    var cartProductIds = [];
    var cart = req.session.cart ?? [];

    // This whole code is 'cause of the language differences

    // There is no items in cart
    if (cart.length == 0 || !cart) {
        // return res.status(200).json({ status: 'success', cart: req.session.cart ?? [] });
        return req.session.cart ?? [];
    }

    cartProductIds = cart?.map(item => {
        return item.productId;
    });

    // There is one item in cart
    if (cartProductIds.length == 1) {
        const sqlSelect = "SELECT name FROM products WHERE id = ?";

        db.query(sqlSelect, cartProductIds[0], (err, result) => {
            if (err) {
                console.log(err);
                // return res.status(500).json({ status: "error" });
                return [];
            }

            else if (result.length > 0) {
                let productName = getValueByLanguage(result[0].name, lang);

                cart = cart.map(item => ({ ...item, productName, price: numberWithCommas(item.price) }));

                req.session.cart = cart;
            }

            // return res.status(200).json({ status: 'success', cart: req.session.cart ?? [] });
            return req.session.cart ?? [];
        });
    }

    // There are more items in cart
    else if (cartProductIds.length > 1) {

        let countParams = Array(cartProductIds.length).fill("?").join(",");

        db.query(`SELECT id, name FROM products WHERE id IN (${ countParams })`, [...cartProductIds], (err, result) => {
            if (err) {
                console.log(err);
                // return res.status(500).json({ status: "error" });
                return [];
            }

            else if (result.length > 0) {
                let productNamesWithIds = [];
                let tempObj = {};

                result.forEach(item => {
                    tempObj = { productId: item.id, productName: getValueByLanguage(item.name, lang) };
                    productNamesWithIds.push(tempObj);
                });

                cart = cart.map(cartItem => {
                    return { ...cartItem, price: numberWithCommas(cartItem.price), productName: productNamesWithIds.find(item => item.productId === cartItem.productId).productName };
                });

                req.session.cart = cart;
            }

            // return res.status(200).json({ status: 'success', cart: req.session.cart ?? [] });
            return req.session.cart ?? [];
        });
    }
}

module.exports = { getCartItems };
