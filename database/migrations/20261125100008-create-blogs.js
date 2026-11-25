const { createTableIfMissing } = require('../schema');

module.exports = {
    async up(queryInterface, Sequelize) {
        await createTableIfMissing(queryInterface, 'blogs', {
            id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
            title: { type: Sequelize.STRING(1000), allowNull: false },
            slug: { type: Sequelize.STRING(500), allowNull: true },
            date: { type: Sequelize.DATEONLY, allowNull: true },
            images: { type: Sequelize.STRING(1000), allowNull: true },
            image_thumbnail: { type: Sequelize.STRING(300), allowNull: true },
            author: { type: Sequelize.STRING(100), allowNull: true },
            short_description: { type: Sequelize.STRING(3000), allowNull: true },
            description: { type: Sequelize.TEXT('long'), allowNull: true },
            is_active: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            is_featured: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            is_important: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            comments_allowed: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            created_at: { type: Sequelize.DATE, allowNull: true },
            updated_at: { type: Sequelize.DATE, allowNull: true },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('blogs');
    },
};
