const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class WebshopCategory extends Model {
        static associate ({ Product }) {
            this.hasMany(Product, {
                foreignKey: 'category_id',
                onDelete: 'cascade',
            });
        }
    }

    WebshopCategory.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(500),
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            short_description: {
                type: DataTypes.STRING(3000),
                allowNull: true,
            },
            image: {
                type: DataTypes.STRING(200),
                allowNull: true,
            },
        },
        {
            sequelize,
            timestamps: true,
            paranoid: false,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            tableName: 'categories',
        },
    );

    return WebshopCategory;
};
