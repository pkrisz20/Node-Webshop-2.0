const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ArticleComment extends Model {
        static associate ({ Article }) {
            this.belongsTo(Article, {
                foreignKey: 'blog_id',
            });
        }
    };

    ArticleComment.init(
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
            date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            comment: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            is_active: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            blog_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            timestamps: false,
            paranoid: false,
            tableName: 'blog_comments',
        },
    );

    return ArticleComment;
};
