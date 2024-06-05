const { db } = require("../config/db-connection");
const languageHandler = require("../helpers/languageHandler");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const errorHandler = require("../middleware/errorHandler");
const { getSlug } = require("./admin/slugHelper");

const getCartItems = (req, res, next) => {
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    var cartProductIds = [];
    let cartItems = req.session.cart ?? [];
    let showPopupCartInformation = false;

    cartProductIds = cartItems?.map(item => {
        return item.productId;
    });

    if ( cartProductIds.length > 0 ) {

        let countParams = Array(cartProductIds.length).fill("?").join(",");

        db.query(`SELECT id, name, slug, price, image_thumbnail, discount_value, max_order_count, is_available, is_active FROM products WHERE id IN (${ countParams })`, [...cartProductIds], (err, result) => {
            if (err) {
                return errorHandler(err, req, res, "getCartItems", 24);
            }

            else if (result.length > 0) {

                cartItems?.forEach(cartItem => {

                    result.forEach(databaseItem => {

                        if (cartItem.productId === databaseItem.id) {
                            cartItem.productName = getValueByLanguage(databaseItem.name, lang),
                            cartItem.slug = getSlug(databaseItem.slug, lang),
                            cartItem.maxQuantity = parseInt(databaseItem.max_order_count),
                            cartItem.price = databaseItem.discount_value != null ? parseInt(databaseItem.discount_value) : parseInt(databaseItem.price),
                            cartItem.image = imagePathConverter(databaseItem.image_thumbnail, "products"),
                            cartItem.is_available = parseInt(databaseItem.is_available),
                            cartItem.is_active = parseInt(databaseItem.is_active)
                        }
                    });
                });

                // Filter the not available products from cart by fresh database data
                var isThereAnyInactiveProduct = cartItems?.some(cartItem => cartItem.is_available !== 1 || cartItem.is_active !== 1);

                if (isThereAnyInactiveProduct) {
                    cartItems = cartItems?.filter(item => item.is_available !== 0);
                    cartItems = cartItems?.filter(item => item.is_active !== 0);
                    showPopupCartInformation = true;
                }

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
                req.session.showPopupCartInformation = showPopupCartInformation ?? false;
                return next();
            }
        });
    }

    else if ( cartProductIds.length == 0 ) {
        req.session.cart = [];
        req.session.totalPrice = 0;
        req.session.totalCount = 0;
        req.session.showPopupCartInformation = false;
        return next();
    }
}

const getCartListItemsHTML = (cartItems, currentLang) => {
    var cartHTML = "";

    cartItems.forEach(item => {
        cartHTML += `
        <li class="cart-container-list-item js-cart-item">
            <div class="cart-product">
                <div class="cart-product-image">
                    <picture>
                        <source srcset="${ item.image || '' }">
                        <img
                            class="cart-product-img"
                            alt="${ item.productName }"
                            loading="lazy"
                            src="images/no-picture.jpg"
                            onerror="this.onerror = null;this.parentNode.children[0].srcset = this.src;"
                        />
                    </picture>
                </div>

                <div class="cart-product-desc">
                    <h5 class="cart-product-desc_name">${ item.productName }</h5>

                    <div class="quantities">
                        <div class="quantities-container js-quantities">
                            <button type="button" class="quantities-btn js-quantity-btn minus"><i class="fas fa-minus"></i></button>
                            <input class="quantities-input js-product-quantity" data-id="${ item.productId }" type="number" value="${ item.quantity }" min="1" max="${ item.maxQuantity }" />
                            <button type="button" class="quantities-btn js-quantity-btn plus"><i class="fas fa-plus"></i></button>
                        </div>

                        <small class="quantities-price"><i class="fas fa-times"></i> <span>${ item.price } RSD</span></small>
                    </div>

                    <div class="functions">
                        <a href="/${ currentLang }/` + languageHandler('slugs.product', currentLang) + `/${ item.slug }/${ item.productId }" class="functions_details" aria-label="Link to product details"><i class="fas fa-info-circle"></i></a>
                        <button type="button" value="${ languageHandler('general.remove', currentLang) }" data-id="${ item.productId }" class="functions_remove js-remove-cart"><i class="fas fa-times"></i></button>
                    </div>
                </div>
            </div>
        </li>`;
    });

    return cartHTML ?? "";
}

const generateCartItemsHTML = (cartItems, currentLang, totalCount, totalPrice) => {

    var cartHTMLContent = `
        <h5 class="cart-counter">${ languageHandler('orders.cart_count', currentLang) }: <span class="js-cart-counter">${ totalCount }</span></h5>
            <div class="cart-container">
                <div class="cart-container-top">
                    <a href="/${ currentLang }/` + languageHandler('slugs.cart', currentLang) + `" aria-label="Navigation link to the orders page" class="cart-container-top_ordering">${ languageHandler('orders.order', currentLang) }</a>
                    <strong class="cart-container-top_total">${ languageHandler('orders.total_price', currentLang) }: <span class="js-total-price">${ totalPrice }</span><small>RSD</small></strong>
                </div>

                <ul class="cart-container-list js-cart-list">
                    <li class="cart-container-list-item js-cart-item">
                        <div class="cart-product">
                            <div class="cart-product-image">
                                <picture>
                                    <source srcset="${ cartItems[0].image || '' }">
                                    <img
                                        class="cart-product-img"
                                        alt="${ cartItems[0].productName }"
                                        loading="lazy"
                                        src="images/no-picture.jpg"
                                        onerror="this.onerror = null;this.parentNode.children[0].srcset = this.src;"
                                    />
                                </picture>
                            </div>

                            <div class="cart-product-desc">
                                <h5 class="cart-product-desc_name">${ cartItems[0].productName }</h5>

                                <div class="quantities">
                                    <div class="quantities-container js-quantities">
                                        <button type="button" class="quantities-btn js-quantity-btn minus"><i class="fas fa-minus"></i></button>
                                        <input class="quantities-input js-product-quantity" data-id="${ cartItems[0].productId }" type="number" value="${ cartItems[0].quantity }" min="1" max="${ cartItems[0].maxQuantity }" />
                                        <button type="button" class="quantities-btn js-quantity-btn plus"><i class="fas fa-plus"></i></button>
                                    </div>

                                    <small class="quantities-price"><i class="fas fa-times"></i> <span>${ cartItems[0].price } RSD</span></small>
                                </div>

                                <div class="functions">
                                    <a href="/${ currentLang }/` + languageHandler('slugs.product', currentLang) + `/${ cartItems[0].slug }/${ cartItems[0].productId }" class="functions_details" aria-label="Link to product details"><i class="fas fa-info-circle"></i></a>
                                    <button type="button" value="${ languageHandler('general.remove', currentLang) }" data-id="${ cartItems[0].productId }" class="functions_remove js-remove-cart"><i class="fas fa-times"></i></button>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>`;

    return cartHTMLContent ?? "";
}

module.exports = { getCartItems, generateCartItemsHTML, getCartListItemsHTML };
