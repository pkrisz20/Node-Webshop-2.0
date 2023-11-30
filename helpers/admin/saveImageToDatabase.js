// Save the path of the images into database in json array format
// The db table name and
// the files/folder name is same
// @return bool
const { db } = require('../../config/db-connection');

function saveImageToDatabase ( files, databaseTable, columnId, isThumbnailImage = false ) {

    if ( files.length === 0 ) return false;

    let imageFilesWithNames = null;

    // Single file is stored in database as string
    if ( isThumbnailImage ) {
        imageFilesWithNames = files[0].filename;
    }
    // Multiple files stored in database as json array format
    else if ( !isThumbnailImage ) {
        imageFilesWithNames = files.map(file => file.filename);
        imageFilesWithNames = JSON.stringify(imageFilesWithNames);
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

    let = databaseColumn = isThumbnailImage ? database_values_single_upload[databaseTable] : database_values_multiple_upload[databaseTable];

    // TODO: Check for is this working like that?
    // const sqlQuery = `UPDATE ${ databaseTable } SET ${ databaseColumn } = ? WHERE id = ?;`;
    let sqlQuery = `UPDATE ? SET ? = ? WHERE id = ?;`;

    db.query(sqlQuery, [databaseTable, databaseColumn, imageFilesWithNames, columnId], (error, result) => {
        if (error) {
            console.log(error);
            return false;
        }

        if (result) {
            return true;
        }
    });
}

module.exports = saveImageToDatabase;
