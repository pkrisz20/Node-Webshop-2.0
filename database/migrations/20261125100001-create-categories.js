const { createTableIfMissing } = require('../schema');

module.exports = {
    async up(queryInterface, Sequelize) {
        await createTableIfMissing(queryInterface, 'categories', {
            id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
            name: { type: Sequelize.STRING(500), allowNull: false },
            slug: { type: Sequelize.STRING(1000), allowNull: true },
            short_description: { type: Sequelize.STRING(3000), allowNull: true },
            image: { type: Sequelize.STRING(200), allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false },
            // Not used by the app (the models are not paranoid), kept from the existing database
            deleted_at: { type: Sequelize.DATE, allowNull: true },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('categories');
    },
};
