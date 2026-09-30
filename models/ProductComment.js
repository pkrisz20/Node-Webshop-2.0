const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProductComment extends Model {
        static associate ({ Product }) {
            this.belongsTo(Product, {
                foreignKey: 'product_id',
            });
        }
    }

    ProductComment.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(300),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            comment: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            is_verified_purchase: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                defaultValue: 0,
            },
            is_active: {
                type: DataTypes.INTEGER(5),
                allowNull: false,
                defaultValue: 0,
            },
            date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            rating: {
                type: DataTypes.INTEGER(100),
                allowNull: true,
            },
            product_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        },
        {
            sequelize,
            timestamps: false,
            paranoid: false,
            tableName: 'product_comments',
        },
    );

    return ProductComment;
};
