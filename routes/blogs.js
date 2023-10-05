const express = require("express");
const blogsRouter = express.Router();
const BlogsController = require("../controllers/BlogsController");
const { getCartItems } = require("../helpers/getCartItems");
const validationMiddleware = require("../middleware/validationMiddleware");
const commentsSchema = require("../validations/commentValidation");
const recaptchaValidation = require("../validations/recaptchaValidation");
const getConfigFromDb = require("../helpers/getConfigFromDb");

blogsRouter.route("/blogs")
    .get(getConfigFromDb, getCartItems, BlogsController.getAllBlogs);

blogsRouter.route("/blog/:slug")
    .get(getConfigFromDb, getCartItems, BlogsController.getBlogDetails);

blogsRouter.route("/blog/comment/:itemId")
    .post(validationMiddleware(commentsSchema), recaptchaValidation, BlogsController.handleBlogComment);

module.exports = blogsRouter;
