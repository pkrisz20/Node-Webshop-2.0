const express = require("express");
const adminRouter = express.Router();
const loginRateLimit = require('../config/rate-limit');
const checkAuthentication = require('../middleware/checkAuthentication');
const { handleAdminLogin, handleAdminLogout } = require("../controllers/admin/AuthController");
const AdminController = require("../controllers/admin/AdminController");
const AdminOrdersController = require("../controllers/admin/AdminOrdersController");
const SliderController = require("../controllers/admin/SliderController");
const webshopCategoryController = require("../controllers/admin/WebshopCategoryController");
const AdminProductController = require("../controllers/admin/AdminProductController");
const AdminGalleryController = require("../controllers/admin/AdminGalleryController");
const AdminContactController = require("../controllers/admin/AdminContactController");
const AdminStaticContentsController = require("../controllers/admin/AdminStaticContentsController");
const AdminBlogsController = require("../controllers/admin/AdminBlogsController");
// const recaptchaValidation = require("../validations/recaptchaValidation");

adminRouter.route("/")
    .get(AdminController.getLoginPage);

adminRouter.route("/login")
    .post(loginRateLimit, handleAdminLogin);

adminRouter.route("/logout")
    .post(checkAuthentication, handleAdminLogout);

adminRouter.route("/dashboard")
    .get(checkAuthentication, AdminController.getDashboard);

adminRouter.route("/sliders/list")
    .get(checkAuthentication, SliderController.getSlidersListPage);

adminRouter.route("/category/list")
    .get(checkAuthentication, webshopCategoryController.getWebshopCategoryList);

adminRouter.route("/products/list")
    .get(checkAuthentication, AdminProductController.getWebshopProductList);

adminRouter.route("/products/comments/list")
    .get(checkAuthentication, AdminProductController.getProductCommentsList);

adminRouter.route("/gallery/list")
    .get(checkAuthentication, AdminGalleryController.getGalleryList);

adminRouter.route("/blogs/list")
    .get(checkAuthentication, AdminBlogsController.getBlogsList);

adminRouter.route("/messages/list")
    .get(checkAuthentication, AdminContactController.getIncomingMessagesList);

adminRouter.route("/faq/list")
    .get(checkAuthentication, AdminStaticContentsController.getFAQListPage);

adminRouter.route("/orders/list")
    .get(checkAuthentication, AdminOrdersController.getOrdersListPage);

adminRouter.route("/order/delete/:orderId")
    .post(checkAuthentication, AdminOrdersController.deleteOrder);

adminRouter.route("/order/get-info/:orderId")
    .post(checkAuthentication, AdminOrdersController.getOrderDetails);

module.exports = adminRouter;
