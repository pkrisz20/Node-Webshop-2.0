import {
    DataTypes,
    Model,
    type CreationOptional,
    type InferAttributes,
    type InferCreationAttributes,
    type NonAttribute,
    type Sequelize,
} from 'sequelize';
import type { Article } from './Article';

export class ArticleComment extends Model<InferAttributes<ArticleComment>, InferCreationAttributes<ArticleComment>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare email: string;
    declare comment: string;
    declare is_active: CreationOptional<number>;
    declare date: CreationOptional<Date | null>;
    declare blog_id: number;

    declare article?: NonAttribute<Article>;

    static initialize(sequelize: Sequelize): void {
        ArticleComment.init(
            {
                id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                name: { type: DataTypes.STRING(300), allowNull: false },
                email: { type: DataTypes.STRING(200), allowNull: false },
                comment: { type: DataTypes.TEXT, allowNull: false },
                is_active: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
                date: { type: DataTypes.DATE, allowNull: true },
                blog_id: { type: DataTypes.INTEGER, allowNull: false },
            },
            {
                sequelize,
                tableName: 'blog_comments',
                timestamps: false,
            },
        );
    }
}
