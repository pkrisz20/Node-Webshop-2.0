const { DEFAULT_CONFIG, STATIC_CONTENTS } = require('../seed-data/settings');

/**
 * The settings and the locked static pages (terms of use, privacy policy) the site needs to work.
 * Only the missing ones are inserted, the existing values are never changed. The undo keeps them:
 * they are part of the site, not test data, and they can not be told apart from the ones edited in the admin.
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async transaction => {
            const select = sql => queryInterface.sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT, transaction });

            const existingKeys = new Set((await select('SELECT config_key FROM config')).map(row => row.config_key));
            const missingConfig = Object.entries(DEFAULT_CONFIG)
                .filter(([key]) => !existingKeys.has(key))
                .map(([key, value]) => ({ config_key: key, config_value: value }));

            if (missingConfig.length > 0) {
                await queryInterface.bulkInsert('config', missingConfig, { transaction });
            }

            const existingContents = new Set((await select('SELECT content_name FROM static_contents')).map(row => row.content_name));
            const missingContents = STATIC_CONTENTS
                .filter(content => !existingContents.has(content.content_name))
                .map(content => ({ ...content, updated_at: new Date() }));

            if (missingContents.length > 0) {
                await queryInterface.bulkInsert('static_contents', missingContents, { transaction });
            }
        });
    },

    async down() {
        // Intentionally empty, see above
    },
};
