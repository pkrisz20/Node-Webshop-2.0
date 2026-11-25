const TABLE = 'order_details';

/**
 * The order lines get the unit price paid at the time of the order, before only the current price of the product was known.
 * The existing lines are filled in only for the orders with a single product line (unit price = order total / quantity),
 * the lines of the other old orders stay NULL: their original prices can not be recovered.
 * A database that already has the column is left untouched.
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        const columns = await queryInterface.describeTable(TABLE);

        if (columns.unit_price) {
            return;
        }

        await queryInterface.addColumn(TABLE, 'unit_price', {
            type: Sequelize.INTEGER,
            allowNull: true,
            after: 'quantity',
        });

        await queryInterface.sequelize.query(`
            UPDATE order_details
            JOIN orders ON orders.order_id = order_details.order_id
            JOIN (SELECT order_id FROM order_details GROUP BY order_id HAVING COUNT(*) = 1) AS single_line_orders
                ON single_line_orders.order_id = order_details.order_id
            SET order_details.unit_price = orders.order_sum_price DIV order_details.quantity
            WHERE orders.order_sum_price IS NOT NULL
                AND order_details.quantity > 0
                AND orders.order_sum_price MOD order_details.quantity = 0
        `);
    },

    async down(queryInterface) {
        await queryInterface.removeColumn(TABLE, 'unit_price');
    },
};
