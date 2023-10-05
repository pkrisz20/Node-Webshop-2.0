const { db } = require("../config/db-connection");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const { numberWithCommas, setMomentLocale, capitalizeFirstLetter } = require("../helpers/globalFunctions");
const languageHandler = require("../helpers/languageHandler");
const moment = require("moment");
const formatDateByLang = require("../helpers/formatDateByLocale");

const handleSearch = (req, res) => {
    let { keywords } = req.query;
    const lang = req.session.lang;
    var { DB_CONFIG } = req;

    // Redirect if something is fishy with the query param
    if ( typeof keywords !== "string" || keywords.length === 0 ) {
        return res.redirect(`/${ lang ?? process.env.FALLBACK_LANG }`);
    }
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

    var metas = {
        title: languageHandler("general.search", lang),
        type: "website",
        url: `${ process.env.APP_URL }/${ lang }/search?keywords=${ keywords }`,
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the search page",
        // keywords: []
    };

    let galleryFound = {
        count: 0,
        results: []
    };
    let productsFound = {
        count: 0,
        results: []
    };
    let blogsFound = {
        count: 0,
        results: []
    };

    let searchProductsQuery = "SELECT products.id, products.name, products.slug, products.image_thumbnail, products.price, products.discount_value, products.is_available, products.is_delivered, categories.name AS 'category_name' FROM products INNER JOIN categories ON products.category_id = categories.id WHERE products.is_active = ? AND (";
    let words = keywords.split(' ');
    let formattedParams = '';

    if (words.length === 1) {
        searchProductsQuery += `json_extract(products.name, '$.${ lang }') LIKE ?)`;
    }
    else if (words.length > 1) {
        for (let index = 0; index < words.length; index++) {
            formattedParams += index === words.length - 1 ? `json_extract(products.name, '$.${ lang }') LIKE ?)` : `json_extract(products.name, '$.${ lang }') LIKE ? OR `;
        }

        searchProductsQuery += formattedParams;
    }

    // Add percentage to the keywords
    words = words.map(item => `%${ item }%`);

    // const searchCategoriesQuery = "SELECT categories.id, categories.name, categories.icon FROM categories WHERE json_extract(categories.name, ?) LIKE ?";

    db.query(searchProductsQuery, [1, ...words], (err_product, product_result) => {
        if (err_product) {
            console.log(err_product);
            return res.status(500).render("500", {
                title: languageHandler("errors.server_error", lang ?? process.env.FALLBACK_LANG),
                current_locale: lang ?? process.env.FALLBACK_LANG,
                back_to_home: languageHandler("general.back_to_home", lang ?? process.env.FALLBACK_LANG),
                learn_more: languageHandler("general.information", lang ?? process.env.FALLBACK_LANG),
                csrfToken: req.csrfToken()
            });
        }

        else if (product_result) {

            product_result.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    name: getValueByLanguage(element.name, lang),
                    slug: element.slug,
                    image: imagePathConverter(element.image_thumbnail, "products"),
                    price: numberWithCommas(element.price),
                    isOnDiscount: Boolean(element.discount_value),
                    discount: element.discount_value != null ? numberWithCommas(element.discount_value) : null,
                    isAvailable: Boolean(element.is_available),
                    isPostable: Boolean(element.is_delivered),
                    category: getValueByLanguage(element.category_name, lang)
                }

                productsFound.results.push(tempObject);
            });

            productsFound.count = productsFound.results.length;

            let blogsQuery = "SELECT blogs.id, blogs.title, blogs.slug, blogs.short_description, blogs.image_thumbnail, blogs.date, blogs.author, (SELECT COUNT(blog_comments.id) FROM blog_comments WHERE blog_comments.blog_id = blogs.id) AS 'comments_count' FROM blogs WHERE blogs.is_active = ? AND (";

            // clear the formatting
            formattedParams = '';

            if (words.length === 1) {
                blogsQuery += `json_extract(blogs.title, '$.${ lang }') LIKE ?)`;
            }
            else if (words.length > 1) {
                for (let index = 0; index < words.length; index++) {
                    formattedParams += index === words.length - 1 ? `json_extract(blogs.title, '$.${ lang }') LIKE ?)` : `json_extract(blogs.title, '$.${ lang }') LIKE ? OR `;
                }

                blogsQuery += formattedParams;
            }

            db.query(blogsQuery, [1, ...words], (err_blog, blog_result) => {
                if (err_blog) {
                    console.log(err_blog);
                    return res.status(500).render("500", {
                        title: languageHandler("errors.server_error", lang ?? process.env.FALLBACK_LANG),
                        current_locale: lang ?? process.env.FALLBACK_LANG,
                        back_to_home: languageHandler("general.back_to_home", lang ?? process.env.FALLBACK_LANG),
                        learn_more: languageHandler("general.information", lang ?? process.env.FALLBACK_LANG),
                        csrfToken: req.csrfToken()
                    });
                }

                else if (blog_result) {

                    blog_result.forEach(element => {
                        let tempObject = {
                            id: parseInt(element.id),
                            title: getValueByLanguage(element.title, lang),
                            slug: element.slug,
                            shortDescription: getValueByLanguage(element.short_description, lang),
                            image: imagePathConverter(element.image_thumbnail, "blogs"),
                            author: element.author,
                            fullDate: element.date,
                            commentsCount: element.comments_count
                        }

                        blogsFound.results.push(tempObject);
                    });

                    setMomentLocale(lang);

                    blogsFound.results = blogsFound.results.map(item => {
                        return {
                            ...item,
                            fullDate: formatDateByLang(item.fullDate, lang ?? process.env.FALLBACK_LANG),
                            relativeDate: capitalizeFirstLetter(moment(item.fullDate, "YYYY-MM-DD").fromNow())
                        };
                    });

                    blogsFound.count = blogsFound.results.length;

                    let galleryQuery = "SELECT galleries.id, galleries.gallery_name, galleries.slug, galleries.gallery_date, galleries.gallery_thumbnail, categories.name AS 'category_name' FROM galleries, categories WHERE (galleries.is_active = ? AND galleries.category_id = categories.id) AND (";

                    // clear the formatting
                    formattedParams = '';

                    if (words.length === 1) {
                        galleryQuery += `json_extract(galleries.gallery_name, '$.${ lang }') LIKE ?)`;
                    }
                    else if (words.length > 1) {
                        for (let index = 0; index < words.length; index++) {
                            formattedParams += index === words.length - 1 ? `json_extract(galleries.gallery_name, '$.${ lang }') LIKE ?)` : `json_extract(galleries.gallery_name, '$.${ lang }') LIKE ? OR `;
                        }

                        galleryQuery += formattedParams;
                    }

                    db.query(galleryQuery, [1, ...words], (err_gallery, gallery_result) => {
                        if (err_gallery) {
                            console.log(err_gallery);
                            return res.status(500).render("500", {
                                title: languageHandler("errors.server_error", lang ?? process.env.FALLBACK_LANG),
                                current_locale: lang ?? process.env.FALLBACK_LANG,
                                back_to_home: languageHandler("general.back_to_home", lang ?? process.env.FALLBACK_LANG),
                                learn_more: languageHandler("general.information", lang ?? process.env.FALLBACK_LANG),
                                csrfToken: req.csrfToken()
                            });
                        }

                        else if (gallery_result) {
                            gallery_result.forEach(element => {
                                let tempObject = {
                                    id: parseInt(element.id),
                                    name: getValueByLanguage(element.gallery_name, lang),
                                    slug: element.slug,
                                    thumbnailImage: imagePathConverter(element.gallery_thumbnail, "gallery"),
                                    date: formatDateByLang(element.gallery_date, lang ?? process.env.FALLBACK_LANG),
                                    category: getValueByLanguage(element.category_name, lang)
                                }

                                galleryFound.results.push(tempObject);
                            });

                            galleryFound.results = galleryFound.results.map(item => {
                                return {
                                    ...item,
                                    date: item.date.toLowerCase(),
                                    category: capitalizeFirstLetter(item.category)
                                };
                            });

                            galleryFound.count = galleryFound.results.length;

                            // Remove percentage from the keywords
                            words = words.map(item => item.replaceAll('%', ''));

                            return res.render("pages/search", {
                                productsFound: productsFound,
                                blogsFound: blogsFound,
                                galleryFound: galleryFound,
                                keywords: words.join(' '),
                                meta: metas,
                                current_locale: req.session.lang,
                                cart: cart,
                                locales: ['hu', 'sr', 'en'],
                                languageHandler: languageHandler,
                                DB_CONFIG: DB_CONFIG,
                                csrfToken: req.csrfToken()
                            });
                        }
                    });
                }
            });
        }
    });
}

module.exports = { handleSearch };
