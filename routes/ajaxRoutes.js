const express = require("express");
const ajaxRouter = express.Router();
const validationMiddleware = require("../middleware/validationMiddleware");
const commentsSchema = require("../validations/commentValidation");
const contactSchema = require("../validations/contactValidation");
const orderSchema = require("../validations/orderValidation");
const StaticContentsController = require("../controllers/StaticContentsController");
const OrdersController = require("../controllers/OrdersController");
const CartController = require("../controllers/CartController");
const ProductController = require("../controllers/ProductController");
const BlogsController = require("../controllers/BlogsController");
const SearchController = require("../controllers/SearchController");
const ContactController = require("../controllers/ContactController");

ajaxRouter.route("/products/search")
    .get(ProductController.ajaxProductFilter);

ajaxRouter.route("/cart/delete")
    .post(CartController.deleteCartItem);

ajaxRouter.route("/cart/add")
    .post(CartController.addCartItem);

ajaxRouter.route("/cart/update")
    .post(CartController.updateCartItem);

ajaxRouter.route("/product/comment/load-more")
    .post(ProductController.ajaxLoadMoreComments);

ajaxRouter.route("/product/comment/:itemId")
    .post(validationMiddleware(commentsSchema), ProductController.handleProductComment);

ajaxRouter.route("/wishlist-handle/:productId")
    .post(ProductController.wishlistHandler);

ajaxRouter.route("/blog/comment/load-more")
    .post(BlogsController.ajaxLoadMoreComments);

ajaxRouter.route("/blog/comment/:itemId")
    .post(validationMiddleware(commentsSchema), BlogsController.handleBlogComment);

ajaxRouter.route("/search")
    .post(SearchController.ajaxSearch);

ajaxRouter.route("/contact/handle")
    .post(validationMiddleware(contactSchema), ContactController.handleContactMessage);

ajaxRouter.route("/order/handle")
    .post(validationMiddleware(orderSchema), OrdersController.createOrder);

ajaxRouter.route("/gdpr/handle")
    .post(StaticContentsController.handleGDPR);

module.exports = ajaxRouter;
