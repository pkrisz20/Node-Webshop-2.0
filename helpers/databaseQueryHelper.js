const { db } = require('../config/db-connection');

function DoDatabaseQuery (sql, arguments = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, arguments, (err, rows) => {
            if (err) return reject(err);
            return resolve(rows);
        });
    });
}

module.exports = DoDatabaseQuery;
