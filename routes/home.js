const express = require("express");
const homeRouter = express.Router();
const HomePageController = require("../controllers/HomePageController");

homeRouter.route("/")
    .get(HomePageController.getData);

// .get(HomePageController.getData);
// homeRouter.route("/home/blogs")
//     .post(HomePageController.getFeaturedBlogs);

// homeRouter.route("/home/hero")
//     .post(HomePageController.getHeroItems);

// homeRouter.route("/home/gallery")
//     .post(HomePageController.getFeaturedGalleries);

module.exports = homeRouter;
