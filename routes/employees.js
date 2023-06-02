const express = require("express");
const employeesRouter = express.Router();
const EmployeesController = require("../controllers/EmployeesController");

employeesRouter.route("/employees")
    .post(EmployeesController.getEmployees);

module.exports = employeesRouter;
