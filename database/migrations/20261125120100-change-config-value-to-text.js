const TABLE = 'config';
const COLUMN = 'config_value';
const OLD_LENGTH = 1500;

/**
 * The localized settings (e.g. the home page text) are stored as JSON with every language in one value,
 * a VARCHAR(1500) is too short for them.
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn(TABLE, COLUMN, { type: Sequelize.TEXT, allowNull: true });
    },

    async down(queryInterface, Sequelize) {
        const [[{ longest }]] = await queryInterface.sequelize.query(
            `SELECT COALESCE(MAX(CHAR_LENGTH(\`${COLUMN}\`)), 0) AS longest FROM \`${TABLE}\``,
        );

        // The CLI connection is not in strict mode, the longer values would be cut silently
        if (Number(longest) > OLD_LENGTH) {
            throw new Error(`A ${TABLE}.${COLUMN} value is ${longest} characters long, it does not fit into VARCHAR(${OLD_LENGTH})`);
        }

        await queryInterface.changeColumn(TABLE, COLUMN, { type: Sequelize.STRING(OLD_LENGTH), allowNull: true });
    },
};
