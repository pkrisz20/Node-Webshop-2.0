const { createTableIfMissing } = require('../schema');

module.exports = {
    async up(queryInterface, Sequelize) {
        await createTableIfMissing(queryInterface, 'employees', {
            id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
            image: { type: Sequelize.STRING(300), allowNull: true },
            name: { type: Sequelize.STRING(200), allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: true },
            position: { type: Sequelize.STRING(500), allowNull: false },
            facebook: { type: Sequelize.STRING(500), allowNull: true },
            instagram: { type: Sequelize.STRING(500), allowNull: true },
            tiktok: { type: Sequelize.STRING(500), allowNull: true },
            email: { type: Sequelize.STRING(500), allowNull: true },
            phone: { type: Sequelize.STRING(200), allowNull: true },
            is_active: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            created_at: { type: Sequelize.DATE, allowNull: true },
            updated_at: { type: Sequelize.DATE, allowNull: true },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('employees');
    },
};
