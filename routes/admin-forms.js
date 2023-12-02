const express = require("express");
const adminFormsRouter = express.Router();
const checkAuthentication = require('../middleware/checkAuthentication');
const AdminProductController = require("../controllers/admin/AdminProductController");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");
const { getValidFormValues } = require("../helpers/admin/getValidFormValues");

adminFormsRouter.route("/products/new")
    .get(checkAuthentication, selectWebshopCategories, AdminProductController.getProductUploadPage);

    // TODO: Finish the controller function here
adminFormsRouter.route("/products/edit/:productId")
    .get(checkAuthentication, getValidFormValues, AdminProductController.getProductEditPage);

module.exports = adminFormsRouter;
