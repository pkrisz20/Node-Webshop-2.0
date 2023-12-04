const { db } = require('../../config/db-connection');

function getValidFormValues (databaseTable, databaseID, callback) {
    var selectEachFormData = `SELECT * FROM ${ databaseTable } WHERE id = ?`;
    return db.query(selectEachFormData, databaseID, callback);
}

module.exports = getValidFormValues;
