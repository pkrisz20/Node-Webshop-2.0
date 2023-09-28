const express = require("express");
const adminRouter = express.Router();
const loginRateLimit = require('../config/rate-limit');
const checkAuthentication = require('../middleware/checkAuthentication');
const { handleAdminLogin, handleAdminLogout } = require("../controllers/admin/AuthController");
const AdminController = require("../controllers/admin/AdminController");
const AdminOrdersController = require("../controllers/admin/OrdersController");
const SliderController = require("../controllers/admin/SliderController");
// const recaptchaValidation = require("../validations/recaptchaValidation");

adminRouter.route("/")
    .get(AdminController.getLoginPage);

adminRouter.route("/login")
    .post(loginRateLimit, handleAdminLogin);

adminRouter.route("/dashboard")
    .get(checkAuthentication, AdminController.getDashboard);

adminRouter.route("/sliders/list")
    .get(checkAuthentication, SliderController.getSlidersListPage);

adminRouter.route("/logout")
    .post(checkAuthentication, handleAdminLogout);

adminRouter.route("/order/delete/:orderId")
    .post(checkAuthentication, AdminOrdersController.deleteOrder);

module.exports = adminRouter;
