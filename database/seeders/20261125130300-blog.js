const { buildBlog } = require('../seed-data/blog');

/** 20 articles and 4 upcoming events with comments (no images) */
module.exports = {
    async up(queryInterface, Sequelize) {
        const articles = buildBlog(new Date());

        await queryInterface.sequelize.transaction(async transaction => {
            const [{ maxId }] = await queryInterface.sequelize.query(
                'SELECT COALESCE(MAX(id), 0) AS maxId FROM blogs',
                { type: Sequelize.QueryTypes.SELECT, transaction },
            );

            await queryInterface.bulkInsert('blogs', articles.map(article => article.row), { transaction });

            const insertedRows = await queryInterface.sequelize.query(
                'SELECT id, slug FROM blogs WHERE slug IN (:slugs) AND id > :maxId',
                { replacements: { slugs: articles.map(article => article.slug), maxId }, type: Sequelize.QueryTypes.SELECT, transaction },
            );
            const articleIds = new Map(insertedRows.map(row => [row.slug, row.id]));

            const comments = articles.flatMap(article => article.comments.map(comment => ({ ...comment, blog_id: articleIds.get(article.slug) })));

            if (comments.length > 0) {
                await queryInterface.bulkInsert('blog_comments', comments, { transaction });
            }
        });
    },

    /** The comments are deleted by ON DELETE CASCADE */
    async down(queryInterface) {
        await queryInterface.bulkDelete('blogs', { slug: buildBlog(new Date()).map(article => article.slug) });
    },
};
