const express = require("express");
const employeesRouter = express.Router();
const EmployeesController = require("../controllers/EmployeesController");
const { getCartItems } = require("../helpers/getCartItems");
const getConfigFromDb = require("../helpers/getConfigFromDb");

employeesRouter.route("/about")
    .get(getConfigFromDb, getCartItems, EmployeesController.getEmployees);

module.exports = employeesRouter;
