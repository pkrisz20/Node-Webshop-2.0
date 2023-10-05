const express = require("express");
const galleryRouter = express.Router();
const GalleryController = require("../controllers/GalleryController");
const { getCartItems } = require("../helpers/getCartItems");
const getConfigFromDb = require("../helpers/getConfigFromDb");

galleryRouter.route("/gallery")
    .get(getConfigFromDb, getCartItems, GalleryController.getAllGallery);

galleryRouter.route("/gallery/:slug")
    .get(getConfigFromDb, getCartItems, GalleryController.getGalleryDetails);

module.exports = galleryRouter;
