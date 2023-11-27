const { db } = require("../config/db-connection");
const { showServerErrorPage } = require("../helpers/showErrorPages");

function filterActiveWishlistItems (req, res, next) {
    let wishlist = req?.session?.wishlist ?? [];
    let countParams = Array(wishlist.length).fill("?").join(",");

    if (wishlist.length > 0) {
        const selectWishlistProducts = `SELECT id FROM products WHERE id IN (${ countParams }) AND is_active = ?`;

        db.query(selectWishlistProducts, [...wishlist, 1], (err, products) => {

            if (err) {
                return showServerErrorPage(req, res);
            }

            else if ( products.length === 0 ) {
                req.wishlistTotalNumber = 0;
                return next();
            }

            else if ( products.length > 0 ) {
                wishlist = products.map(item => item.id);
                req.wishlistTotalNumber = wishlist.length ?? 0;
                return next();
            }
        });
    }

    else {
        req.wishlistTotalNumber = 0;
        return next();
    }
}

module.exports = filterActiveWishlistItems;
