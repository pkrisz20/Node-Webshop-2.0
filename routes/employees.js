const express = require("express");
const employeesRouter = express.Router();
const EmployeesController = require("../controllers/EmployeesController");
const { getCartItems } = require("../helpers/getCartItems");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");
const selectStaticContents = require("../middleware/selectStaticContents");
const filterActiveWishlistItems = require('../middleware/filterActiveWishlistItems');
const checkSlug = require('../middleware/checkSlug');

employeesRouter.route("/")
    .get(checkSlug('about_us'), getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, EmployeesController.getEmployees);

module.exports = employeesRouter;
