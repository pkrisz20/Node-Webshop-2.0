const express = require("express");
const adminRouter = express.Router();
// const AuthController = require("../controllers/admin/AuthController");
const AdminController = require("../controllers/admin/AdminController");
// const verifyJWT = require("../middleware/verifyJWT");
// const recaptchaValidation = require("../validations/recaptchaValidation");

adminRouter.route("/")
    .get(AdminController.getLoginPage);

adminRouter.route("/dashboard")
    .get(AdminController.getDashboard);

module.exports = adminRouter;
