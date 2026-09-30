const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const moment = require("moment");
const metaDefault = require('../config/meta');
const errorHandler = require('../middleware/errorHandler');
const { setMomentLocale, capitalizeFirstLetter, numberWithCommas, limitText } = require("../helpers/globalFunctions");
const languageHandler = require("../helpers/languageHandler");
const dateTimeHelper = require("../helpers/dateTimeHelper");
const { getSlug } = require("../helpers/admin/slugHelper");
const { sequelize, Product, Article, Slider, Gallery } = require("../models");

const getData = async (req, res) => {
    // Cart converting stuffs
    var cart = {
        items: req.session.cart ?? [],
        totalCount: req.session.totalCount,
        totalPrice: numberWithCommas(req.session.totalPrice)
    };
    cart.items = cart.items.map(item => {
        return {
            ...item,
            price: numberWithCommas(item.price)
        }
    });

    var wishlist = req.session.wishlist ?? [];
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    var metas = {
        ...metaDefault,
        lang: metaDefault.langs[lang],
        title: languageHandler("nav.home", lang) + metaDefault['separator'] + metaDefault['title'],
        type: metaDefault["og:type"],
        url: `${ process.env.APP_URL }/${ lang }`,
        image: {
            src: metaDefault['default_og_images'],
            width: metaDefault['og:image:width'],
            height: metaDefault['og:image:height'],
        },
        description: languageHandler('meta.description', lang),
    };

    setMomentLocale(lang);

    try {
        const product_items = await Product.findAll({
            where: {
              is_active: 1,
              is_featured: 1,
            },
            attributes: [
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
            ],
            order: [['id', 'DESC']],
        });

        if (product_items.length > 0) {
            var products = product_items.map(product_element => {
                return {
                    id: parseInt(product_element.id),
                    name: getValueByLanguage(product_element.name, lang),
                    slug: getSlug(product_element.slug, lang),
                    short: product_element.short_description ? limitText(getValueByLanguage(product_element.short_description, lang)) : null,
                    image: imagePathConverter(product_element.image_thumbnail, "products"),
                    price: numberWithCommas(product_element.price),
                    discountEndDate: product_element.discount_end_date ? moment(product_element.discount_end_date).format("YYYY-MM-DD") : null,
                    isOnDiscount: Boolean(product_element.discount_value),
                    discount: product_element.discount_value != null ? numberWithCommas(product_element.discount_value) : null,
                    isAvailable: Boolean(product_element.is_available),
                    isPostable: Boolean(product_element.is_delivered),
                    isNew: Boolean(product_element.is_new),
                    maxQuantity: parseInt(product_element.max_order_count)
                }
            });

            let productIdsInCart = cart?.items?.map(item => item.productId);
            products?.forEach(resultItem => {
                resultItem.already_in_cart = productIdsInCart.includes(resultItem.id);
                resultItem.saved_in_wishlist = wishlist.includes(resultItem.id);
            });
        }

        const blog_data = await Article.findAll({
            where: {
                is_active: 1,
                is_featured: 1,
            },
            attributes: [
                'id',
                'title',
                'slug',
                'short_description',
                'image_thumbnail',
                'date',
                'is_important',
                'author',
                [
                    sequelize.literal(`(SELECT COUNT(blog_comments.id) FROM blog_comments WHERE blog_comments.blog_id = Article.id)`),
                    'comments_count'
                ],
            ],
            order: [['date', 'DESC']],
        });

        if (blog_data.length > 0) {
            var blogs = blog_data.map(blog_element => {
                return {
                    id: parseInt(blog_element.id),
                    title: getValueByLanguage(blog_element.title, lang),
                    slug: getSlug(blog_element.slug, lang),
                    shortDescription: limitText(getValueByLanguage(blog_element.short_description ?? null, lang)),
                    image: imagePathConverter(blog_element.image_thumbnail, "blogs"),
                    author: blog_element.author,
                    fullDate: dateTimeHelper.formatDateByLang(blog_element.date, lang ?? process.env.FALLBACK_LANG),
                    relativeDate: capitalizeFirstLetter(moment(blog_element.date, "YYYY-MM-DD").fromNow()),
                    commentsCount: blog_element.dataValues.comments_count,
                    isImportant: Boolean(blog_element.is_important) ?? false
                }
            });
        }

        const heros_data = await Slider.findAll({
            attributes: [
                'id',
                'title',
                'subtitle',
                'target_page',
                'image',
                'link',
                'button_text'
            ],
            where: {
                is_active: 1
            },
            order: [['id', 'DESC']]
        });

        if (heros_data.length > 0) {
            var sliders = heros_data.map(hero_element => {
                return {
                    id: parseInt(hero_element.id),
                    text: getValueByLanguage(hero_element.title, lang),
                    subText: getValueByLanguage(hero_element.subtitle, lang),
                    image: imagePathConverter(hero_element.image, "heros"),
                    link: getValueByLanguage(hero_element.link, lang),
                    button: getValueByLanguage(hero_element.button_text, lang),
                    targetPage: hero_element.target_page ?? "_blank"
                }
            });
        }

        const gallery_data = await Gallery.findAll({
            attributes: [
                'id',
                'gallery_name',
                'slug',
                'gallery_thumbnail'
            ],
            where: {
                is_active: 1,
                is_featured: 1
            },
            order: [['gallery_date', 'DESC']]
        });

        if (gallery_data.length > 0) {
            var galleries = gallery_data.map(gallery_element => {
                return {
                    id: parseInt(gallery_element.id),
                    name: getValueByLanguage(gallery_element.gallery_name, lang),
                    slug: getSlug(gallery_element.slug, lang),
                    source: imagePathConverter(gallery_element.gallery_thumbnail, "galleries"),
                }
            });
        }

        return res.render("home", {
            heros: sliders ?? [],
            galleries: galleries ?? [],
            blogs: blogs ?? [],
            products: products ?? [],
            meta: metas,
            cart: cart,
        });
    }
    catch (error) {
        return errorHandler(error, req, res, 'homePageController', 14);
    }
}

module.exports = { getData };
