const express = require("express");
const homeRouter = express.Router();
const HomePageController = require("../controllers/HomePageController");

homeRouter.route("/")
    .get(HomePageController.getData);

module.exports = homeRouter;
