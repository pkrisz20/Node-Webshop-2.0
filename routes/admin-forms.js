const express = require("express");
const adminFormsRouter = express.Router();
const checkAuthentication = require('../middleware/checkAuthentication');
const AdminProductController = require("../controllers/admin/AdminProductController");
const AdminBlogsController = require("../controllers/admin/AdminBlogsController");
const WebshopCategoryController = require("../controllers/admin/WebshopCategoryController");
const AdminStaticContentsController = require("../controllers/admin/AdminStaticContentsController");
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

adminFormsRouter.route("/category/new")
    .get(checkAuthentication, WebshopCategoryController.getNewCategoryPage);

adminFormsRouter.route("/category/new/handle")
    .post(checkAuthentication, WebshopCategoryController.addNewCategory);

adminFormsRouter.route("/category/edit/:categoryId")
    .get(checkAuthentication, WebshopCategoryController.getCategoryEditPage);

adminFormsRouter.route("/category/edit/handle/:categoryId")
    .post(checkAuthentication, WebshopCategoryController.handleEditCategory);

adminFormsRouter.route("/faq/new")
    .get(checkAuthentication, AdminStaticContentsController.getNewFAQPage);

adminFormsRouter.route("/faq/new/handle")
    .post(checkAuthentication, AdminStaticContentsController.handleFAQUpload);

adminFormsRouter.route("/faq/edit/:faqId")
    .get(checkAuthentication, AdminStaticContentsController.getFAQEditPage);

adminFormsRouter.route("/faq/edit/handle/:faqId")
    .post(checkAuthentication, AdminStaticContentsController.handleEditFAQ);

module.exports = adminFormsRouter;
