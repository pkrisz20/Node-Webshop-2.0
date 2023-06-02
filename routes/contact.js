const express = require("express");
const contactRouter = express.Router();
const ContactController = require("../controllers/ContactController");
const validationMiddleware = require("../middleware/validationMiddleware");
const contactSchema = require("../validations/contactValidation");
const recaptchaValidation = require("../validations/recaptchaValidation");

contactRouter.route("/contact")
    .post(validationMiddleware(contactSchema), recaptchaValidation, ContactController.handleContactMessage);

module.exports = contactRouter;
