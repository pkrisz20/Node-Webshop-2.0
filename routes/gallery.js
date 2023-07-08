const express = require("express");
const galleryRouter = express.Router();
const GalleryController = require("../controllers/GalleryController");
const { getCartItems } = require("../helpers/getCartItems");

galleryRouter.route("/gallery")
    .get(getCartItems, GalleryController.getAllGallery);

galleryRouter.route("/gallery/:slug")
    .get(getCartItems, GalleryController.getGalleryDetails);

module.exports = galleryRouter;
