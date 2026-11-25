/** Every table of the existing database was created with these options */
const TABLE_OPTIONS = Object.freeze({
    engine: 'InnoDB',
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
});

/**
 * The database existed before the migrations, its tables were created by hand.
 * The create migrations skip the tables that already exist, so on that database they are only recorded as run.
 *
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {string} tableName
 * @param {import('sequelize').ModelAttributes} attributes
 * @returns {Promise<boolean>} Whether the table was created
 */
async function createTableIfMissing(queryInterface, tableName, attributes) {
    if (await queryInterface.tableExists(tableName)) {
        return false;
    }

    await queryInterface.createTable(tableName, attributes, TABLE_OPTIONS);
    return true;
}

module.exports = { TABLE_OPTIONS, createTableIfMissing };
