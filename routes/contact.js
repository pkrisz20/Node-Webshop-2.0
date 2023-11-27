const express = require("express");
const contactRouter = express.Router();
const ContactController = require("../controllers/ContactController");
const validationMiddleware = require("../middleware/validationMiddleware");
const contactSchema = require("../validations/contactValidation");
const recaptchaValidation = require("../validations/recaptchaValidation");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");
const filterActiveWishlistItems = require('../middleware/filterActiveWishlistItems');

contactRouter.route("/contact")
    .get(getConfigFromDb, selectWebshopCategories, filterActiveWishlistItems, ContactController.getContactPage);

contactRouter.route("/contact/handle")
    .post(validationMiddleware(contactSchema), recaptchaValidation, ContactController.handleContactMessage);

module.exports = contactRouter;
