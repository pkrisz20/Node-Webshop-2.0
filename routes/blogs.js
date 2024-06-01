const express = require("express");
const blogsRouter = express.Router();
const BlogsController = require("../controllers/BlogsController");
const { getCartItems } = require("../helpers/getCartItems");
// const recaptchaValidation = require("../validations/recaptchaValidation");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");
const selectStaticContents = require("../middleware/selectStaticContents");
const filterActiveWishlistItems = require('../middleware/filterActiveWishlistItems');

blogsRouter.route("/blogs")
    .get(getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, BlogsController.getAllBlogs);

blogsRouter.route("/blog/:slug/:blodId")
    .get(getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, BlogsController.getBlogDetails);

module.exports = blogsRouter;
