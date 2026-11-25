const { createTableIfMissing } = require('../schema');

module.exports = {
    async up(queryInterface, Sequelize) {
        await createTableIfMissing(queryInterface, 'config', {
            config_id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
            config_key: { type: Sequelize.STRING(200), allowNull: false },
            config_value: { type: Sequelize.STRING(1500), allowNull: true },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('config');
    },
};
