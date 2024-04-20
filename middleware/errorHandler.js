const { logEvents } = require("./logEvents");
const { showServerErrorPage } = require("../helpers/showErrorPages");

const errorHandler = (err, req, res, fileName = null, errorRow = null, next) => {
    if (fileName != null && errorRow != null) {
        logEvents(`${err.name}: ${err.message}\nFile: ${fileName} Row: ${errorRow}\n-------------------------`, "errors.log");
    }
    else {
        logEvents(`${err.name}: ${err.message}\n-------------------------`, "errors.log");
    }

    return showServerErrorPage(req, res);
}

module.exports = errorHandler;
