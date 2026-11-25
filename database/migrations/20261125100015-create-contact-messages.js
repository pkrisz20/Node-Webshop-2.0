const { createTableIfMissing } = require('../schema');

module.exports = {
    async up(queryInterface, Sequelize) {
        await createTableIfMissing(queryInterface, 'contact_messages', {
            id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
            first_name: { type: Sequelize.STRING(200), allowNull: false },
            last_name: { type: Sequelize.STRING(200), allowNull: false },
            phone: { type: Sequelize.STRING(200), allowNull: false },
            email: { type: Sequelize.STRING(200), allowNull: false },
            city: { type: Sequelize.STRING(500), allowNull: false },
            client_message: { type: Sequelize.STRING(1000), allowNull: false },
            date: { type: Sequelize.DATE, allowNull: true },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('contact_messages');
    },
};
