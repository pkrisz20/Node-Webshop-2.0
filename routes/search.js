const express = require("express");
const searchRouter = express.Router();
const SearchController = require("../controllers/SearchController");

searchRouter.route("/search")
    .post(SearchController.handleSearch);

module.exports = searchRouter;
