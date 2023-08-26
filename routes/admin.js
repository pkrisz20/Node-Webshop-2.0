const express = require("express");
const adminRouter = express.Router();
// const AuthController = require("../controllers/admin/AuthController");
const AdminProductController = require("../controllers/admin/AdminProductController");
// const verifyJWT = require("../middleware/verifyJWT");
// const recaptchaValidation = require("../validations/recaptchaValidation");

adminRouter.route("/")
    .get(AdminProductController.getLoginPage);

module.exports = adminRouter;
