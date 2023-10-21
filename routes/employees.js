const express = require("express");
const employeesRouter = express.Router();
const EmployeesController = require("../controllers/EmployeesController");
const { getCartItems } = require("../helpers/getCartItems");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");

employeesRouter.route("/about")
    .get(getConfigFromDb, selectWebshopCategories, getCartItems, EmployeesController.getEmployees);

module.exports = employeesRouter;
