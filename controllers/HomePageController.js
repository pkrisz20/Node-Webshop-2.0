const DoDatabaseQuery = require("../helpers/databaseQueryHelper");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const moment = require("moment");
const metaDefault = require('../config/meta');
const gdprCookies = require('../config/gdpr');
const errorHandler = require('../middleware/errorHandler');
const { setMomentLocale, capitalizeFirstLetter, numberWithCommas, limitText } = require("../helpers/globalFunctions");
const languageHandler = require("../helpers/languageHandler");
const formatDateByLang = require("../helpers/formatDateByLocale");
const { getSlug } = require("../helpers/admin/slugHelper");

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
    var { DB_CONFIG } = req;
    let products = [];
    let sliders = [];
    var galleries = [];
    var blogs = [];
    var showGalleriesSection;
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

    // PRODUCTS
    const sqlQueryProducts = "SELECT id, name, slug, short_description, image_thumbnail, price, discount_value, discount_end_date, is_available, is_delivered, is_new, max_order_count FROM products WHERE is_active = ? AND is_featured = ? ORDER BY id DESC";
    // BLOGS
    const sqlQueryBlogs = "SELECT blogs.id, blogs.title, blogs.slug, blogs.short_description, blogs.image_thumbnail, blogs.date, blogs.is_important, blogs.author, (SELECT COUNT(blog_comments.id) FROM blog_comments WHERE blog_comments.blog_id = blogs.id) AS 'comments_count' FROM blogs WHERE blogs.is_active = ? AND blogs.is_featured = ? ORDER BY blogs.date DESC";
    // GALLERIES
    const sqlQueryGallery = "SELECT galleries.id, galleries.gallery_name, galleries.slug, galleries.gallery_thumbnail FROM galleries WHERE galleries.is_active = ? AND galleries.is_featured = ? ORDER BY galleries.gallery_date DESC";
    // HEROS
    const sqlQuerySliders = "SELECT id, title, subtitle, target_page, image, link, button_text FROM heros WHERE is_active = ? ORDER BY id DESC";

    setMomentLocale(lang);

    try {
        const product_items = await DoDatabaseQuery(sqlQueryProducts, [1, 1]);

        if (product_items.length > 0) {
            product_items.forEach(product_element => {
                let tempObjectProduct = {
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

                products.push(tempObjectProduct);
            });

            let productIdsInCart = cart?.items?.map(item => item.productId);

            products?.forEach(resultItem => {

                resultItem.already_in_cart = productIdsInCart.includes(resultItem.id);
                resultItem.saved_in_wishlist = wishlist.includes(resultItem.id);
            });
        }

        const blog_data = await DoDatabaseQuery(sqlQueryBlogs, [1, 1]);

        if (blog_data.length > 0) {

            blog_data.forEach(blog_element => {
                let tempObjectBlog = {
                    id: parseInt(blog_element.id),
                    title: getValueByLanguage(blog_element.title, lang),
                    slug: getSlug(blog_element.slug, lang),
                    shortDescription: getValueByLanguage(blog_element.short_description, lang),
                    image: imagePathConverter(blog_element.image_thumbnail, "blogs"),
                    author: blog_element.author,
                    fullDate: blog_element.date,
                    commentsCount: blog_element.comments_count,
                    isImportant: Boolean(blog_element.is_important) ?? false
                }

                blogs.push(tempObjectBlog);
            });

            blogs = blogs.map(item => {
                return {
                    ...item,
                    fullDate: formatDateByLang(item.fullDate, lang ?? process.env.FALLBACK_LANG),
                    relativeDate: capitalizeFirstLetter(moment(item.fullDate, "YYYY-MM-DD").fromNow()),
                    shortDescription: item.shortDescription ? limitText(item.shortDescription) : null
                };
            });
        }

        const heros_data = await DoDatabaseQuery(sqlQuerySliders, [1]);

        if (heros_data.length > 0) {
            heros_data.forEach(hero_element => {
                let tempObjectSlider = {
                    id: parseInt(hero_element.id),
                    text: getValueByLanguage(hero_element.title, lang),
                    subText: getValueByLanguage(hero_element.subtitle, lang),
                    image: imagePathConverter(hero_element.image, "heros"),
                    link: getValueByLanguage(hero_element.link, lang),
                    button: getValueByLanguage(hero_element.button_text, lang),
                    targetPage: hero_element.target_page ?? "_blank"
                }

                sliders.push(tempObjectSlider);
            });
        }

        const gallery_data = await DoDatabaseQuery(sqlQueryGallery, [1, 1]);

        if (gallery_data.length > 0) {

            gallery_data.forEach(gallery_element => {
                let tempObjectGallery = {
                    id: parseInt(gallery_element.id),
                    name: getValueByLanguage(gallery_element.gallery_name, lang),
                    slug: getSlug(gallery_element.slug, lang),
                    source: imagePathConverter(gallery_element.gallery_thumbnail, "galleries"),
                }

                galleries.push(tempObjectGallery);
            });

            showGalleriesSection = galleries.some(gallery => gallery.source !== null);
        }

        return res.render("home", {
            heros: sliders ?? [],
            galleries: galleries ?? [],
            showGalleriesSection: showGalleriesSection ?? false,
            blogs: blogs ?? [],
            products: products ?? [],
            meta: metas,
            current_locale: req.session.lang,
            cart: cart,
            locales: ['hu', 'sr', 'en'],
            languageHandler: languageHandler,
            DB_CONFIG: DB_CONFIG,
            webshopCategories: req.webshopCategories ?? [],
            staticContent: req.static_content,
            wishlistTotalNumber: req.wishlistTotalNumber,
            showPopupCartInformation: req.session.showPopupCartInformation,
            gdprCookies: gdprCookies,
            gdprAcceptedCookies: JSON.parse(req.cookies['allowed_cookie_types'] ?? '[]'),
            csrfToken: req.csrfToken()
        });
    }
    catch (error) {
        return errorHandler(error, req, res, 'homePageController');
    }
}

module.exports = { getData };
