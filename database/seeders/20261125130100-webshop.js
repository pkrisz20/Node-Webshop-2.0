const { buildWebshop } = require('../seed-data/webshop');

/** Ids of the rows just inserted, keyed by a unique column (the rows inserted before the seeder are skipped) */
async function idsBy(queryInterface, Sequelize, transaction, table, column, values, minimumId) {
    const rows = await queryInterface.sequelize.query(
        `SELECT id, \`${column}\` AS \`key\` FROM \`${table}\` WHERE \`${column}\` IN (:values) AND id > :minimumId`,
        { replacements: { values, minimumId }, type: Sequelize.QueryTypes.SELECT, transaction },
    );

    return new Map(rows.map(row => [row.key, row.id]));
}

async function maxId(queryInterface, Sequelize, transaction, table) {
    const [{ maxId: value }] = await queryInterface.sequelize.query(
        `SELECT COALESCE(MAX(id), 0) AS maxId FROM \`${table}\``,
        { type: Sequelize.QueryTypes.SELECT, transaction },
    );

    return value;
}

/** 5 categories, 5 parameters, 40 products with parameter values and reviews (no images) */
module.exports = {
    async up(queryInterface, Sequelize) {
        const { categories, parameters, products } = buildWebshop(new Date());

        await queryInterface.sequelize.transaction(async transaction => {
            const insertedIds = async (table, column, records, keyOf) => {
                const minimumId = await maxId(queryInterface, Sequelize, transaction, table);
                await queryInterface.bulkInsert(table, records.map(record => record.row), { transaction });
                return idsBy(queryInterface, Sequelize, transaction, table, column, records.map(keyOf), minimumId);
            };

            const categoryIds = await insertedIds('categories', 'slug', categories, category => category.slug);
            const parameterIds = await insertedIds('parameters', 'parameter_name', parameters, parameter => parameter.name);

            const productRecords = products.map(product => ({
                ...product,
                row: { ...product.row, category_id: categoryIds.get(product.categorySlug) },
            }));
            const productIds = await insertedIds('products', 'slug', productRecords, product => product.slug);

            await queryInterface.bulkInsert('product_parameters', products.flatMap(product => product.parameterValues.map(value => ({
                parameter_id: parameterIds.get(value.parameterName),
                product_id: productIds.get(product.slug),
                parameter_value: value.value,
            }))), { transaction });

            const reviews = products.flatMap(product => product.reviews.map(review => ({ ...review, product_id: productIds.get(product.slug) })));

            if (reviews.length > 0) {
                await queryInterface.bulkInsert('product_comments', reviews, { transaction });
            }
        });
    },

    /** The parameter values, the reviews and the order lines of the products are deleted by ON DELETE CASCADE */
    async down(queryInterface) {
        const { categories, parameters, products } = buildWebshop(new Date());

        await queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.bulkDelete('products', { slug: products.map(product => product.slug) }, { transaction });
            await queryInterface.bulkDelete('categories', { slug: categories.map(category => category.slug) }, { transaction });
            await queryInterface.bulkDelete('parameters', { parameter_name: parameters.map(parameter => parameter.name) }, { transaction });
        });
    },
};
