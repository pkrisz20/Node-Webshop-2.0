const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class FAQ extends Model {};

    FAQ.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            question: {
                type: DataTypes.STRING(1500),
                allowNull: false,
            },
            answer: {
                type: DataTypes.TEXT,
                allowNull: false,
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
            tableName: 'faq',
        },
    );

    return FAQ;
};
