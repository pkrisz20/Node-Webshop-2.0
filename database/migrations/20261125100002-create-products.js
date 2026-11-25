const { createTableIfMissing } = require('../schema');

module.exports = {
    async up(queryInterface, Sequelize) {
        const created = await createTableIfMissing(queryInterface, 'products', {
            id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
            name: { type: Sequelize.STRING(1000), allowNull: false },
            slug: { type: Sequelize.STRING(1000), allowNull: true },
            short_description: { type: Sequelize.STRING(3000), allowNull: true },
            description: { type: Sequelize.TEXT, allowNull: true },
            images: { type: Sequelize.STRING(1000), allowNull: true },
            image_thumbnail: { type: Sequelize.STRING(300), allowNull: true },
            price: { type: Sequelize.FLOAT(100, 2), allowNull: false },
            discount_value: { type: Sequelize.FLOAT(100, 2), allowNull: true },
            discount_end_date: { type: Sequelize.DATE, allowNull: true },
            category_id: { type: Sequelize.INTEGER, allowNull: false },
            is_active: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            is_featured: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            is_available: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            is_delivered: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            is_new: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            max_order_count: { type: Sequelize.INTEGER, allowNull: true },
            comments_allowed: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            created_at: { type: Sequelize.DATE, allowNull: false },
            updated_at: { type: Sequelize.DATE, allowNull: false },
            // Not used by the app (the models are not paranoid), kept from the existing database
            deleted_at: { type: Sequelize.DATE, allowNull: true },
        });

        if (created) {
            // A category with products can not be deleted
            await queryInterface.addConstraint('products', {
                name: 'category_product_relation',
                type: 'foreign key',
                fields: ['category_id'],
                references: { table: 'categories', field: 'id' },
                onDelete: 'RESTRICT',
                onUpdate: 'RESTRICT',
            });
        }
    },

    async down(queryInterface) {
        await queryInterface.dropTable('products');
    },
};
