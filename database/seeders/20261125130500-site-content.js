const { buildSiteContent } = require('../seed-data/site');

/** 4 employees, 6 FAQ entries and 3 home page slides (one of them inactive) */
module.exports = {
    async up(queryInterface) {
        const { employees, faq, sliders } = buildSiteContent(new Date());

        await queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.bulkInsert('employees', employees, { transaction });
            await queryInterface.bulkInsert('faq', faq, { transaction });
            await queryInterface.bulkInsert('heros', sliders, { transaction });
        });
    },

    async down(queryInterface) {
        const { employees, faq, sliders } = buildSiteContent(new Date());

        await queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.bulkDelete('employees', { email: employees.map(employee => employee.email) }, { transaction });
            await queryInterface.bulkDelete('faq', { question: faq.map(item => item.question) }, { transaction });
            await queryInterface.bulkDelete('heros', { title: sliders.map(slider => slider.title) }, { transaction });
        });
    },
};
