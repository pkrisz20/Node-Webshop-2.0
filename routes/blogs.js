const express = require("express");
const blogsRouter = express.Router();
const BlogsController = require("../controllers/BlogsController");
const validationMiddleware = require("../middleware/validationMiddleware");
const commentsSchema = require("../validations/commentValidation");
const recaptchaValidation = require("../validations/recaptchaValidation");

blogsRouter.route("/blogs")
    .post(BlogsController.getAllBlogs);

blogsRouter.route("/blogs/:blogId")
    .post(BlogsController.getBlogDetails);

blogsRouter.route("/blog/comments")
    .post(BlogsController.getBlogsComments);

blogsRouter.route("/blog/comment/add")
    .put(validationMiddleware(commentsSchema), recaptchaValidation, BlogsController.handleBlogComment);

module.exports = blogsRouter;
