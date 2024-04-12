const express = require("express");
const blogsRouter = express.Router();
const BlogsController = require("../controllers/BlogsController");
const { getCartItems } = require("../helpers/getCartItems");
const validationMiddleware = require("../middleware/validationMiddleware");
const commentsSchema = require("../validations/commentValidation");
const recaptchaValidation = require("../validations/recaptchaValidation");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");
const selectStaticContents = require("../middleware/selectStaticContents");
const filterActiveWishlistItems = require('../middleware/filterActiveWishlistItems');

blogsRouter.route("/blogs")
    .get(getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, BlogsController.getAllBlogs);

blogsRouter.route("/blog/:slug")
    .get(getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, BlogsController.getBlogDetails);

blogsRouter.route("/blog/comment/load-more")
    .post(BlogsController.ajaxLoadMoreComments);

blogsRouter.route("/blog/comment/:itemId")
    .post(validationMiddleware(commentsSchema), recaptchaValidation, BlogsController.handleBlogComment);

module.exports = blogsRouter;
