import {
    DataTypes,
    Model,
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    type NonAttribute,
    type ProjectionAlias,
    type Sequelize,
} from 'sequelize';
import type { ArticleComment } from './ArticleComment';

export class Article extends Model<InferAttributes<Article>, InferCreationAttributes<Article>> {
    declare id: CreationOptional<number>;
    declare title: string;
    declare slug: CreationOptional<string | null>;
    declare date: CreationOptional<string | null>;
    declare images: CreationOptional<string | null>;
    declare image_thumbnail: CreationOptional<string | null>;
    declare author: CreationOptional<string | null>;
    declare short_description: CreationOptional<string | null>;
    declare description: CreationOptional<string | null>;
    declare is_active: CreationOptional<number>;
    declare is_featured: CreationOptional<number>;
    declare is_important: CreationOptional<number>;
    declare comments_allowed: CreationOptional<number>;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    declare comments?: NonAttribute<ArticleComment[]>;

    /** Attributes needed to render an article card */
    static readonly CARD_ATTRIBUTES = [
        'id',
        'title',
        'slug',
        'short_description',
        'image_thumbnail',
        'date',
        'is_important',
        'author',
    ] as const satisfies ReadonlyArray<keyof InferAttributes<Article>>;

    /** Select attribute counting every comment of the article, read back with `getCommentsCount()` */
    static commentsCountAttribute(): ProjectionAlias {
        return [
            Article.sequelize!.literal('(SELECT COUNT(blog_comments.id) FROM blog_comments WHERE blog_comments.blog_id = Article.id)'),
            'comments_count',
        ];
    }

    getCommentsCount(): number {
        return Number(this.get('comments_count') ?? 0);
    }

    static initialize(sequelize: Sequelize): void {
        Article.init(
            {
                id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                title: { type: DataTypes.STRING(1000), allowNull: false },
                slug: { type: DataTypes.STRING(500), allowNull: true },
                date: { type: DataTypes.DATEONLY, allowNull: true },
                images: { type: DataTypes.STRING(1000), allowNull: true },
                image_thumbnail: { type: DataTypes.STRING(300), allowNull: true },
                author: { type: DataTypes.STRING(100), allowNull: true },
                short_description: { type: DataTypes.STRING(3000), allowNull: true },
                description: { type: DataTypes.TEXT('long'), allowNull: true },
                is_active: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                is_featured: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                is_important: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                comments_allowed: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                created_at: DataTypes.DATE,
                updated_at: DataTypes.DATE,
            },
            {
                sequelize,
                tableName: 'blogs',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            },
        );
    }
}
