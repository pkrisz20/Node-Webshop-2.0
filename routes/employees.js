const express = require("express");
const employeesRouter = express.Router();
const EmployeesController = require("../controllers/EmployeesController");
const { getCartItems } = require("../helpers/getCartItems");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");
const filterActiveWishlistItems = require('../middleware/filterActiveWishlistItems');

employeesRouter.route("/about")
    .get(getConfigFromDb, selectWebshopCategories, getCartItems, filterActiveWishlistItems, EmployeesController.getEmployees);

module.exports = employeesRouter;
