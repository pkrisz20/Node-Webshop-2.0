const express = require("express");
const adminRouter = express.Router();
const AuthController = require("../controllers/admin/AuthController");
const AdminProductController = require("../controllers/admin/AdminProductController");
// const verifyJWT = require("../middleware/verifyJWT");
// const recaptchaValidation = require("../validations/recaptchaValidation");

adminRouter.route("/auth")
    .post(AuthController.handleAdminLogin);

adminRouter.route("/logout")
    .get(AuthController.handleAdminLogout);

adminRouter.route("/products")
    .post(AdminProductController.getProducts);

module.exports = adminRouter;
