const { logEvents } = require("./logEvents");
const { showServerErrorPage } = require("../helpers/showErrorPages");

const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}`, "errors.log");
    console.error(err.stack);
    return showServerErrorPage(req, res);
}

module.exports = errorHandler;
