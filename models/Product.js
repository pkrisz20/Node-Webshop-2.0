const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        static associate({ ProductComment }) {
            this.hasMany(ProductComment, {
                foreignKey: 'product_id',
                onDelete: 'cascade',
            });
        }

        static associate({ WebshopParameter, ProductParameter }) {
            this.belongsToMany(WebshopParameter, {
                through: ProductParameter,
                foreignKey: 'product_id',
                otherKey: 'parameter_id',
                onDelete: 'cascade',
            });
        }

        static associate({ WebshopCategory }) {
            this.belongsTo(WebshopCategory, {
                foreignKey: 'category_id',
                onDelete: 'cascade',
            });
        }
    };

    Product.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(1000),
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
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            images: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            image_thumbnail: {
                type: DataTypes.STRING(300),
                allowNull: true,
            },
            price: {
                type: DataTypes.FLOAT(100, 2),
                allowNull: false,
            },
            discount_value: {
                type: DataTypes.FLOAT(100, 2),
                allowNull: true,
            },
            discount_end_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            is_active: {
                type: DataTypes.INTEGER(5),
                allowNull: false,
                defaultValue: 0,
            },
            is_featured: {
                type: DataTypes.INTEGER(5),
                allowNull: false,
                defaultValue: 0,
            },
            is_available: {
                type: DataTypes.INTEGER(5),
                allowNull: false,
                defaultValue: 0,
            },
            is_delivered: {
                type: DataTypes.INTEGER(5),
                allowNull: false,
                defaultValue: 0,
            },
            is_new: {
                type: DataTypes.INTEGER(5),
                allowNull: false,
                defaultValue: 0,
            },
            max_order_count: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
            },
            comments_allowed: {
                type: DataTypes.INTEGER(5),
                allowNull: false,
                defaultValue: 0,
            },
            category_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        },
        {
            sequelize,
            timestamps: true,
            paranoid: false,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            tableName: 'products',
        },
    );

    return Product;
};
