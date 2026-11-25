const { createTableIfMissing } = require('../schema');

module.exports = {
    async up(queryInterface, Sequelize) {
        await createTableIfMissing(queryInterface, 'blog_comments', {
            id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
            name: { type: Sequelize.STRING(300), allowNull: false },
            email: { type: Sequelize.STRING(200), allowNull: false },
            comment: { type: Sequelize.TEXT, allowNull: false },
            is_active: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            date: { type: Sequelize.DATE, allowNull: true },
            blog_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'blogs', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('blog_comments');
    },
};
