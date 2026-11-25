const { createTableIfMissing } = require('../schema');

module.exports = {
    async up(queryInterface, Sequelize) {
        const created = await createTableIfMissing(queryInterface, 'product_parameters', {
            id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
            parameter_id: { type: Sequelize.INTEGER, allowNull: false },
            product_id: { type: Sequelize.INTEGER, allowNull: false },
            parameter_value: { type: Sequelize.STRING(1500), allowNull: true },
        });

        if (created) {
            await queryInterface.addConstraint('product_parameters', {
                name: 'product_parameter_constraint',
                type: 'foreign key',
                fields: ['product_id'],
                references: { table: 'products', field: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });

            await queryInterface.addConstraint('product_parameters', {
                name: 'parameter_product_constraint',
                type: 'foreign key',
                fields: ['parameter_id'],
                references: { table: 'parameters', field: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
        }
    },

    async down(queryInterface) {
        await queryInterface.dropTable('product_parameters');
    },
};
