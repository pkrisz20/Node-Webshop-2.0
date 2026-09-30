import { Database } from '../database/Database';
import { Article } from './Article';
import { ArticleComment } from './ArticleComment';
import { Config } from './Config';
import { ContactMessage } from './ContactMessage';
import { Employee } from './Employee';
import { ErrorLog } from './ErrorLog';
import { FAQ } from './FAQ';
import { Gallery } from './Gallery';
import { Login } from './Login';
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
    ErrorLog,
    FAQ,
    Gallery,
    Login,
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

function registerAssociations(): void {
    const cascade = { onDelete: 'CASCADE', onUpdate: 'CASCADE' } as const;

    Article.hasMany(ArticleComment, { foreignKey: 'blog_id', as: 'comments', ...cascade });
    ArticleComment.belongsTo(Article, { foreignKey: 'blog_id', as: 'article' });

    WebshopCategory.hasMany(Product, { foreignKey: 'category_id', as: 'products', ...cascade });
    Product.belongsTo(WebshopCategory, { foreignKey: 'category_id', as: 'category' });

    Product.hasMany(ProductComment, { foreignKey: 'product_id', as: 'comments', ...cascade });
    ProductComment.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

    Product.belongsToMany(WebshopParameter, {
        through: ProductParameter,
        foreignKey: 'product_id',
        otherKey: 'parameter_id',
        as: 'parameters',
    });
    WebshopParameter.belongsToMany(Product, {
        through: ProductParameter,
        foreignKey: 'parameter_id',
        otherKey: 'product_id',
        as: 'products',
    });
    Product.hasMany(ProductParameter, { foreignKey: 'product_id', as: 'parameterValues', ...cascade });
    WebshopParameter.hasMany(ProductParameter, { foreignKey: 'parameter_id', as: 'productValues', ...cascade });
    ProductParameter.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
    ProductParameter.belongsTo(WebshopParameter, { foreignKey: 'parameter_id', as: 'parameter' });

    Order.hasMany(OrderDetail, { foreignKey: 'order_id', as: 'details', ...cascade });
    OrderDetail.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
    Product.hasMany(OrderDetail, { foreignKey: 'product_id', as: 'orderDetails', ...cascade });
    OrderDetail.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
}

models.forEach(model => model.initialize(Database.sequelize));
registerAssociations();

export {
    Article,
    ArticleComment,
    Config,
    ContactMessage,
    Employee,
    ErrorLog,
    FAQ,
    Gallery,
    Login,
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
