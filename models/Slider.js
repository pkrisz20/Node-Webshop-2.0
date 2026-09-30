const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Slider extends Model {};

    Slider.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            title: {
                type: DataTypes.STRING(500),
                allowNull: false,
            },
            subtitle: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            image: {
                type: DataTypes.STRING(300),
                allowNull: true,
            },
            link: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            target_page: {
                type: DataTypes.STRING(50),
                allowNull: false,
                defaultValue: "_blank",
            },
            button_text: {
                type: DataTypes.STRING(200),
                allowNull: true,
            },
            is_active: {
                type: DataTypes.INTEGER(5),
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            sequelize,
            timestamps: true,
            paranoid: false,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            tableName: 'heros',
        },
    );

    return Slider;
};
