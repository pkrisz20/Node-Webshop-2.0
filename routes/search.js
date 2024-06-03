const express = require("express");
const searchRouter = express.Router();
const SearchController = require("../controllers/SearchController");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");
const selectStaticContents = require("../middleware/selectStaticContents");
const filterActiveWishlistItems = require('../middleware/filterActiveWishlistItems');
const checkSlug = require("../middleware/checkSlug");

searchRouter.route("/:lang/:slug")
    .get(checkSlug('slugs.search'), getConfigFromDb, selectWebshopCategories, selectStaticContents, filterActiveWishlistItems, SearchController.handleSearch);

module.exports = searchRouter;
