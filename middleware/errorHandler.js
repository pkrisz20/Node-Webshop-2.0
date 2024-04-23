const { logEvents } = require("./logEvents");
const moment = require('moment');
const { showServerErrorPage } = require("../helpers/showErrorPages");
const db = require("../config/db-connection");

const errorHandler = (err, req, res, fileName = null, errorRow = null, next) => {
    if (fileName != null && errorRow != null) {
        logEvents(`${err.name}: ${err.message}\nFile: ${fileName} || Row: ~${errorRow}\n-------------------------`, "errors.log");
    }
    else {
        logEvents(`${err.name}: ${err.message}\n-------------------------`, "errors.log");
    }

    db.query("INSERT INTO activity_log (log_name, log_description, log_date) VALUES(?, ?, ?)",
    [err.name, `${err.message}\nFile: ${fileName} || Row: ~${errorRow}`, moment(new Date()).format("YYYY-MM-DD HH:mm:ss")],
    (err, result) => {
        return showServerErrorPage(req, res);
    });
}

module.exports = errorHandler;
