const { db } = require("../config/db-config");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const moment = require("moment");
const { setMomentLocale, capitalizeFirstLetter } = require("../helpers/globalFunctions");
const languageHandler = require("../helpers/languageHandler");
const { getCartItems } = require("../helpers/getCartItems");

const getData = (req, res) => {
    let cart = getCartItems(req, res);
    console.log("variable", cart);
    console.log("function", getCartItems(req, res))
    let products = [];
    let sliders = [];
    var galleries = [];
    var blogs = [];
    var categories = [];
    var lang = req.session.lang;
    var metas = {
        title: languageHandler("nav.home", lang),
        type: "article",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the home page",
        // keywords: []
    };

    // PRODUCTS
    const sqlQueryProducts = "SELECT id, name, image_thumbnail, price, discount_value, is_available, is_delivered, max_order_count FROM products WHERE is_active = ? AND is_featured = ?";
    // BLOGS
    const sqlQueryBlogs = "SELECT blogs.id, blogs.title, blogs.short_description, blogs.image_thumbnail, blogs.date, blogs.author, (SELECT COUNT(blog_comments.id) FROM blog_comments WHERE blog_comments.blog_id = blogs.id) AS 'comments_count' FROM blogs WHERE blogs.is_active = ? AND blogs.is_featured = ?";
    // GALLERIES
    const sqlQueryGallery = "SELECT galleries.id, galleries.gallery_name, galleries.gallery_thumbnail, categories.name AS 'category_name' FROM galleries, categories WHERE galleries.is_active = ? AND galleries.is_featured = ? AND galleries.id = categories.id";
    // HEROS
    const sqlQuerySliders = "SELECT id, title, subtitle, target_page, image, link, button_text FROM hero WHERE is_active = ?";
    // CATEGORIES
    const sqlQueryCategories = "SELECT id, name, icon FROM categories";

    setMomentLocale(lang);

    db.query(sqlQueryProducts, [1, 1], (product_err, product_items) => {
        if (product_err) {
            console.log(product_err);
            return res.status(500).render("500", { current_locale: req.session.lang });
        }

        else if (product_items.length > 0) {
            product_items.forEach(product_element => {
                let tempObjectProduct = {
                    id: parseInt(product_element.id),
                    name: getValueByLanguage(product_element.name, lang),
                    image: imagePathConverter(product_element.image_thumbnail, "products"),
                    price: product_element.price,
                    isOnDiscount: Boolean(product_element.discount_value),
                    discount: product_element.discount_value,
                    isAvailable: Boolean(product_element.is_available),
                    isPostable: Boolean(product_element.is_delivered),
                    maxQuantity: parseInt(product_element.max_order_count)
                }

                products.push(tempObjectProduct);
            });

            db.query(sqlQueryBlogs, [1, 1], (blog_err, blog_data) => {
                if (blog_err) {
                    console.log(blog_err);
                    return res.status(500).render("500", { current_locale: req.session.lang });
                }

                else if (blog_data.length > 0) {

                    blog_data.forEach(blog_element => {
                        let tempObjectBlog = {
                            id: parseInt(blog_element.id),
                            title: getValueByLanguage(blog_element.title, lang),
                            shortDescription: getValueByLanguage(blog_element.short_description, lang),
                            image: imagePathConverter(blog_element.image_thumbnail, "blogs"),
                            author: blog_element.author,
                            fullDate: blog_element.date,
                            commentsCount: blog_element.comments_count
                        }

                        blogs.push(tempObjectBlog);
                    });

                    blogs = blogs.map(item => {
                        return {
                            ...item,
                            fullDate: moment(item.fullDate).format("YYYY MMMM DD."),
                            relativeDate: capitalizeFirstLetter(moment(item.fullDate, "YYYY-MM-DD").fromNow())
                        };
                    });

                    db.query(sqlQuerySliders, 1, (hero_err, heros_data) => {
                        if (hero_err) {
                            console.log(hero_err);
                            return res.status(500).render("500", { current_locale: req.session.lang });
                        }

                        else if (heros_data.length > 0) {
                            heros_data.forEach(hero_element => {
                                let tempObjectSlider = {
                                    id: parseInt(hero_element.id),
                                    text: getValueByLanguage(hero_element.title, lang),
                                    subText: getValueByLanguage(hero_element.subtitle, lang),
                                    image: imagePathConverter(hero_element.image, "heros"),
                                    link: getValueByLanguage(hero_element.link, lang),
                                    button: getValueByLanguage(hero_element.button_text, lang),
                                    targetPage: hero_element.target_page ?? "blank"
                                }

                                sliders.push(tempObjectSlider);
                            });

                            db.query(sqlQueryGallery, [1, 1], (gallery_err, gallery_data) => {
                                if (gallery_err) {
                                    console.log(gallery_err);
                                    return res.status(500).render("500", { current_locale: req.session.lang });
                                }

                                else if (gallery_data.length > 0) {

                                    gallery_data.forEach(gallery_element => {
                                        let tempObjectGallery = {
                                            id: parseInt(gallery_element.id),
                                            name: getValueByLanguage(gallery_element.gallery_name, lang),
                                            source: imagePathConverter(gallery_element.gallery_thumbnail, "gallery"),
                                            category: getValueByLanguage(gallery_element.category_name, lang)
                                        }

                                        galleries.push(tempObjectGallery);
                                    });

                                    galleries = galleries.map(item => {
                                        return {
                                            ...item,
                                            category: capitalizeFirstLetter(item.category)
                                        };
                                    });

                                    db.query(sqlQueryCategories, (category_err, category_data) => {
                                        if (category_err) {
                                            console.log(category_err);
                                            return res.status(500).render("500", { meta: metas });
                                        }

                                        else if (category_data.length > 0) {
                                            category_data.forEach(category_element => {
                                                let tempObjectCategory = {
                                                    id: parseInt(category_element.id),
                                                    name: getValueByLanguage(category_element.name, lang),
                                                    icon: imagePathConverter(category_element.icon, "categories")
                                                }

                                                categories.push(tempObjectCategory);
                                            });
                                        }

                                        console.log(cart);

                                        return res.render("home", {
                                            heros: sliders ?? [],
                                            galleries: galleries ?? [],
                                            blogs: blogs ?? [],
                                            products: products ?? [],
                                            categories: categories ?? [],
                                            meta: metas,
                                            current_locale: req.session.lang,
                                            cart: cart,
                                            locales: ['hu', 'sr', 'en'],
                                            languageHandler: languageHandler
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

module.exports = { getData };
