const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProductParameter extends Model {};

    ProductParameter.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            parameter_value: {
                type: DataTypes.STRING(1500),
                allowNull: true,
            },
            product_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            parameter_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            timestamps: false,
            paranoid: false,
            tableName: 'product_parameters',
        },
    );

    return ProductParameter;
};
