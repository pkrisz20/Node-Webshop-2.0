import { Database } from '../database/Database';
import { Article } from './Article';
import { ArticleComment } from './ArticleComment';
import { Config } from './Config';
import { ContactMessage } from './ContactMessage';
import { Employee } from './Employee';
import { FAQ } from './FAQ';
import { Gallery } from './Gallery';
import { Log } from './Log';
import { Order } from './Order';
import { OrderDetail } from './OrderDetail';
import { Product } from './Product';
import { ProductComment } from './ProductComment';
import { ProductParameter } from './ProductParameter';
import { Slider } from './Slider';
import { StaticContent } from './StaticContent';
import { WebshopCategory } from './WebshopCategory';
import { WebshopParameter } from './WebshopParameter';

const models = [
    Article,
    ArticleComment,
    Config,
    ContactMessage,
    Employee,
    FAQ,
    Gallery,
    Log,
    Order,
    OrderDetail,
    Product,
    ProductComment,
    ProductParameter,
    Slider,
    StaticContent,
    WebshopCategory,
    WebshopParameter,
];

/**
 * The foreign keys are owned by the migrations (database/migrations), the referential actions here mirror them.
 * Both sides of a relation get the same options, so the two definitions of the foreign key can not differ.
 */
function registerAssociations(): void {
    const cascade = { onDelete: 'CASCADE', onUpdate: 'CASCADE' } as const;
    const restrict = { onDelete: 'RESTRICT', onUpdate: 'RESTRICT' } as const;

    // blog_comments.blog_id -> blogs.id
    Article.hasMany(ArticleComment, { foreignKey: 'blog_id', as: 'comments', ...cascade });
    ArticleComment.belongsTo(Article, { foreignKey: 'blog_id', as: 'article', ...cascade });

    // products.category_id -> categories.id, a category with products can not be deleted
    WebshopCategory.hasMany(Product, { foreignKey: 'category_id', as: 'products', ...restrict });
    Product.belongsTo(WebshopCategory, { foreignKey: 'category_id', as: 'category', ...restrict });

    // product_comments.product_id -> products.id
    Product.hasMany(ProductComment, { foreignKey: 'product_id', as: 'comments', ...cascade });
    ProductComment.belongsTo(Product, { foreignKey: 'product_id', as: 'product', ...cascade });

    // product_parameters: pivot of products and parameters, with its own id and the value of the parameter
    Product.belongsToMany(WebshopParameter, {
        // The pivot table has no unique key on (product_id, parameter_id)
        through: { model: ProductParameter, unique: false },
        foreignKey: 'product_id',
        otherKey: 'parameter_id',
        as: 'parameters',
        ...cascade,
    });
    WebshopParameter.belongsToMany(Product, {
        through: { model: ProductParameter, unique: false },
        foreignKey: 'parameter_id',
        otherKey: 'product_id',
        as: 'products',
        ...cascade,
    });
    Product.hasMany(ProductParameter, { foreignKey: 'product_id', as: 'parameterValues', ...cascade });
    WebshopParameter.hasMany(ProductParameter, { foreignKey: 'parameter_id', as: 'productValues', ...cascade });
    ProductParameter.belongsTo(Product, { foreignKey: 'product_id', as: 'product', ...cascade });
    ProductParameter.belongsTo(WebshopParameter, { foreignKey: 'parameter_id', as: 'parameter', ...cascade });

    // order_details.order_id -> orders.order_id, order_details.product_id -> products.id
    Order.hasMany(OrderDetail, { foreignKey: 'order_id', as: 'details', ...cascade });
    OrderDetail.belongsTo(Order, { foreignKey: 'order_id', as: 'order', ...cascade });
    Product.hasMany(OrderDetail, { foreignKey: 'product_id', as: 'orderDetails', ...cascade });
    OrderDetail.belongsTo(Product, { foreignKey: 'product_id', as: 'product', ...cascade });
}

models.forEach(model => model.initialize(Database.sequelize));
registerAssociations();

export {
    Article,
    ArticleComment,
    Config,
    ContactMessage,
    Employee,
    FAQ,
    Gallery,
    Log,
    Order,
    OrderDetail,
    Product,
    ProductComment,
    ProductParameter,
    Slider,
    StaticContent,
    WebshopCategory,
    WebshopParameter,
};

export { LOG_TYPES, type LogType } from './Log';
