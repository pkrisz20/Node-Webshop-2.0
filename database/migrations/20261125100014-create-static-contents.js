const { createTableIfMissing } = require('../schema');

module.exports = {
    async up(queryInterface, Sequelize) {
        await createTableIfMissing(queryInterface, 'static_contents', {
            id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
            title: { type: Sequelize.STRING(1000), allowNull: false },
            slug: { type: Sequelize.STRING(500), allowNull: true },
            short_description: { type: Sequelize.STRING(3000), allowNull: true },
            description: { type: Sequelize.TEXT('long'), allowNull: true },
            content_name: { type: Sequelize.STRING(1000), allowNull: true },
            updated_at: { type: Sequelize.DATE, allowNull: true },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('static_contents');
    },
};
