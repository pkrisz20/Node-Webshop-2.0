const { db } = require('../../config/db-connection');
const { showServerErrorPage } = require('../../helpers/showErrorPages')

export function getValidFormValues ( request, response, databaseTable, databaseID ) {

    const selectEachFormData = `SELECT * FROM ${ databaseTable } WHERE id = ?`;

    db.query(selectEachFormData, databaseID, (err, formValues) => {
        if (err) {
            console.log(err);
            return showServerErrorPage(request, response);
        }

        // If there is already some image data in the database
        else if (formValues.length > 0) {
            return formValues[0] ?? null;
        }

        else if (formValues.length === 0) {
            return null;
        }
    });
}

module.exports = { getValidFormValues };
