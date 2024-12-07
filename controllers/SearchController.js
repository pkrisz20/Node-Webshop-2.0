const DoDatabaseQuery = require("../helpers/databaseQueryHelper");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const { numberWithCommas, setMomentLocale, capitalizeFirstLetter } = require("../helpers/globalFunctions");
const languageHandler = require("../helpers/languageHandler");
const moment = require("moment");
const errorHandler = require('../middleware/errorHandler');
const dateTimeHelper = require("../helpers/dateTimeHelper");
const metaDefault = require('../config/meta');
const gdprCookies = require('../config/gdpr');
const { getSlug } = require("../helpers/admin/slugHelper");
const searchLimit = 10;

const handleSearch = async (req, res) => {
    let { keywords } = req.query;
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    var { DB_CONFIG } = req;

    // Redirect if something is fishy with the query param
    if ( typeof keywords !== "string" || keywords.length === 0 ) {
        return res.redirect(`/${ lang }`);
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
        ...metaDefault,
        title: languageHandler("general.search", lang) + metaDefault['separator'] + metaDefault['title'],
        lang: metaDefault.langs[lang],
        type: "website",
        url: `${ process.env.APP_URL }/${ lang }/` + languageHandler('slugs.search', lang) + `?keywords=${ keywords }`,
        description: languageHandler("general.search", lang) + metaDefault['separator'] + metaDefault['title'],
        image: {
            src: metaDefault['default_og_images'],
            width: metaDefault['og:image:width'],
            height: metaDefault['og:image:height'],
        },
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

    let searchProductsQuery = "SELECT products.id, products.name, products.slug, products.image_thumbnail, products.price, products.discount_value, products.discount_end_date, products.is_available, products.is_delivered, categories.name AS 'category_name' FROM products INNER JOIN categories ON products.category_id = categories.id WHERE products.is_active = ? AND (";
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

    try {
        const product_result = await DoDatabaseQuery(searchProductsQuery, [1, ...words]);

        if (product_result.length > 0) {
            product_result.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    name: getValueByLanguage(element.name, lang),
                    slug: getSlug(element.slug, lang),
                    image: imagePathConverter(element.image_thumbnail, "products") ?? '',
                    price: numberWithCommas(element.price),
                    isOnDiscount: Boolean(element.discount_value),
                    discount: element.discount_value != null ? numberWithCommas(element.discount_value) : null,
                    discountEndDate: element.discount_end_date ? moment(element.discount_end_date).format("YYYY-MM-DD") : null,
                    isAvailable: Boolean(element.is_available),
                    isPostable: Boolean(element.is_delivered),
                    category: getValueByLanguage(element.category_name, lang)
                }

                productsFound.results.push(tempObject);
            });

            productsFound.count = productsFound.results.length;
        }

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

        const blog_result = await DoDatabaseQuery(blogsQuery, [1, ...words]);

        if (blog_result.length > 0) {
            blog_result.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    title: getValueByLanguage(element.title, lang),
                    slug: getSlug(element.slug, lang),
                    shortDescription: getValueByLanguage(element.short_description, lang),
                    image: imagePathConverter(element.image_thumbnail, "blogs") ?? '',
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
                    fullDate: dateTimeHelper.formatDateByLang(item.fullDate, lang),
                    relativeDate: capitalizeFirstLetter(moment(item.fullDate, "YYYY-MM-DD").fromNow())
                };
            });

            blogsFound.count = blogsFound.results.length;
        }

        let galleryQuery = "SELECT galleries.id, galleries.gallery_name, galleries.slug, galleries.gallery_date, galleries.gallery_thumbnail FROM galleries WHERE galleries.is_active = ? AND (";

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

        const gallery_result = await DoDatabaseQuery(galleryQuery, [1, ...words]);

        if (gallery_result.length > 0) {
            gallery_result.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    name: getValueByLanguage(element.gallery_name, lang),
                    slug: getSlug(element.slug, lang),
                    thumbnailImage: imagePathConverter(element.gallery_thumbnail, "galleries") ?? '',
                    date: dateTimeHelper.formatDateByLang(element.gallery_date, lang),
                }

                galleryFound.results.push(tempObject);
            });

            galleryFound.results = galleryFound.results.map(item => {
                return {
                    ...item,
                    date: item.date.toLowerCase(),
                };
            });

            galleryFound.count = galleryFound.results.length;
        }

        // Remove percentage from the keywords
        words = words.map(item => item.replaceAll('%', ''));

        return res.render("pages/search", {
            productsFound: productsFound,
            blogsFound: blogsFound,
            galleryFound: galleryFound,
            keywords: words.join(' '),
            meta: metas,
            showPopupCartInformation: req.session.showPopupCartInformation,
            current_locale: lang,
            cart: cart,
            locales: ['hu', 'sr', 'en'],
            languageHandler: languageHandler,
            DB_CONFIG: DB_CONFIG,
            webshopCategories: req.webshopCategories,
            staticContent: req.static_content,
            wishlistTotalNumber: req.wishlistTotalNumber,
            gdprCookies: gdprCookies,
            gdprAcceptedCookies: JSON.parse(req.cookies['allowed_cookie_types'] ?? '[]'),
            csrfToken: req.csrfToken()
        });
    }
    catch (error) {
        return errorHandler(error, req, res, 'searchController');
    }
}

const ajaxSearch = async (req, res) => {
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    const { keywords } = req.body;
    let productsHtml = "";
    let blogsHtml = "";
    let galleriesHtml = "";

    let searchProductsQuery = "SELECT products.id, products.name, products.slug, products.image_thumbnail, categories.name AS 'category_name' FROM products INNER JOIN categories ON products.category_id = categories.id WHERE products.is_active = ? AND (";
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

    searchProductsQuery += ` LIMIT ${ searchLimit }`;

    // Add percentage to the keywords
    words = words.map(item => `%${ item }%`);

    try {
        const product_result = await DoDatabaseQuery(searchProductsQuery, [1, ...words]);

        if (product_result.length === 0) {
            productsHtml = `<div class="search__not-found" style="margin-bottom: 20px;">${ languageHandler('products.no_product_like_this', lang) }</div>`;
        }
        else if (product_result.length > 0) {

            product_result.forEach(element => {
                productsHtml += `
                    <a class="container_box" href="${ process.env.APP_URL }/${ lang }/` + languageHandler('slugs.product', lang) + "/" + getSlug(element.slug, lang) + "/" + element.id + `" aria-label="${ getValueByLanguage(element.name, lang) }">
                        <div class="container_box--image">
                            <picture>
                                <source srcset="${ imagePathConverter(element.image_thumbnail, "products") ?? '' }">
                                <img
                                    class="img"
                                    loading="lazy"
                                    alt="${ getValueByLanguage(element.name, lang) }"
                                    src="images/no-picture.jpg"
                                    onerror="this.onerror = null;this.parentNode.children[0].srcset = this.src;"
                                />
                            </picture>
                        </div>
                        <strong class="container_box--title">${ getValueByLanguage(element.name, lang) }</strong>
                        <strong class="container_box--category">${ getValueByLanguage(element.category_name, lang) }</strong>
                    </a>`;
            });
        }

        let blogsQuery = "SELECT blogs.id, blogs.title, blogs.slug, blogs.image_thumbnail FROM blogs WHERE blogs.is_active = ? AND (";

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

        blogsQuery += ` LIMIT ${ searchLimit }`;

        const blog_result = await DoDatabaseQuery(blogsQuery, [1, ...words]);

        if (blog_result.length === 0) {
            blogsHtml = `<div class="search__not-found" style="margin-bottom: 20px;">${ languageHandler('products.no_blogs_like_this', lang) }</div>`;
        }
        else if (blog_result.length > 0) {
            blog_result.forEach(element => {
                blogsHtml += `
                    <div style="margin-bottom: 10px;">
                        <a class="container_box" href="${ process.env.APP_URL }/${ lang }/` + languageHandler('slugs.article') + "/" + getSlug(element.slug, lang) + "/" + element.id + `" aria-label="${ getValueByLanguage(element.title, lang) }">
                            <div class="container_box--image">
                                <picture>
                                    <source srcset="${ imagePathConverter(element.image_thumbnail, "blogs") ?? '' }">
                                    <img
                                        src="images/no-picture.jpg"
                                        loading="lazy"
                                        class="img"
                                        alt="${ getValueByLanguage(element.title, lang) }"
                                        onerror="this.onerror = null;this.parentNode.children[0].srcset = this.src;"
                                    />
                                </picture>
                            </div>
                            <strong class="container_box--title">${ getValueByLanguage(element.title, lang) }</strong>
                        </a>
                    </div>
                `;
            });
        }

        let galleryQuery = "SELECT galleries.id, galleries.gallery_name, galleries.slug, galleries.gallery_thumbnail FROM galleries WHERE galleries.is_active = ? AND (";

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

        galleryQuery += ` LIMIT ${ searchLimit }`;

        const gallery_result = await DoDatabaseQuery(galleryQuery, [1, ...words]);

        if (gallery_result.length === 0) {
            galleriesHtml = `<div class="search__not-found" style="margin-bottom: 20px;">${ languageHandler('products.no_gallery_like_this', lang) }</div>`;
        }
        else if (gallery_result.length > 0) {
            gallery_result.forEach(element => {
                galleriesHtml += `
                    <div style="margin-bottom: 10px;">
                        <a class="container_box" href="${ process.env.APP_URL }/${ lang }/` + languageHandler('slugs.gallery') + "/" + getSlug(element.slug) + "/" + element.id `" aria-label="${ getValueByLanguage(element.gallery_name, lang) }">
                            <div class="container_box--image">
                                <picture>
                                    <source srcset="${ imagePathConverter(element.gallery_thumbnail, "galleries") ?? '' }">
                                    <img
                                        src="images/no-picture.jpg"
                                        loading="lazy"
                                        class="img"
                                        alt="${ getValueByLanguage(element.gallery_name, lang) }"
                                        onerror="this.onerror = null;this.parentNode.children[0].srcset = this.src;"
                                    />
                                </picture>
                            </div>
                            <strong class="container_box--title">${ getValueByLanguage(element.gallery_name, lang) }</strong>
                        </a>
                    </div>
                `;
            });
        }

        return res.status(200).json({
            status: "success",
            galleriesHtml: galleriesHtml,
            blogsHtml: blogsHtml,
            productsHtml: productsHtml,
            csrfToken: req.csrfToken()
        });
    }
    catch (error) {
        errorHandler(error, req, res, 'searchController', 362, true);

        return res.status(200).json({
            status: "error",
            title: languageHandler('errors.error', lang),
            message: languageHandler('errors.common_error', lang),
            csrfToken: req.csrfToken()
        });
    }
};

module.exports = { handleSearch, ajaxSearch };
