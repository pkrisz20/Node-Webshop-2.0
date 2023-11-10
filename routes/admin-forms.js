const express = require("express");
const adminFormsRouter = express.Router();
const checkAuthentication = require('../middleware/checkAuthentication');
// const AdminController = require("../controllers/admin/AdminController");
// const AdminOrdersController = require("../controllers/admin/AdminOrdersController");
// const SliderController = require("../controllers/admin/SliderController");
// const webshopCategoryController = require("../controllers/admin/WebshopCategoryController");
const AdminProductController = require("../controllers/admin/AdminProductController");
// const AdminGalleryController = require("../controllers/admin/AdminGalleryController");
// const AdminContactController = require("../controllers/admin/AdminContactController");
// const AdminStaticContentsController = require("../controllers/admin/AdminStaticContentsController");
// const AdminBlogsController = require("../controllers/admin/AdminBlogsController");
// const StatisticsController = require("../controllers/admin/StatisticsController");
// const recaptchaValidation = require("../validations/recaptchaValidation");

adminFormsRouter.route("/products/new")
    .get(checkAuthentication, AdminProductController.getProductUploadPage);

module.exports = adminFormsRouter;
