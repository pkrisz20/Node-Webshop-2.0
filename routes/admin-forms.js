const express = require("express");
const adminFormsRouter = express.Router();
const checkAuthentication = require('../middleware/checkAuthentication');
const AdminProductController = require("../controllers/admin/AdminProductController");
const AdminBlogsController = require("../controllers/admin/AdminBlogsController");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");

adminFormsRouter.route("/products/new")
    .get(checkAuthentication, selectWebshopCategories, AdminProductController.getProductUploadPage);

adminFormsRouter.route("/products/new/handle")
    .post(checkAuthentication, AdminProductController.handleProductUpload);

adminFormsRouter.route("/products/edit/:productId")
    .get(checkAuthentication, selectWebshopCategories, AdminProductController.getProductEditPage);

adminFormsRouter.route("/products/edit/handle/:productId")
    .post(checkAuthentication, AdminProductController.handleEditProduct);

adminFormsRouter.route("/blogs/new")
    .get(checkAuthentication, AdminBlogsController.getArticleUploadPage);

adminFormsRouter.route("/blogs/new/handle")
    .post(checkAuthentication, AdminBlogsController.handleArticleUpload);

adminFormsRouter.route("/blogs/edit/:articleId")
    .get(checkAuthentication, AdminBlogsController.getArticleEditPage);

adminFormsRouter.route("/blogs/edit/handle/:articleId")
    .post(checkAuthentication, AdminBlogsController.handleEditArticle);

module.exports = adminFormsRouter;
