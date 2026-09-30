const { Product } = require("../models");
const { Sequelize } = require('sequelize');
const errorHandler = require("./errorHandler");

async function filterActiveWishlistItems (req, res, next) {
    let wishlist = req?.session?.wishlist ?? [];

    if (!Array.isArray(wishlist) || wishlist.length === 0) {
        res.locals.wishlistTotalNumber = 0;
        return next();
    }

    if (wishlist && wishlist.length > 0) {
        try {
            let products = await Product.findAll({
                where: {
                    id: {
                        [Sequelize.Op.in]: wishlist,
                    },
                    is_active: 1,
                },
                attributes: ['id'],
            });

            if (products.length === 0) {
                res.locals.wishlistTotalNumber = 0;
                return next();
            }
            else if (products.length > 0) {
                wishlist = products.map(item => item.id);
                res.locals.wishlistTotalNumber = wishlist.length;
                return next();
            }
        }
        catch (err) {
            return errorHandler(err, req, res, 'filterActiveWishlistItems', 5);
        }
    }
}

module.exports = filterActiveWishlistItems;
