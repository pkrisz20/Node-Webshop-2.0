const { createTableIfMissing } = require('../schema');

module.exports = {
    async up(queryInterface, Sequelize) {
        await createTableIfMissing(queryInterface, 'heros', {
            id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
            title: { type: Sequelize.STRING(500), allowNull: false },
            subtitle: { type: Sequelize.STRING(1000), allowNull: true },
            image: { type: Sequelize.STRING(300), allowNull: true },
            link: { type: Sequelize.STRING(500), allowNull: true },
            target_page: { type: Sequelize.STRING(50), allowNull: false, defaultValue: '_blank' },
            button_text: { type: Sequelize.STRING(200), allowNull: true },
            is_active: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            created_at: { type: Sequelize.DATE, allowNull: true },
            updated_at: { type: Sequelize.DATE, allowNull: true },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('heros');
    },
};
