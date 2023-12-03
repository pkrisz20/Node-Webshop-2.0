const express = require("express");
const adminFormsRouter = express.Router();
const checkAuthentication = require('../middleware/checkAuthentication');
const AdminProductController = require("../controllers/admin/AdminProductController");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");

adminFormsRouter.route("/products/new")
    .get(checkAuthentication, selectWebshopCategories, AdminProductController.getProductUploadPage);

adminFormsRouter.route("/products/edit/:productId")
    .get(checkAuthentication, selectWebshopCategories, AdminProductController.getProductEditPage);

module.exports = adminFormsRouter;
