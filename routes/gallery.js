const express = require("express");
const galleryRouter = express.Router();
const GalleryController = require("../controllers/GalleryController");
const { getCartItems } = require("../helpers/getCartItems");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");
const selectStaticContents = require("../middleware/selectStaticContents");
const filterActiveWishlistItems = require('../middleware/filterActiveWishlistItems');

galleryRouter.route("/gallery")
    .get(getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, GalleryController.getAllGallery);

galleryRouter.route("/gallery/:slug")
    .get(getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, GalleryController.getGalleryDetails);

module.exports = galleryRouter;
