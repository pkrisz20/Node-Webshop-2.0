const { db } = require("../config/db-config");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const { numberWithCommas } = require('../helpers/globalFunctions');

const getCartItems = (req, res) => {
    const { lang } = req.body;
    var cartProductIds = [];
    var cart = req.session.cart ?? [];

    // This whole code is 'cause of the language differences

    // There is no items in cart
    if (cart.length == 0 || !cart) {
        return res.status(200).json({ status: 'success', cart: req.session.cart ?? [] });
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
                return res.status(500).json({ status: "error" });
            }

            else if (result.length > 0) {
                let productName = getValueByLanguage(result[0].name, lang);

                cart = cart.map(item => ({ ...item, productName, price: numberWithCommas(item.price) }));

                req.session.cart = cart;
            }

            return res.status(200).json({ status: 'success', cart: req.session.cart ?? [] });
        });
    }

    // There are more items in cart
    else if (cartProductIds.length > 1) {

        let countParams = Array(cartProductIds.length).fill("?").join(",");

        db.query(`SELECT id, name FROM products WHERE id IN (${ countParams })`, [...cartProductIds], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ status: "error" });
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

            return res.status(200).json({ status: 'success', cart: req.session.cart ?? [] });
        });
    }
}

const deleteCartItem = (req, res) => {
    const { productId } = req.body;

    let isExists = req.session?.cart?.some(item => item.productId === productId);

    if (isExists) {
        const filteredSession = req.session?.cart?.filter(item => {
            return item.productId !== productId
        });

        req.session.cart = filteredSession;

        return res.status(200).json({ status: 'success', cart: req.session.cart });
    }

    return res.status(400).json({ status: 'error' });
}

const addCartItem = (req, res) => {
    let { cartItem } = req.body;
    let { lang } = req.body;
    let cart = req.session.cart ?? [];

    cartItem = { lang, ...cartItem };

    if (
            !cartItem.hasOwnProperty("productId")
            || !cartItem.hasOwnProperty("image")
            || !cartItem.hasOwnProperty("productName")
            || !cartItem.hasOwnProperty("maxQuantity")
            || !cartItem.hasOwnProperty("quantity")
            || !cartItem.hasOwnProperty("price")
            || (cartItem.quantity > cartItem.maxQuantity)
        )
    {
        return res.status(400).json({ status: 'error' });
    }

    cart.push(cartItem);
    req.session.cart = cart;

    return res.status(200).json({ status: 'success', cart: req.session.cart });
}

const updateCartItem = (req, res) => {
    let { productId } = req.body;
    let { quantity } = req.body;

    if (!quantity || quantity === 0 || !productId) {
        return res.status(400).json({ status: 'error' });
    }

    const maxQuantityEnabled = req.session?.cart?.find(item => item.productId === productId).maxQuantity;

    if (quantity > maxQuantityEnabled) {
        return res.status(400).json({ status: 'error' });
    }

    const objIndex = req.session?.cart?.findIndex(item => item.productId === productId);
    req.session.cart[objIndex].quantity = quantity;

    return res.status(200).json({ status: 'success', cart: req.session.cart });
}

module.exports = { getCartItems, deleteCartItem, addCartItem, updateCartItem };
