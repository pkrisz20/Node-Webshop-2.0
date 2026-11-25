const TABLE = 'product_comments';
const CONSTRAINT = 'product_comments_product_id_foreign';

/**
 * Every product comment belongs to a product, but the `product_id` column was missing from the existing table.
 * The comments saved without it can not be linked to any product, so they are deleted (this can not be undone).
 * A database that already has the column is left untouched.
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        const columns = await queryInterface.describeTable(TABLE);

        if (columns.product_id) {
            return;
        }

        await queryInterface.sequelize.query(`DELETE FROM \`${TABLE}\``);

        await queryInterface.addColumn(TABLE, 'product_id', {
            type: Sequelize.INTEGER,
            allowNull: false,
            after: 'rating',
        });

        await queryInterface.addConstraint(TABLE, {
            name: CONSTRAINT,
            type: 'foreign key',
            fields: ['product_id'],
            references: { table: 'products', field: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    },

    async down(queryInterface) {
        await queryInterface.removeConstraint(TABLE, CONSTRAINT);
        await queryInterface.removeColumn(TABLE, 'product_id');
    },
};
