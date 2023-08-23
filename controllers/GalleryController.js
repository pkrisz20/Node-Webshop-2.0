const { db } = require("../config/db-config");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
const { setMomentLocale, capitalizeFirstLetter, numberWithCommas } = require("../helpers/globalFunctions");
const moment = require("moment");
const languageHandler = require("../helpers/languageHandler");

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
    const lang = req.session.lang;
    let { page = 1 } = req.query;
    let result = [];
    var metas = {
        title: languageHandler("nav.gallery", lang),
        type: "page",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the gallery list page",
        // keywords: []
    };
    const sqlQuery = "SELECT galleries.id, galleries.gallery_name, galleries.slug, galleries.gallery_date, galleries.gallery_thumbnail, categories.name AS 'category_name' FROM galleries, categories WHERE (galleries.is_active = ? AND galleries.category_id = categories.id) ORDER BY galleries.gallery_date DESC LIMIT ? OFFSET ?";

    page = parseInt(page);

    if ( isNaN(page) ) {
        return res.status(400).render("400", {
            title: languageHandler("errors.wrong_data", lang ?? process.env.FALLBACK_LANG),
            current_locale: req.session.lang,
            back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
            learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
            csrfToken: req.csrfToken()
        });
    }

    if (typeof page !== "number" || page <= 0) {
        return res.status(400).render("400", {
            title: languageHandler("errors.wrong_data", lang ?? process.env.FALLBACK_LANG),
            current_locale: req.session.lang,
            back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
            learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
            csrfToken: req.csrfToken()
        });
    }

    let pageOffset = (page - 1) * parseInt(process.env.PAGINATION);
    setMomentLocale(lang);

    db.query(sqlQuery, [1, parseInt(process.env.PAGINATION), pageOffset], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).render("500", {
                title: languageHandler("errors.server_error", lang ?? process.env.FALLBACK_LANG),
                current_locale: req.session.lang,
                back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
                learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
                csrfToken: req.csrfToken()
            });
        }

        else if (data.length == 0) {
            return res.render("pages/galleries", {
                pageCount: 0,
                galleries: [],
                meta: metas,
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
                    thumbnailImage: imagePathConverter(element.gallery_thumbnail, "gallery"),
                    date: moment(element.gallery_date).format("YYYY. MMMM DD."),
                    category: getValueByLanguage(element.category_name, lang)
                }

                result.push(tempObject);
            });

            result = result.map(item => {
                return {
                    ...item,
                    date: item.date.toLowerCase(),
                    category: capitalizeFirstLetter(item.category)
                };
            });

            // Select for pagination count
            db.query("SELECT COUNT(galleries.id) AS 'each_article_count' FROM galleries WHERE galleries.is_active = ?", 1, (err, elementsCount) => {
                if (err) {
                    console.log(err);
                    return res.status(500).render("500", {
                        title: languageHandler("errors.server_error", lang ?? process.env.FALLBACK_LANG),
                        current_locale: req.session.lang,
                        back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
                        learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
                        csrfToken: req.csrfToken()
                    });
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
    const lang = req.session.lang;
    let { slug } = req.params;
    let result = {};

    const sqlGalleryDetails = "SELECT gallery_name, gallery_date, description, gallery_images FROM galleries WHERE is_active = ? AND slug = ?";

    setMomentLocale(lang);

    db.query(sqlGalleryDetails, [1, slug], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).render("500", {
                title: languageHandler("errors.server_error", lang ?? process.env.FALLBACK_LANG),
                current_locale: req.session.lang,
                back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
                learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
                csrfToken: req.csrfToken()
            });
        }

        else if (data.length == 0) {
            return res.status(404).render('404', {
                current_locale: lang ?? process.env.FALLBACK_LANG,
                title: languageHandler("errors.not_found", lang ?? process.env.FALLBACK_LANG),
                back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
                learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
                csrfToken: req.csrfToken()
            });
        }

        else if (data.length > 0) {
            result = {
                galleryName: getValueByLanguage(data[0].gallery_name, lang),
                description: getValueByLanguage(data[0].description, lang),
                galleryImages: imagePathConverter(JSON.parse(data[0].gallery_images), "gallery"),
                date: moment(data[0].gallery_date).format("YYYY. MMMM DD.")
            }
        }

        var metas = {
            title: result.galleryName,
            type: "article",
            image: `${ process.env.APP_URL }/images/logo.png`,
            description: `This is the ${ result.galleryName } gallery`,
            // keywords: []
        };

        return res.render("pages/gallery-details", {
            galleryData: result,
            meta: metas,
            current_locale: req.session.lang,
            cart: cart,
            locales: ['hu', 'sr', 'en'],
            languageHandler: languageHandler,
            csrfToken: req.csrfToken()
        });
    });
}

module.exports = { getAllGallery, getGalleryDetails };
