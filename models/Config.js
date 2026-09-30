const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Config extends Model {};

    Config.init(
        {
            config_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            config_key: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            config_value: {
                type: DataTypes.STRING(1500),
                allowNull: true,
            },
        },
        {
            sequelize,
            timestamps: false,
            tableName: 'config',
        },
    );

    return Config;
};
