const express = require("express");
const staticContentsRouter = express.Router();
const StaticContentsController = require("../controllers/StaticContentsController");
const { getCartItems } = require("../helpers/getCartItems");
// const recaptchaValidation = require("../validations/recaptchaValidation");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");
const selectStaticContents = require("../middleware/selectStaticContents");
const filterActiveWishlistItems = require('../middleware/filterActiveWishlistItems');

staticContentsRouter.route("/faq")
    .get(getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, StaticContentsController.getFAQ);

// staticContentsRouter.route("/gdpr")
//     .get(getConfigFromDb, selectWebshopCategories, getCartItems, filterActiveWishlistItems, StaticContentsController.getGDPR);

staticContentsRouter.route("/gdpr/handle")
    .post(StaticContentsController.handleGDPR);

module.exports = staticContentsRouter;
