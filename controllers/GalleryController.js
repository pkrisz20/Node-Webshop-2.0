const DoDatabaseQuery = require("../helpers/databaseQueryHelper");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const { setMomentLocale, numberWithCommas, limitText } = require("../helpers/globalFunctions");
const formatDateByLang = require("../helpers/formatDateByLocale");
const languageHandler = require("../helpers/languageHandler");
const errorHandler = require('../middleware/errorHandler');
const { showNotFoundPage, showBadRequestPage } = require("../helpers/showErrorPages");
const metaDefault = require('../config/meta');
const gdprCookies = require('../config/gdpr');

const getAllGallery = async (req, res) => {
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

    var { DB_CONFIG } = req;
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    let { page = 1 } = req.query;
    page = parseInt(page);

    if (isNaN(page) || page <= 0) {
        return showBadRequestPage(req, res);
    }

    let pageCount = 0;
    let result = [];
    var metas = {
        ...metaDefault,
        title: languageHandler("nav.gallery", lang) + metaDefault['separator'] + metaDefault['title'],
        lang: metaDefault.langs[lang],
        type: "website",
        url: `${ process.env.APP_URL }/${ lang }/gallery`,
        description: languageHandler('meta.gallery_description', lang),
        image: {
            src: metaDefault['default_og_images'],
            width: metaDefault['og:image:width'],
            height: metaDefault['og:image:height'],
        },
    };

    const sqlQuery = "SELECT galleries.id, galleries.gallery_name, galleries.slug, galleries.gallery_date, galleries.gallery_thumbnail FROM galleries WHERE galleries.is_active = ? ORDER BY galleries.gallery_date DESC LIMIT ? OFFSET ?";

    let pageOffset = (page - 1) * parseInt(process.env.PAGINATION);
    setMomentLocale(lang);

    try {
        const data = await DoDatabaseQuery(sqlQuery, [1, parseInt(process.env.PAGINATION), pageOffset]);

        if (data.length > 0) {
            data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    name: getValueByLanguage(element.gallery_name, lang),
                    slug: element.slug,
                    thumbnailImage: imagePathConverter(element.gallery_thumbnail, "galleries"),
                    date: formatDateByLang(element.gallery_date, lang ?? process.env.FALLBACK_LANG),
                }

                result.push(tempObject);
            });

            result = result.map(item => {
                return {
                    ...item,
                    date: item.date.toLowerCase(),
                };
            });

            const elementsCount = await DoDatabaseQuery("SELECT COUNT(galleries.id) AS 'each_article_count' FROM galleries WHERE galleries.is_active = ?", [1]);
            // Select for pagination count
            if (elementsCount) {
                let leftOver = elementsCount[0].each_article_count % parseInt(process.env.PAGINATION);
                pageCount = parseInt(elementsCount[0].each_article_count / parseInt(process.env.PAGINATION));
                pageCount = leftOver > 0 ? pageCount + 1 : pageCount;
            }
        }

        return res.render("pages/galleries", {
            pageCount: parseInt(pageCount ?? 0),
            currentPage: parseInt(page ?? 0),
            articleLink: languageHandler('slugs.galleries', lang) ?? null,
            galleries: result ?? [],
            meta: metas,
            current_locale: lang,
            cart: cart,
            locales: ['hu', 'sr', 'en'],
            languageHandler: languageHandler,
            DB_CONFIG: DB_CONFIG,
            showPopupCartInformation: req.session.showPopupCartInformation,
            wishlistTotalNumber: req.wishlistTotalNumber,
            webshopCategories: req.webshopCategories,
            staticContent: req.static_content,
            gdprCookies: gdprCookies,
            gdprAcceptedCookies: JSON.parse(req.cookies['allowed_cookie_types'] ?? '[]'),
            csrfToken: req.csrfToken()
        });
    }
    catch (error) {
        return errorHandler(error, req, res, 'galleryController', 109);
    }
}

const getGalleryDetails = async (req, res) => {
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

    var { DB_CONFIG } = req;
    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    let { slug } = req.params;
    let result = {};
    let relatedGalleries = [];

    const sqlGalleryDetails = "SELECT id, gallery_name, gallery_thumbnail, gallery_date, description, gallery_images FROM galleries WHERE is_active = ? AND slug = ?";

    const relatedGalleriesQuery = "SELECT id, gallery_name, slug, gallery_thumbnail, gallery_date FROM galleries WHERE is_active = ? AND id != ? ORDER BY id DESC LIMIT ?";

    setMomentLocale(lang);

    try {
        const data = await DoDatabaseQuery(sqlGalleryDetails, [1, slug]);

        if (data.length === 0) {
            return showNotFoundPage(req, res);
        }
        else if (data.length > 0) {
            result = {
                id: parseInt(data[0].id),
                slug: slug,
                thumbImage: imagePathConverter(data[0].gallery_thumbnail, "galleries"),
                galleryName: getValueByLanguage(data[0].gallery_name, lang),
                description: getValueByLanguage(data[0].description, lang),
                galleryImages: imagePathConverter(JSON.parse(data[0].gallery_images), "galleries"),
                date: formatDateByLang(data[0].gallery_date, lang)
            }
        }

        var metas = {
            ...metaDefault,
            title: limitText(result.galleryName, metaDefault.limits['title']) + metaDefault['separator'] + metaDefault['title'],
            lang: metaDefault.langs[lang],
            type: "article",
            url: `${ process.env.APP_URL }/${ lang }/gallery/${ slug }`,
            description: limitText(result.description ?? languageHandler('meta.gallery_description', lang), metaDefault.limits['description']),
            image: {
                src: result.thumbImage ?? metaDefault['default_og_images'],
                width: metaDefault['og:image:width'],
                height: metaDefault['og:image:height'],
            },
        };

        const related_galleries = await DoDatabaseQuery(relatedGalleriesQuery, [1, data[0].id, 15]);

        if (related_galleries.length > 0) {
            related_galleries.forEach(item => {
                let tempObject = {
                    name: getValueByLanguage(item.gallery_name, lang),
                    slug: item.slug,
                    thumbnailImage: imagePathConverter(item.gallery_thumbnail, "galleries"),
                    date: formatDateByLang(item.gallery_date, lang),
                }

                relatedGalleries.push(tempObject);
            });
        }

        return res.render("pages/gallery-details", {
            galleryData: result,
            meta: metas,
            relatedGalleries: relatedGalleries ?? [],
            current_locale: lang,
            cart: cart,
            locales: ['hu', 'sr', 'en'],
            languageHandler: languageHandler,
            DB_CONFIG: DB_CONFIG,
            showPopupCartInformation: req.session.showPopupCartInformation,
            wishlistTotalNumber: req.wishlistTotalNumber,
            webshopCategories: req.webshopCategories,
            staticContent: req.static_content,
            gdprCookies: gdprCookies,
            gdprAcceptedCookies: JSON.parse(req.cookies['allowed_cookie_types'] ?? '[]'),
            csrfToken: req.csrfToken()
        });
    }
    catch (error) {
        return errorHandler(error, req, res, 'galleryController', 204);
    }
}

module.exports = { getAllGallery, getGalleryDetails };
