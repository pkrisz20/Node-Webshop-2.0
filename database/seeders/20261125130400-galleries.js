const { buildGalleries } = require('../seed-data/site');

/** 10 galleries without images */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('galleries', buildGalleries(new Date()).map(gallery => gallery.row));
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('galleries', { slug: buildGalleries(new Date()).map(gallery => gallery.slug) });
    },
};
