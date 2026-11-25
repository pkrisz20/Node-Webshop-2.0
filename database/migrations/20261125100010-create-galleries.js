const { createTableIfMissing } = require('../schema');

module.exports = {
    async up(queryInterface, Sequelize) {
        await createTableIfMissing(queryInterface, 'galleries', {
            id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
            gallery_name: { type: Sequelize.STRING(1000), allowNull: false },
            description: { type: Sequelize.TEXT('long'), allowNull: true },
            slug: { type: Sequelize.STRING(500), allowNull: true },
            gallery_date: { type: Sequelize.DATEONLY, allowNull: true },
            gallery_images: { type: Sequelize.TEXT, allowNull: true },
            gallery_thumbnail: { type: Sequelize.STRING(300), allowNull: true },
            is_active: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            is_featured: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            created_at: { type: Sequelize.DATE, allowNull: true },
            updated_at: { type: Sequelize.DATE, allowNull: true },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('galleries');
    },
};
