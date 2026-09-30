const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Article extends Model {
        static associate({ ArticleComment }) {
            this.hasMany(ArticleComment, {
                foreignKey: 'blog_id'
            });
        }
    };

    Article.init(
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
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            date: {
                type: DataTypes.DATE,
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
            author: {
                type: DataTypes.STRING(100),
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
            is_important: {
                type: DataTypes.INTEGER(5),
                allowNull: false,
                defaultValue: 0,
            },
            comments_allowed: {
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
            tableName: 'blogs',
        },
    );

    return Article;
};
