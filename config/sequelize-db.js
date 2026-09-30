const sequelizeConfig = {
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    other: {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: process.env.APP_DEBUG === 'true' ? console.log : false,
    }
};

module.exports = sequelizeConfig;
