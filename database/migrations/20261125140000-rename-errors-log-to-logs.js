const OLD_TABLE = 'errors_log';
const TABLE = 'logs';
const INDEXES = [
    { name: 'logs_log_date', fields: ['log_date'] },
    { name: 'logs_log_type_log_date', fields: ['log_type', 'log_date'] },
];

/**
 * Every log entry of the application goes into one table: the `errors_log` table becomes `logs`.
 * The new columns: the type of the entry (info, warning, error) and the request it was written in
 * (method, URL, IP address, user agent; empty for the background jobs).
 * The existing rows are all errors, so they get the `error` type.
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        if (!(await queryInterface.tableExists(TABLE))) {
            await queryInterface.renameTable(OLD_TABLE, TABLE);
        }

        const columns = await queryInterface.describeTable(TABLE);

        if (!columns.log_type) {
            await queryInterface.addColumn(TABLE, 'log_type', {
                type: Sequelize.ENUM('info', 'warning', 'error'),
                allowNull: false,
                defaultValue: 'info',
                after: 'log_id',
            });
            await queryInterface.sequelize.query(`UPDATE \`${TABLE}\` SET log_type = 'error'`);
        }

        const requestColumns = [
            ['request_method', { type: Sequelize.STRING(16), allowNull: true, after: 'log_description' }],
            ['request_url', { type: Sequelize.TEXT, allowNull: true, after: 'request_method' }],
            ['ip_address', { type: Sequelize.STRING(45), allowNull: true, after: 'request_url' }],
            ['user_agent', { type: Sequelize.TEXT, allowNull: true, after: 'ip_address' }],
        ];

        for (const [name, definition] of requestColumns) {
            if (!columns[name]) {
                await queryInterface.addColumn(TABLE, name, definition);
            }
        }

        const existingIndexes = (await queryInterface.showIndex(TABLE)).map(index => index.name);

        for (const index of INDEXES.filter(index => !existingIndexes.includes(index.name))) {
            await queryInterface.addIndex(TABLE, index.fields, { name: index.name });
        }
    },

    /** The `errors_log` table can store only errors, the info and warning entries are deleted */
    async down(queryInterface) {
        for (const index of INDEXES) {
            await queryInterface.removeIndex(TABLE, index.name);
        }

        await queryInterface.sequelize.query(`DELETE FROM \`${TABLE}\` WHERE log_type <> 'error'`);

        for (const name of ['user_agent', 'ip_address', 'request_url', 'request_method', 'log_type']) {
            await queryInterface.removeColumn(TABLE, name);
        }

        await queryInterface.renameTable(TABLE, OLD_TABLE);
    },
};
