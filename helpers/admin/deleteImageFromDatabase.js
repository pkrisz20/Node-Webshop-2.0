const { db } = require('../../config/db-connection');
const languageHandler = require('../../helpers/languageHandler');
const { logEvents } = require('../../middleware/logEvents');

function deleteImageFromDatabase ( response, file, databaseTable, columnId, fileType = 'single' ) {

    if ( fileType !== 'single' && fileType !== 'multiple' ) {
        logEvents(`Filetype is not sinle nor multiple. Error at delete image from database function ~8\n-------------------------`, "errors.log");
        return response.status(200).json({ status: 'error' });
    }

    // databaseTable : databaseColumn
    const database_values_single_upload = {
        products: 'image_thumbnail',
        heros: 'image',
        galleries: 'gallery_thumbnail',
        employees: 'image',
        categories: 'image',
        blogs: 'image_thumbnail',
    }

    // databaseTable : databaseColumn
    const database_values_multiple_upload = {
        products: 'images',
        galleries: 'gallery_images',
        blogs: 'images',
    }

    let databaseColumn = null;

    if ( fileType === 'single' ) {

        databaseColumn = database_values_single_upload[databaseTable];
        const sqlSingleImageDelete = `UPDATE ${ databaseTable } SET ${ databaseColumn } = ? WHERE id = ?;`;

        db.query(sqlSingleImageDelete, [null, columnId], (error, result) => {
            if (error) {
                console.log(error);
                logEvents(`Error at delete image from database function ~38\n-------------------------`, "errors.log");
                return response.status(200).json({ status: 'error' });
            }

            if (result) {
                return response.status(200).json({ status: 'success' });
            }
        });
    }

    else if ( fileType === 'multiple' ) {
        databaseColumn = database_values_multiple_upload[databaseTable];

        const sqlSelectQuery = `SELECT ${ databaseColumn } AS 'database_images' FROM ${ databaseTable } WHERE id = ?;`;

        db.query(sqlSelectQuery, columnId, (err, databaseImages) => {
            if (err) {
                logEvents(`Error at delete image from database function ~56\n-------------------------`, "errors.log");
                console.log(err);
                return response.status(200).json({ status: 'error' });
            }

            else if (databaseImages.length === 0) {
                return response.status(200).json({
                    status: 'error',
                    title: languageHandler('errors.error', process.env.ADMIN_LANG),
                    message: languageHandler('errors.file_does_not_exist', process.env.ADMIN_LANG)
                });
            }

            // If there is already some image data in the database
            else if (databaseImages.length > 0) {
                let imagesArray = JSON.parse(databaseImages[0].database_images);
                imagesArray = imagesArray.filter(image => image !== file);
                imagesArray = JSON.stringify(imagesArray);

                const sqlImageUpdate = `UPDATE ${ databaseTable } SET ${ databaseColumn } = ? WHERE id = ?;`;

                db.query(sqlImageUpdate, [imagesArray, columnId], (error, result) => {
                    if (error) {
                        logEvents(`Error at delete image from database function ~79\n-------------------------`, "errors.log");
                        console.log(error);
                        return response.status(200).json({ status: 'error' });
                    }

                    if (result) {
                        return response.status(200).json({ status: 'success' });
                    }
                });
            }
        });
    }
}

module.exports = { deleteImageFromDatabase };
