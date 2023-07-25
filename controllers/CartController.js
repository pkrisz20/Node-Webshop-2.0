const languageHandler = require("../helpers/languageHandler");
const { db } = require("../config/db-config");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const { numberWithCommas } = require('../helpers/globalFunctions');

const deleteCartItem = (req, res) => {
    let { productId } = req.body;
    productId = parseInt(productId);

    if ( isNaN(productId) ) {
        return res.status(200).json({
            status: "error",
            title: languageHandler('errors.error', req.session.lang),
            message: languageHandler('errors.unprocessable_data', req.session.lang)
        });
    }

    let isExists = req.session?.cart?.some(item => item.productId === productId);

    if (isExists) {
        const filteredSession = req.session?.cart?.filter(item => {
            return item.productId !== productId
        });

        req.session.cart = filteredSession;

        let cartItems = req.session.cart.map(item => {
            return {
                ...item,
                quantity: parseInt(item.quantity)
            }
        });

        let totalPrice = cartItems.reduce((total, product) => product.quantity * product.price + total, 0);

        return res.status(200).json({
            status: "success",
            title: languageHandler('general.process_success', req.session.lang),
            totalCount: req.session.cart.length,
            totalPrice: numberWithCommas(totalPrice),
            isEmpty: req.session.cart.length == 0
        });
    }

    else if ( !isExists ) {
        return res.status(200).json({
            status: "error",
            title: languageHandler('errors.error', req.session.lang),
            message: languageHandler('errors.common_error', req.session.lang)
        });
    }
}

const addCartItem = (req, res) => {
    let { cartItem } = req.body;
    const lang = req.session.lang;
    var cart = req.session.cart ?? [];

    if ( !cartItem.productId || !cartItem.quantity )
    {
        return res.status(200).json({
            status: 'error',
            title: languageHandler('errors.error', lang),
            message: languageHandler('errors.unprocessable_data', lang)
        });
    }

    cartItem.productId = parseInt(cartItem.productId);
    cartItem.quantity = parseInt(cartItem.quantity);

    if ( isNaN(cartItem.productId) || isNaN(cartItem.quantity) ) {
        return res.status(200).json({
            status: 'error',
            title: languageHandler('errors.error', lang),
            message: languageHandler('errors.unprocessable_data', lang)
        });
    }

    if ( cart.length > 0 ) {
        let isAlreadyInCart = cart?.some(item => item.productId === cartItem.productId);

        if ( isAlreadyInCart ) {
            return res.status(200).json({
                status: 'error',
                title: languageHandler('general.information', lang),
                message: languageHandler('orders.already_added', lang)
            });
        }
    }

    const cartQuery = "SELECT id, name, price, image_thumbnail, discount_value, is_active, is_available, max_order_count FROM products WHERE id = ?";

    db.query(cartQuery, cartItem.productId, (err, data) => {
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

        else if (data.length > 0) {
            // Check if this product is orderable
            let isAvailableEachProduct = data[0].is_active !== 0 && data[0].is_available !== 0;

            if ( !isAvailableEachProduct ) {
                return res.status(200).json({
                    status: "error",
                    title: languageHandler('errors.error', lang),
                    message: languageHandler('errors.wrong_data', lang)
                });
            }

            // Check if quantity is bigger than the max orderable quantity
            if ( cartItem.quantity > data[0].max_order_count ) {
                return res.status(200).json({
                    status: "error",
                    title: languageHandler('errors.error', lang),
                    message: languageHandler('errors.wrong_data', lang)
                });
            }

            let resultItem = {
                productId: data[0].id,
                productName: getValueByLanguage(data[0].name, lang),
                maxQuantity: data[0].max_order_count,
                quantity: cartItem.quantity,
                price: data[0].discount_value ? data[0].discount_value : data[0].price,
                image: imagePathConverter(data[0].image_thumbnail, "products") ?? null
            };

            cart.push(resultItem);

            let totalPrice = cart.reduce((total, product) => total + (product.quantity * product.price), 0);
            let totalCount = cart.length;
            req.session.cart = cart;

            let formattedCart = req.session.cart.map(item => {
                return { ...item, price: numberWithCommas(item.price) }
            });

            if (req.session.cart.length > 1) {
                return res.status(200).json({
                    status: 'success',
                    title: languageHandler('general.process_success', lang),
                    content: languageHandler('orders.added_to_cart', lang),
                    totalPrice: numberWithCommas(totalPrice),
                    totalCount: totalCount,
                    results: formattedCart,
                    current_locale: lang,
                    remove_text: languageHandler('general.remove', lang)
                });
            }

            else if (req.session.cart.length == 1) {
                return res.status(200).json({
                    status: 'success',
                    title: languageHandler('general.process_success', lang),
                    content: languageHandler('orders.added_to_cart', lang),
                    totalPrice: numberWithCommas(totalPrice),
                    totalCount: totalCount,
                    results: formattedCart,
                    current_locale: lang,
                    remove_text: languageHandler('general.remove', lang),
                    ordersCartCountText: languageHandler('orders.cart_count', lang),
                    orderPageText: languageHandler('orders.order', lang),
                    totalPriceText: languageHandler('orders.total_price', lang)
                });
            }
        }
    });
}

const updateCartItem = (req, res) => {
    let { productId } = req.body;
    let { quantity } = req.body;
    const lang = req.session.lang;

    if (!quantity || !productId) {
        return res.status(200).json({
            status: "error",
            title: languageHandler('errors.error', lang),
            message: languageHandler('errors.unprocessable_data', lang)
        });
    }

    quantity = parseInt(quantity);
    productId = parseInt(productId);

    if ( isNaN(quantity) || isNaN(productId) ) {
        return res.status(200).json({
            status: "error",
            title: languageHandler('errors.error', lang),
            message: languageHandler('errors.has_to_be_number', lang)
        });
    }

    // Get max orderable quantity
    const maxQuantityEnabled = req.session?.cart?.find(item => item.productId === productId).maxQuantity;

    // Get product index with this ID from session
    const objIndex = req.session?.cart?.findIndex(item => item.productId === productId);

    // Set product quantity
    req.session.cart[objIndex].quantity = quantity > maxQuantityEnabled ? maxQuantityEnabled : parseInt(quantity);

    // Parse each qauntity value into integer
    req.session.cart = req.session.cart.map(item => {
        return { ...item, quantity: parseInt(item.quantity) }
    });

    // Calculate total price
    let sum = req.session.cart.reduce((total, product) => product.quantity * product.price + total, 0);

    return res.status(200).json({
        status: 'success',
        title: quantity > maxQuantityEnabled ? languageHandler('general.information', lang) : languageHandler('general.process_success', lang),
        message: quantity > maxQuantityEnabled ? languageHandler('validations.max_quantity', lang, maxQuantityEnabled) : languageHandler('validations.cart_updated', lang),
        newValue: quantity > maxQuantityEnabled ?  maxQuantityEnabled : quantity,
        totalPrice: numberWithCommas(sum)
    });
}

module.exports = { deleteCartItem, addCartItem, updateCartItem };
