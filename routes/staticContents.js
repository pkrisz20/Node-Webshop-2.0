const express = require("express");
const staticContentsRouter = express.Router();
const StaticContentsController = require("../controllers/StaticContentsController");
const { getCartItems } = require("../helpers/getCartItems");
// const recaptchaValidation = require("../validations/recaptchaValidation");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");
const selectStaticContents = require("../middleware/selectStaticContents");
const filterActiveWishlistItems = require('../middleware/filterActiveWishlistItems');
const checkSlug = require("../middleware/checkSlug");

staticContentsRouter.route("/:lang/:slug")
    .get(checkSlug('slugs.faq'), getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, StaticContentsController.getFAQ);

// staticContentsRouter.route("/gdpr")
//     .get(getConfigFromDb, selectWebshopCategories, getCartItems, filterActiveWishlistItems, StaticContentsController.getGDPR);

staticContentsRouter.route("/:lang/:slug/:routeName")
    .get(checkSlug('slugs.content'), getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, StaticContentsController.getStaticPage);

module.exports = staticContentsRouter;
