const express = require("express");
const staticContentsRouter = express.Router();
const StaticContentsController = require("../controllers/StaticContentsController");

staticContentsRouter.route("/static/faq")
    .post(StaticContentsController.getFAQ);

module.exports = staticContentsRouter;
