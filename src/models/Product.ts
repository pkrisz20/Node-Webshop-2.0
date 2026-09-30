import {
    DataTypes,
    Model,
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    type NonAttribute,
    type Sequelize,
} from 'sequelize';
import type { ProductComment } from './ProductComment';
import type { ProductParameter } from './ProductParameter';
import type { WebshopCategory } from './WebshopCategory';
import type { WebshopParameter } from './WebshopParameter';

export class Product extends Model<InferAttributes<Product>, InferCreationAttributes<Product>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare slug: CreationOptional<string | null>;
    declare short_description: CreationOptional<string | null>;
    declare description: CreationOptional<string | null>;
    declare images: CreationOptional<string | null>;
    declare image_thumbnail: CreationOptional<string | null>;
    declare price: number;
    declare discount_value: CreationOptional<number | null>;
    /** A "YYYY-MM-DD" string is also accepted when saving */
    declare discount_end_date: CreationOptional<Date | string | null>;
    declare is_active: CreationOptional<number>;
    declare is_featured: CreationOptional<number>;
    declare is_available: CreationOptional<number>;
    declare is_delivered: CreationOptional<number>;
    declare is_new: CreationOptional<number>;
    declare max_order_count: CreationOptional<number | null>;
    declare comments_allowed: CreationOptional<number>;
    declare category_id: number;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    declare category?: NonAttribute<WebshopCategory>;
    declare comments?: NonAttribute<ProductComment[]>;
    declare parameters?: NonAttribute<WebshopParameter[]>;
    declare parameterValues?: NonAttribute<ProductParameter[]>;

    /** Attributes needed to render a product card */
    static readonly CARD_ATTRIBUTES = [
        'id',
        'name',
        'slug',
        'short_description',
        'image_thumbnail',
        'price',
        'discount_value',
        'discount_end_date',
        'is_available',
        'is_delivered',
        'is_new',
        'max_order_count',
    ] as const satisfies ReadonlyArray<keyof InferAttributes<Product>>;

    /** A discount is active when it has a value and its end date (if any) is in the future */
    hasActiveDiscount(): boolean {
        if (this.discount_value === null || this.discount_value === undefined) {
            return false;
        }

        return !this.discount_end_date || new Date(this.discount_end_date).getTime() > Date.now();
    }

    getEffectivePrice(): number {
        return this.hasActiveDiscount() ? Number(this.discount_value) : Number(this.price);
    }

    isOrderable(): boolean {
        return this.is_active === 1 && this.is_available === 1;
    }

    static initialize(sequelize: Sequelize): void {
        Product.init(
            {
                id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                name: { type: DataTypes.STRING(1000), allowNull: false },
                slug: { type: DataTypes.STRING(500), allowNull: true },
                short_description: { type: DataTypes.STRING(3000), allowNull: true },
                description: { type: DataTypes.TEXT('long'), allowNull: true },
                images: { type: DataTypes.STRING(1000), allowNull: true },
                image_thumbnail: { type: DataTypes.STRING(300), allowNull: true },
                price: { type: DataTypes.FLOAT(100, 2), allowNull: false },
                discount_value: { type: DataTypes.FLOAT(100, 2), allowNull: true },
                discount_end_date: { type: DataTypes.DATE, allowNull: true },
                is_active: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                is_featured: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                is_available: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                is_delivered: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                is_new: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                max_order_count: { type: DataTypes.INTEGER, allowNull: true },
                comments_allowed: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                category_id: { type: DataTypes.INTEGER, allowNull: false },
                created_at: DataTypes.DATE,
                updated_at: DataTypes.DATE,
            },
            {
                sequelize,
                tableName: 'products',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            },
        );
    }
}
