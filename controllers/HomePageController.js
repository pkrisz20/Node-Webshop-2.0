const { db } = require("../config/db-config");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const moment = require("moment");
const { setMomentLocale, capitalizeFirstLetter } = require("../helpers/globalFunctions");
const i18Next = require("i18next");

const getData = (req, res) => {
    const { lang } = req;
    let datas = {
        products: [],
        sliders: [],
        galleries: [],
        blogs: [],
        title: "Home",
        description: "This is the home page",
        lang: i18Next.language ?? "en"
    };

    datas.lang = "en";

    // if (!lang) {
    //     return res.status(400).render('not-found');
    // }

    // PRODUCTS
    const sqlQueryProducts = "SELECT id, name, image_thumbnail, price, discount_value, is_available, is_delivered, max_order_count FROM products WHERE is_active = ? AND is_featured = ?";

    db.query(sqlQueryProducts, [1, 1], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).render("500", datas);
        }

        else if (data.length > 0) {
            data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    name: getValueByLanguage(element.name, lang),
                    image: imagePathConverter(element.image_thumbnail, "products"),
                    price: element.price,
                    isOnDiscount: Boolean(element.discount_value),
                    discount: element.discount_value,
                    isAvailable: Boolean(element.is_available),
                    isPostable: Boolean(element.is_delivered),
                    maxQuantity: parseInt(element.max_order_count)
                }

                datas.products.push(tempObject);
            });
        }
    });

    // BLOGS
    const sqlQueryBlogs = "SELECT blogs.id, blogs.title, blogs.short_description, blogs.image_thumbnail, blogs.date, blogs.author, (SELECT COUNT(blog_comments.id) FROM blog_comments WHERE blog_comments.blog_id = blogs.id) AS 'comments_count' FROM blogs WHERE blogs.is_active = ? AND blogs.is_featured = ?";

    db.query(sqlQueryBlogs, [1, 1], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).render("500", datas);
        }

        else if (data.length > 0) {
            setMomentLocale(lang);

            data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    title: getValueByLanguage(element.title, lang),
                    shortDescription: getValueByLanguage(element.short_description, lang),
                    image: imagePathConverter(element.image_thumbnail, "blogs"),
                    author: element.author,
                    fullDate: element.date,
                    commentsCount: element.comments_count
                }

                datas.blogs.push(tempObject);
            });

            datas.blogs = datas.blogs.map(item => {
                return {
                    ...item,
                    fullDate: moment(item.fullDate).format("YYYY MMMM DD."),
                    relativeDate: capitalizeFirstLetter(moment(item.fullDate, "YYYY-MM-DD").fromNow())
                };
            });
        }
    });

    // HERO ITEMS
    const sqlQuerySliders = "SELECT id, title, subtitle, target_page, image, link, button_text FROM hero WHERE is_active = ?";

    db.query(sqlQuerySliders, 1, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).render("500", datas);
        }

        else if (data.length > 0) {
            data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    text: getValueByLanguage(element.title, lang),
                    subText: getValueByLanguage(element.subtitle, lang),
                    image: imagePathConverter(element.image, "heros"),
                    link: getValueByLanguage(element.link, lang),
                    button: getValueByLanguage(element.button_text, lang),
                    targetPage: element.target_page ?? "blank"
                }

                datas.sliders.push(tempObject);
            });
        }
    });

    // GALLERY ITEMS
    const sqlQueryGallery = "SELECT galleries.id, galleries.gallery_name, galleries.gallery_thumbnail, categories.name AS 'category_name' FROM galleries, categories WHERE galleries.is_active = ? AND galleries.is_featured = ? AND galleries.id = categories.id";

    db.query(sqlQueryGallery, [1, 1], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).render("500", datas);
        }

        else if (data.length > 0) {
            setMomentLocale(lang);

            data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    name: getValueByLanguage(element.gallery_name, lang),
                    source: imagePathConverter(element.gallery_thumbnail, "gallery"),
                    category: getValueByLanguage(element.category_name, lang)
                }

                datas.galleries.push(tempObject);
            });

            datas.galleries = datas.galleries.map(item => {
                return {
                    ...item,
                    category: capitalizeFirstLetter(item.category)
                };
            });
        }
    });

    res.render("home", { datas });
}

module.exports = { getData };
