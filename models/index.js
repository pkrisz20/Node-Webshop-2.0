const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/sequelize-db');
const basename = path.basename(__filename);
const db = {};

// Initialize Sequelize instance
const sequelize = new Sequelize(config.database, config.username, config.password, config.other);

// Dynamically import all models
fs.readdirSync(__dirname)
    .filter((file) => file.indexOf('.') !== 0 && (file !== basename) && file.slice(-3) === '.js')
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

// Run associations
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// Export sequelize and models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
