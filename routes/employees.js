const express = require("express");
const employeesRouter = express.Router();
const EmployeesController = require("../controllers/EmployeesController");
const { getCartItems } = require("../helpers/getCartItems");

employeesRouter.route("/about")
    .get(getCartItems, EmployeesController.getEmployees);

module.exports = employeesRouter;
