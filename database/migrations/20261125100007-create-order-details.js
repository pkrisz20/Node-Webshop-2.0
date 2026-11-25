const { createTableIfMissing } = require('../schema');

module.exports = {
    async up(queryInterface, Sequelize) {
        await createTableIfMissing(queryInterface, 'order_details', {
            order_details_id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
            order_id: {
                type: Sequelize.STRING(500),
                allowNull: false,
                references: { model: 'orders', key: 'order_id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'products', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            quantity: { type: Sequelize.INTEGER, allowNull: false },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('order_details');
    },
};
