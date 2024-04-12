const express = require("express");
const adminRouter = express.Router();
const loginRateLimit = require('../config/rate-limit');
const checkAuthentication = require('../middleware/checkAuthentication');
const { handleAdminLogin, handleAdminLogout } = require("../controllers/admin/AuthController");
const AdminController = require("../controllers/admin/AdminController");
const AdminOrdersController = require("../controllers/admin/AdminOrdersController");
const SliderController = require("../controllers/admin/SliderController");
const webshopCategoryController = require("../controllers/admin/WebshopCategoryController");
const AdminProductController = require("../controllers/admin/AdminProductController");
const AdminGalleryController = require("../controllers/admin/AdminGalleryController");
const AdminContactController = require("../controllers/admin/AdminContactController");
const AdminStaticContentsController = require("../controllers/admin/AdminStaticContentsController");
const AdminBlogsController = require("../controllers/admin/AdminBlogsController");
const StatisticsController = require("../controllers/admin/StatisticsController");

adminRouter.route("/")
    .get(AdminController.getLoginPage);

adminRouter.route("/login")
    .post(loginRateLimit, handleAdminLogin);

adminRouter.route("/logout")
    .get(checkAuthentication, handleAdminLogout);

adminRouter.route("/dashboard")
    .get(checkAuthentication, AdminController.getDashboard);

adminRouter.route("/single-upload/:folder")
    .post(checkAuthentication, AdminController.uploadImageFiles);

adminRouter.route("/multiple-upload/:folder")
    .post(checkAuthentication, AdminController.uploadMultipleImages);

adminRouter.route("/delete-image/:folder")
    .post(checkAuthentication, AdminController.deleteImageFile);

adminRouter.route("/statistics")
    .get(checkAuthentication, StatisticsController.getStatistics);

adminRouter.route("/sliders/list")
    .get(checkAuthentication, SliderController.getSlidersListPage);

adminRouter.route("/category/list")
    .get(checkAuthentication, webshopCategoryController.getWebshopCategoryList);

adminRouter.route("/category/delete/:categoryId")
    .get(checkAuthentication, webshopCategoryController.deleteWebshopCategory);

adminRouter.route("/products/list")
    .get(checkAuthentication, AdminProductController.getWebshopProductList);

adminRouter.route("/products/comments/list")
    .get(checkAuthentication, AdminProductController.getProductCommentsList);

adminRouter.route("/products/comments/verify/:commentId")
    .post(checkAuthentication, AdminProductController.updateCommentVerficationBadge);

adminRouter.route("/products/comments/delete/:commentId")
    .get(checkAuthentication, AdminProductController.deleteProductComment);

adminRouter.route("/gallery/list")
    .get(checkAuthentication, AdminGalleryController.getGalleryList);

adminRouter.route("/gallery/delete/:galleryId")
    .get(checkAuthentication, AdminGalleryController.deleteGallery);

adminRouter.route("/blogs/list")
    .get(checkAuthentication, AdminBlogsController.getBlogsList);

adminRouter.route("/blogs/comments/list")
    .get(checkAuthentication, AdminBlogsController.getBlogsCommentsList);

adminRouter.route("/blogs/comments/delete/:commentId")
    .get(checkAuthentication, AdminBlogsController.deleteArticleComment);

adminRouter.route("/events/list")
    .get(checkAuthentication, AdminBlogsController.getEventsList);

adminRouter.route("/messages/list")
    .get(checkAuthentication, AdminContactController.getIncomingMessagesList);

adminRouter.route("/messages/delete/:messageId")
    .get(checkAuthentication, AdminContactController.deleteMessageItem);

adminRouter.route("/messages/details/:messageId")
    .get(checkAuthentication, AdminContactController.getMessageDetails);

adminRouter.route("/faq/list")
    .get(checkAuthentication, AdminStaticContentsController.getFAQListPage);

adminRouter.route("/faq/delete/:faqId")
    .get(checkAuthentication, AdminStaticContentsController.deleteFAQItem);

adminRouter.route("/orders/list")
    .get(checkAuthentication, AdminOrdersController.getOrdersListPage);

adminRouter.route("/order/delete/:orderId")
    .get(checkAuthentication, AdminOrdersController.deleteOrder);

adminRouter.route("/order/get-info/:orderId")
    .get(checkAuthentication, AdminOrdersController.getOrderDetails);

adminRouter.route("/order/change-status/:orderId")
    .post(checkAuthentication, AdminOrdersController.changeOrderStatus);

adminRouter.route("/static-contents/list")
    .get(checkAuthentication, AdminStaticContentsController.getStaticListPage);

module.exports = adminRouter;
