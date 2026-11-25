const { buildContactMessages } = require('../seed-data/site');

/** 25 messages of the contact form */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('contact_messages', buildContactMessages(new Date()));
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('contact_messages', { email: buildContactMessages(new Date()).map(message => message.email) });
    },
};
