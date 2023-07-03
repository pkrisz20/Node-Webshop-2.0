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
    const sqlQuery = "SELECT galleries.id, galleries.gallery_name, galleries.gallery_date, galleries.gallery_thumbnail, categories.name AS 'category_name' FROM galleries, categories WHERE (galleries.is_active = ? AND galleries.category_id = categories.id) ORDER BY galleries.gallery_date DESC LIMIT ? OFFSET ?";

    page = parseInt(page);

    if ( isNaN(page) ) {
        return res.status(400).render("400", { current_locale: req.session.lang });
    }

    if (typeof page !== "number" || page <= 0) {
        return res.status(400).render("400", { current_locale: req.session.lang });
    }

    let pageOffset = (page - 1) * parseInt(process.env.PAGINATION);
    setMomentLocale(lang);

    db.query(sqlQuery, [1, parseInt(process.env.PAGINATION), pageOffset], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).render("500", { current_locale: req.session.lang });
        }

        else if (data.length > 0) {

            data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    name: getValueByLanguage(element.gallery_name, lang),
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
                    return res.status(500).render("500", { current_locale: req.session.lang });
                }

                else if (elementsCount) {

                    let leftOver = elementsCount[0].each_article_count % parseInt(process.env.PAGINATION);
                    let pageCount = parseInt(elementsCount[0].each_article_count / parseInt(process.env.PAGINATION));
                    pageCount = leftOver > 0 ? pageCount + 1 : pageCount;

                    return res.render("pages/galleries", {
                        pageCount: pageCount,
                        currentPage: page,
                        articleLink: "gallery",
                        galleries: result ?? [],
                        meta: metas,
                        current_locale: req.session.lang,
                        cart: cart,
                        locales: ['hu', 'sr', 'en'],
                        languageHandler: languageHandler
                    });
                }
            });
        }
    });
}

const getGalleryDetails = (req, res) => {
    const { lang } = req.body;
    let { galleryId } = req.params;
    let result = {};

    if (!lang || !galleryId) {
        return res.status(400).json({ status: "error" });
    }

    const sqlGalleryDetails = "SELECT gallery_name, gallery_date, gallery_images FROM galleries WHERE is_active = ? AND id = ?";

    setMomentLocale(lang);

    db.query(sqlGalleryDetails, [1, galleryId], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ status: "error" });
        }

        else if (data.length > 0) {
            result = {
                galleryName: getValueByLanguage(data[0].gallery_name, lang),
                galleryImages: imagePathConverter(JSON.parse(data[0].gallery_images), "gallery"),
                date: moment(data[0].gallery_date).format("YYYY. MMMM DD.")
            }
        }

        return res.status(200).json({ status: 'success', result: result ?? "" });
    });
}

module.exports = { getAllGallery, getGalleryDetails };
