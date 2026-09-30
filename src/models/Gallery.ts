import {
    DataTypes,
    Model,
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    type Sequelize,
} from 'sequelize';

export class Gallery extends Model<InferAttributes<Gallery>, InferCreationAttributes<Gallery>> {
    declare id: CreationOptional<number>;
    declare gallery_name: string;
    declare description: CreationOptional<string | null>;
    declare slug: CreationOptional<string | null>;
    declare gallery_date: CreationOptional<string | null>;
    declare gallery_images: CreationOptional<string | null>;
    declare gallery_thumbnail: CreationOptional<string | null>;
    declare is_active: CreationOptional<number>;
    declare is_featured: CreationOptional<number>;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    static initialize(sequelize: Sequelize): void {
        Gallery.init(
            {
                id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                gallery_name: { type: DataTypes.STRING(1000), allowNull: false },
                description: { type: DataTypes.TEXT('long'), allowNull: true },
                slug: { type: DataTypes.STRING(500), allowNull: true },
                gallery_date: { type: DataTypes.DATEONLY, allowNull: true },
                gallery_images: { type: DataTypes.TEXT, allowNull: true },
                gallery_thumbnail: { type: DataTypes.STRING(300), allowNull: true },
                is_active: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                is_featured: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                created_at: DataTypes.DATE,
                updated_at: DataTypes.DATE,
            },
            {
                sequelize,
                tableName: 'galleries',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            },
        );
    }
}
