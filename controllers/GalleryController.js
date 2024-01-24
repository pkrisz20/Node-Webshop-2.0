const { db } = require("../config/db-connection");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const { setMomentLocale, numberWithCommas, limitText } = require("../helpers/globalFunctions");
const formatDateByLang = require("../helpers/formatDateByLocale");
const languageHandler = require("../helpers/languageHandler");
const { showServerErrorPage, showNotFoundPage, showBadRequestPage } = require("../helpers/showErrorPages");
const metaDefault = require('../config/meta');

const getAllGallery = (req, res) => {
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
    const lang = req.session.lang;
    let { page = 1 } = req.query;
    page = parseInt(page);

    if (isNaN(page) || page <= 0) {
        return showBadRequestPage(req, res);
    }

    let result = [];
    var metas = {
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

    db.query(sqlQuery, [1, parseInt(process.env.PAGINATION), pageOffset], (err, data) => {
        if (err) {
            console.log(err);
            return showServerErrorPage(req, res);
        }

        else if (data.length == 0) {
            return res.render("pages/galleries", {
                pageCount: 0,
                galleries: [],
                meta: metas,
                DB_CONFIG: DB_CONFIG,
                webshopCategories: req.webshopCategories,
                wishlistTotalNumber: req.wishlistTotalNumber,
                current_locale: req.session.lang,
                cart: cart,
                locales: ['hu', 'sr', 'en'],
                languageHandler: languageHandler,
                csrfToken: req.csrfToken()
            });
        }

        else if (data.length > 0) {

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

            // Select for pagination count
            db.query("SELECT COUNT(galleries.id) AS 'each_article_count' FROM galleries WHERE galleries.is_active = ?", 1, (err, elementsCount) => {
                if (err) {
                    console.log(err);
                    return showServerErrorPage(req, res);
                }

                else if (elementsCount) {

                    let leftOver = elementsCount[0].each_article_count % parseInt(process.env.PAGINATION);
                    let pageCount = parseInt(elementsCount[0].each_article_count / parseInt(process.env.PAGINATION));
                    pageCount = leftOver > 0 ? pageCount + 1 : pageCount;

                    return res.render("pages/galleries", {
                        pageCount: parseInt(pageCount),
                        currentPage: parseInt(page),
                        articleLink: "gallery",
                        galleries: result ?? [],
                        meta: metas,
                        current_locale: req.session.lang,
                        cart: cart,
                        locales: ['hu', 'sr', 'en'],
                        languageHandler: languageHandler,
                        DB_CONFIG: DB_CONFIG,
                        wishlistTotalNumber: req.wishlistTotalNumber,
                        webshopCategories: req.webshopCategories,
                        csrfToken: req.csrfToken()
                    });
                }
            });
        }
    });
}

const getGalleryDetails = (req, res) => {
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

    db.query(sqlGalleryDetails, [1, slug], (err, data) => {
        if (err) {
            console.log(err);
            return showServerErrorPage(req, res);
        }

        else if (data.length == 0) {
            return showNotFoundPage(req, res);
        }

        else if (data.length > 0) {
            result = {
                slug: slug,
                thumbImage: imagePathConverter(data[0].gallery_thumbnail, "galleries"),
                galleryName: getValueByLanguage(data[0].gallery_name, lang),
                description: getValueByLanguage(data[0].description, lang),
                galleryImages: imagePathConverter(JSON.parse(data[0].gallery_images), "galleries"),
                date: formatDateByLang(data[0].gallery_date, lang)
            }
        }

        var metas = {
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

        db.query(relatedGalleriesQuery, [1, data[0].id, 15], (related_err, related_galleries) => {

            if (related_err) {
                console.log(related_err);
                return showServerErrorPage(req, res);
            }

            else if (related_galleries.length > 0) {

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
                wishlistTotalNumber: req.wishlistTotalNumber,
                webshopCategories: req.webshopCategories,
                csrfToken: req.csrfToken()
            });
        });
    });
}

module.exports = { getAllGallery, getGalleryDetails };
