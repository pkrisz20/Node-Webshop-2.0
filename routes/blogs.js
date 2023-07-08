const express = require("express");
const blogsRouter = express.Router();
const BlogsController = require("../controllers/BlogsController");
const { getCartItems } = require("../helpers/getCartItems");
// const validationMiddleware = require("../middleware/validationMiddleware");
// const commentsSchema = require("../validations/commentValidation");
// const recaptchaValidation = require("../validations/recaptchaValidation");

blogsRouter.route("/blogs")
    .get(getCartItems, BlogsController.getAllBlogs);

blogsRouter.route("/blog/:slug")
    .get(getCartItems, BlogsController.getBlogDetails);

// blogsRouter.route("/blog/comments")
//     .post(BlogsController.getBlogsComments);

// blogsRouter.route("/blog/comment/add")
//     .put(validationMiddleware(commentsSchema), recaptchaValidation, BlogsController.handleBlogComment);

module.exports = blogsRouter;
