const { createTableIfMissing } = require('../schema');

module.exports = {
    async up(queryInterface, Sequelize) {
        await createTableIfMissing(queryInterface, 'errors_log', {
            log_id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
            log_name: { type: Sequelize.STRING(1500), allowNull: true },
            log_description: { type: Sequelize.TEXT, allowNull: true },
            log_date: { type: Sequelize.DATE, allowNull: true },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('errors_log');
    },
};
