const express = require("express");
const homeRouter = express.Router();
const HomePageController = require("../controllers/HomePageController");

homeRouter.route("/home/products")
    .post(HomePageController.getFeaturedProducts);

homeRouter.route("/home/blogs")
    .post(HomePageController.getFeaturedBlogs);

homeRouter.route("/home/hero")
    .post(HomePageController.getHeroItems);

homeRouter.route("/home/gallery")
    .post(HomePageController.getFeaturedGalleries);

module.exports = homeRouter;
