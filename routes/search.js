const express = require("express");
const searchRouter = express.Router();
const SearchController = require("../controllers/SearchController");
const getConfigFromDb = require("../helpers/getConfigFromDb");

searchRouter.route("/search")
    .get(getConfigFromDb, SearchController.handleSearch);

module.exports = searchRouter;
