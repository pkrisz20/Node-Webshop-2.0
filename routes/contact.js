const express = require("express");
const contactRouter = express.Router();
const { getCartItems } = require("../helpers/getCartItems");
const ContactController = require("../controllers/ContactController");
const validationMiddleware = require("../middleware/validationMiddleware");
const contactSchema = require("../validations/contactValidation");
// const recaptchaValidation = require("../validations/recaptchaValidation");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");
const selectStaticContents = require("../middleware/selectStaticContents");
const filterActiveWishlistItems = require('../middleware/filterActiveWishlistItems');

contactRouter.route("/contact")
    .get(getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, ContactController.getContactPage);

contactRouter.route("/contact/handle")
    .post(validationMiddleware(contactSchema), ContactController.handleContactMessage);

module.exports = contactRouter;
