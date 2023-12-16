// Save the path of the images into database as json array format or as string (multiple / single)
// The db table name and the files/folder name are same
// Every table needs to has the id column
// @return bool
const { db } = require('../../config/db-connection');

function saveImageToDatabase ( response, files, databaseTable, columnId, isThumbnailImage = false ) {

    if ( files.length === 0 ) {
        return response.status(200).json({
            status: 'error',
            message: languageHandler('errors.no_selected_file', process.env.ADMIN_LANG),
        });
    }

    // databaseTable : databaseColumn
    const database_values_single_upload = {
        products: 'image_thumbnail',
        hero: 'image',
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

    let databaseColumn = isThumbnailImage ? database_values_single_upload[databaseTable] : database_values_multiple_upload[databaseTable];

    let imageFilesWithNames = null;

    // Simple image upload
    if ( isThumbnailImage ) {
        imageFilesWithNames = files.filename;

        const sqlUpdateQuery = `UPDATE ${ databaseTable } SET ${ databaseColumn } = ? WHERE id = ?;`;

        db.query(sqlUpdateQuery, [imageFilesWithNames, columnId], (error, result) => {
            if (error) {
                console.log(error);
                return response.status(200).json({ status: 'error' });
            }

            if (result) {
                return response.status(200).json({ status: 'success' });
            }
        });
    }

    // Multiple images upload
    else if ( !isThumbnailImage ) {

        imageFilesWithNames = files.map(file => file.filename);
        const sqlSelectQuery = `SELECT ${ databaseColumn } AS 'database_images' FROM ${ databaseTable } WHERE id = ?;`;

        db.query(sqlSelectQuery, columnId, (err, databaseImages) => {
            if (err) {
                console.log(err);
                return response.status(200).json({ status: 'error' });
            }

            // If there is already some image data in the database
            else if (databaseImages[0].database_images != null) {
                databaseImages = JSON.parse(databaseImages[0].database_images);
                imageFilesWithNames = imageFilesWithNames.concat(databaseImages);
            }

            imageFilesWithNames = imageFilesWithNames.filter(image => image != null);
            imageFilesWithNames = JSON.stringify(imageFilesWithNames);

            const sqlMultipleImageUpdate = `UPDATE ${ databaseTable } SET ${ databaseColumn } = ? WHERE id = ?;`;

            db.query(sqlMultipleImageUpdate, [imageFilesWithNames, columnId], (error, result) => {
                if (error) {
                    console.log(error);
                    return response.status(200).json({ status: 'error' });
                }

                if (result) {
                    return response.status(200).json({ status: 'success' });
                }
            });
        });
    }
}

module.exports = { saveImageToDatabase };
