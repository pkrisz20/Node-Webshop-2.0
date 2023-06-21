const languageHandler = require("../helpers/languageHandler");

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
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
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
        return res.status(400).json({ status: 'error', message: languageHandler('errors.common_error') });
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

module.exports = { deleteCartItem, addCartItem, updateCartItem };
