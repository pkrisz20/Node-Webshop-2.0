const express = require("express");
const contactRouter = express.Router();
const { getCartItems } = require("../helpers/getCartItems");
const ContactController = require("../controllers/ContactController");
// const recaptchaValidation = require("../validations/recaptchaValidation");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");
const selectStaticContents = require("../middleware/selectStaticContents");
const filterActiveWishlistItems = require('../middleware/filterActiveWishlistItems');
const checkSlug = require('../middleware/checkSlug');

contactRouter.route("/")
    .get(checkSlug('contact'), getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, ContactController.getContactPage);

module.exports = contactRouter;
