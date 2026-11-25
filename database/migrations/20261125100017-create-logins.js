const { createTableIfMissing } = require('../schema');

module.exports = {
    async up(queryInterface, Sequelize) {
        await createTableIfMissing(queryInterface, 'logins', {
            login_id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
            login_ip_address: { type: Sequelize.STRING(200), allowNull: false },
            login_datetime: { type: Sequelize.DATE, allowNull: true },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('logins');
    },
};
