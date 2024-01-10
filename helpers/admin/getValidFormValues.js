const { db } = require('../../config/db-connection');

function getValidFormValues (databaseTable, databaseID, callback) {
    var selectEachFormData = `SELECT * FROM ${ databaseTable }`;

    if ( databaseID != null ) {
        selectEachFormData += ' WHERE id = ?';
        return db.query(selectEachFormData, databaseID, callback);
    }

    return db.query(selectEachFormData, callback);
}

module.exports = getValidFormValues;
