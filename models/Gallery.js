const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Gallery extends Model {};

    Gallery.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            gallery_name: {
                type: DataTypes.STRING(1000),
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            gallery_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            gallery_images: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            gallery_thumbnail: {
                type: DataTypes.STRING(300),
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
        },
        {
            sequelize,
            timestamps: true,
            paranoid: false,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            tableName: 'galleries',
        },
    );

    return Gallery;
};
