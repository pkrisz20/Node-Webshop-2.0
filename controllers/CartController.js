const languageHandler = require("../helpers/languageHandler");
const { db } = require("../config/db-config");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const { numberWithCommas } = require('../helpers/globalFunctions');

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
    const lang = req.session.lang;
    var cart = req.session.cart ?? [];

    if (
            !cartItem.productId
            || !cartItem.quantity
        )
    {
        return res.status(400).json({ status: 'error', title: languageHandler('errors.error'), message: languageHandler('errors.unprocessable_data') });
    }

    const cartQuery = "SELECT id, name, price, image_thumbnail, discount_value, is_active, is_available, max_order_count FROM products WHERE id = ?";

    db.query(cartQuery, cartItem.productId, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).render("500", { current_locale: req.session.lang });
        }

        else if (data.length > 0) {
            // Check if this product is orderable
            let isAvailableEachProduct = data[0].is_active !== 0 && data[0].is_available !== 0;

            if ( !isAvailableEachProduct ) {
                return res.status(400).json({ status: "error", title: languageHandler('errors.error'), message: languageHandler('errors.wrong_data') });
            }

            // Check if quantity is bigger than the max orderable quantity
            if ( cartItem.quantity > data[0].max_order_count ) {
                return res.status(400).json({ status: "error", title: languageHandler('errors.error'), message: languageHandler('errors.wrong_data') });
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

module.exports = { deleteCartItem, addCartItem, updateCartItem };
