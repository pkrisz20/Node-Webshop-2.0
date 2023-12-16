const express = require("express");
const adminFormsRouter = express.Router();
const checkAuthentication = require('../middleware/checkAuthentication');
const AdminProductController = require("../controllers/admin/AdminProductController");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");

adminFormsRouter.route("/products/new")
    .get(checkAuthentication, selectWebshopCategories, AdminProductController.getProductUploadPage);

adminFormsRouter.route("/products/new/handle")
    .post(checkAuthentication, AdminProductController.handleProductUpload);

adminFormsRouter.route("/products/edit/:productId")
    .get(checkAuthentication, selectWebshopCategories, AdminProductController.getProductEditPage);

adminFormsRouter.route("/products/edit/handle/:productId")
    .post(checkAuthentication, AdminProductController.handleEditProduct);

module.exports = adminFormsRouter;
