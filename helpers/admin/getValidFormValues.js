const { db } = require('../../config/db-connection');

function getValidFormValues ( databaseTable, databaseID ) {

    const selectEachFormData = `SELECT * FROM ${ databaseTable } WHERE id = ?`;

    db.query(selectEachFormData, databaseID, (err, formValues) => {
        if (err) {
            console.log(err);
            return response.status(200).json({ status: 'error' });
        }

        // If there is already some image data in the database
        else if (formValues.length > 0) {

        }
    });
}

module.exports = { getValidFormValues };
