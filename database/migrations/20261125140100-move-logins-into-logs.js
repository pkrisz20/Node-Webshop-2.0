const { TABLE_OPTIONS } = require('../schema');

/** The title of the successful admin logins, the same as in AuthController */
const LOGIN_TITLE = 'Admin login';
const LOGIN_DESCRIPTION = 'Successful admin login';

/**
 * The successful admin logins are logged into the `logs` table (info entries), so the `logins` table is not needed:
 * its rows are copied into `logs`, then it is dropped.
 */
module.exports = {
    async up(queryInterface) {
        if (!(await queryInterface.tableExists('logins'))) {
            return;
        }

        await queryInterface.sequelize.query(
            `INSERT INTO logs (log_type, log_name, log_description, ip_address, log_date)
            SELECT 'info', :title, :description, login_ip_address, login_datetime FROM logins ORDER BY login_id`,
            { replacements: { title: LOGIN_TITLE, description: LOGIN_DESCRIPTION } },
        );

        await queryInterface.dropTable('logins');
    },

    /** The login entries are moved back (with their IP address and date) */
    async down(queryInterface, Sequelize) {
        await queryInterface.createTable('logins', {
            login_id: { type: Sequelize.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
            login_ip_address: { type: Sequelize.STRING(200), allowNull: false },
            login_datetime: { type: Sequelize.DATE, allowNull: true },
        }, TABLE_OPTIONS);

        await queryInterface.sequelize.transaction(async transaction => {
            const where = `log_type = 'info' AND log_name = :title`;
            const options = { replacements: { title: LOGIN_TITLE }, transaction };

            await queryInterface.sequelize.query(
                `INSERT INTO logins (login_ip_address, login_datetime)
                SELECT COALESCE(ip_address, 'unknown'), log_date FROM logs WHERE ${where} ORDER BY log_id`,
                options,
            );
            await queryInterface.sequelize.query(`DELETE FROM logs WHERE ${where}`, options);
        });
    },
};
