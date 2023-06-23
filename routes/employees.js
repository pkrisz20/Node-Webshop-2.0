const express = require("express");
const employeesRouter = express.Router();
const EmployeesController = require("../controllers/EmployeesController");

employeesRouter.route("/about")
    .get(EmployeesController.getEmployees);

module.exports = employeesRouter;
