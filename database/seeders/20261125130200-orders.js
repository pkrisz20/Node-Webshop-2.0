const { buildWebshop } = require('../seed-data/webshop');
const { ORDER_ID_PREFIX, buildOrders } = require('../seed-data/orders');

/** 45 orders of the seeded products in every status, spread over the last ~11 months (for the dashboard charts) */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async transaction => {
            const products = await queryInterface.sequelize.query(
                `SELECT id, price, discount_value, discount_end_date, is_active, is_available, max_order_count
                FROM products WHERE slug IN (:slugs) ORDER BY id`,
                {
                    replacements: { slugs: buildWebshop(new Date()).products.map(product => product.slug) },
                    type: Sequelize.QueryTypes.SELECT,
                    transaction,
                },
            );

            if (products.length === 0) {
                throw new Error('The seeded products are missing, run the webshop seeder first');
            }

            const orders = buildOrders(new Date(), products);

            await queryInterface.bulkInsert('orders', orders.map(({ order }) => order), { transaction });
            await queryInterface.bulkInsert(
                'order_details',
                orders.flatMap(({ order, lines }) => lines.map(line => ({ ...line, order_id: order.order_id }))),
                { transaction },
            );
        });
    },

    /** The order lines are deleted by ON DELETE CASCADE */
    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('orders', { order_id: { [Sequelize.Op.like]: `${ORDER_ID_PREFIX}%` } });
    },
};
