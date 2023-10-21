const express = require("express");
const galleryRouter = express.Router();
const GalleryController = require("../controllers/GalleryController");
const { getCartItems } = require("../helpers/getCartItems");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");

galleryRouter.route("/gallery")
    .get(getConfigFromDb, selectWebshopCategories, getCartItems, GalleryController.getAllGallery);

galleryRouter.route("/gallery/:slug")
    .get(getConfigFromDb, selectWebshopCategories, getCartItems, GalleryController.getGalleryDetails);

module.exports = galleryRouter;
