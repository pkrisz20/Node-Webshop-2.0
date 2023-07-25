const express = require("express");
const staticContentsRouter = express.Router();
const StaticContentsController = require("../controllers/StaticContentsController");
const { getCartItems } = require("../helpers/getCartItems");
const recaptchaValidation = require("../validations/recaptchaValidation");

staticContentsRouter.route("/faq")
    .get(getCartItems, StaticContentsController.getFAQ);

staticContentsRouter.route("/gdpr")
    .get(getCartItems, StaticContentsController.getGDPR);

staticContentsRouter.route("/gdpr/handle")
    .post(recaptchaValidation, StaticContentsController.handleGDPR);

module.exports = staticContentsRouter;
