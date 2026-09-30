const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class StaticContent extends Model {};

    StaticContent.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            title: {
                type: DataTypes.STRING(1000),
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            short_description: {
                type: DataTypes.STRING(3000),
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            content_name: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            sequelize,
            timestamps: false,
            paranoid: false,
            tableName: 'static_contents',
        },
    );

    return StaticContent;
};
