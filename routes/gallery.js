const express = require("express");
const galleryRouter = express.Router();
const GalleryController = require("../controllers/GalleryController");
const { getCartItems } = require("../helpers/getCartItems");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");
const selectStaticContents = require("../middleware/selectStaticContents");
const filterActiveWishlistItems = require('../middleware/filterActiveWishlistItems');
const checkSlug = require("../middleware/checkSlug");

galleryRouter.route("/:lang/:slug")
    .get(checkSlug('slugs.galleries'), getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, GalleryController.getAllGallery);

galleryRouter.route("/:lang/:slug/:slugName/:galleryId")
    .get(checkSlug('slugs.gallery'), getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, GalleryController.getGalleryDetails);

module.exports = galleryRouter;
