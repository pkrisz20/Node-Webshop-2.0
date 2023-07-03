const express = require("express");
const staticContentsRouter = express.Router();
const StaticContentsController = require("../controllers/StaticContentsController");
const { getCartItems } = require("../helpers/getCartItems");

staticContentsRouter.route("/faq")
    .get(getCartItems, StaticContentsController.getFAQ);

module.exports = staticContentsRouter;
