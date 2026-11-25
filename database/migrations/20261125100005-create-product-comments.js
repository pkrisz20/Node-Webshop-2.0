const { createTableIfMissing } = require('../schema');

/** The table as it was in the existing database, the `product_id` column is added by a later migration */
module.exports = {
    async up(queryInterface, Sequelize) {
        await createTableIfMissing(queryInterface, 'product_comments', {
            id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
            name: { type: Sequelize.STRING(300), allowNull: false },
            email: { type: Sequelize.STRING(200), allowNull: false },
            comment: { type: Sequelize.TEXT, allowNull: false },
            is_verified_purchase: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            is_active: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            date: { type: Sequelize.DATE, allowNull: true },
            rating: { type: Sequelize.INTEGER, allowNull: true },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('product_comments');
    },
};
