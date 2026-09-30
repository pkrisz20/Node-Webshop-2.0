const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class WebshopParameter extends Model {
        static associate({ Product, ProductParameter }) {
            this.belongsToMany(Product, {
                through: ProductParameter,
                foreignKey: 'parameter_id',
                otherKey: 'product_id',
                onDelete: 'cascade',
            });
        }
    };

    WebshopParameter.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            parameter_name: {
                type: DataTypes.STRING(1500),
                allowNull: true,
            },
        },
        {
            sequelize,
            timestamps: true,
            paranoid: false,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            tableName: 'parameters',
        },
    );

    return WebshopParameter;
};
