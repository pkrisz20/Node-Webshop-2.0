const { db } = require("../../config/db-connection");
const getValueByLanguage = require("../../helpers/getValueByLanguage");
const { setMomentLocale } = require("../../helpers/globalFunctions");
const { getIconByActivity } = require('../../helpers/admin/getIconByActivity');
const languageHandler = require("../../helpers/languageHandler");
const moment = require("moment");

const getGalleryList = (req, res) => {
    var metas = {
        title: 'Admin gallery list page',
        type: "webiste",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the gallery list page",
        // keywords: []
    };

    const lang = req.session.lang ?? process.env.ADMIN_LANG;
    let { page = 1 } = req.query;
    page = parseInt(page);

    if (isNaN(page) || page <= 0) {
        return res.status(400).render("400", {
            title: languageHandler("errors.wrong_data", lang ?? process.env.ADMIN_LANG),
            current_locale: req.session.lang,
            back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.ADMIN_LANG),
            learn_more: languageHandler("general.information", req.session.lang ?? process.env.ADMIN_LANG),
            csrfToken: req.csrfToken()
        });
    }

    setMomentLocale("hu");
    let galleriesList = [];

    const selectGalleryList = "SELECT galleries.id, galleries.is_active, galleries.gallery_name, galleries.created_at, galleries.updated_at FROM galleries ORDER BY galleries.id DESC LIMIT ? OFFSET ?";

    let pageOffset = (page - 1) * parseInt(process.env.ADMIN_PAGINATION);

    db.query(selectGalleryList, [parseInt(process.env.ADMIN_PAGINATION), pageOffset], (err, gallery_list) => {

        if (err) {
            console.log(err);
            return res.status(500).render("500", {
                title: languageHandler("errors.server_error", lang ?? process.env.ADMIN_LANG),
                current_locale: req.session.lang ?? process.env.ADMIN_LANG,
                back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.ADMIN_LANG),
                learn_more: languageHandler("general.information", req.session.lang ?? process.env.ADMIN_LANG),
                csrfToken: req.csrfToken()
            });
        }

        else if (gallery_list.length == 0) {
            return res.render("admin/gallery/list", {
                meta: metas,
                pageCount: 0,
                galleriesList: galleriesList ?? [],
                csrfToken: req.csrfToken()
            });
        }

        if (gallery_list.length > 0) {

            gallery_list.forEach(gallery => {
                let tempObject = {
                    galleryId: parseInt(gallery.id),
                    galleryName: getValueByLanguage(gallery.gallery_name, lang),
                    is_active: getIconByActivity(gallery.is_active ?? 0),
                    date: gallery.updated_at != null ? gallery.updated_at : gallery.created_at,
                }

                galleriesList.push(tempObject);
            });

            galleriesList = galleriesList.map(item => {
                return {
                    ...item,
                    date: moment(item.date).format("YYYY. MMMM DD. HH:mm:ss"),
                };
            });

            let selectForPagination = "SELECT COUNT(galleries.id) AS 'each_article_count' FROM galleries";

            // Select for pagination count
            db.query(selectForPagination, (err_pagination, elementsCount) => {
                if (err_pagination) {
                    console.log(err_pagination);

                    return res.status(500).render("500", {
                        title: languageHandler("errors.server_error", lang ?? process.env.ADMIN_LANG),
                        current_locale: req.session.lang,
                        back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.ADMIN_LANG),
                        learn_more: languageHandler("general.information", req.session.lang ?? process.env.ADMIN_LANG),
                        csrfToken: req.csrfToken()
                    });
                }

                else if (elementsCount) {

                    let leftOver = elementsCount[0].each_article_count % parseInt(process.env.ADMIN_PAGINATION);
                    let pageCount = parseInt(elementsCount[0].each_article_count / parseInt(process.env.ADMIN_PAGINATION));
                    pageCount = leftOver > 0 ? pageCount + 1 : pageCount;

                    return res.render("admin/gallery/list", {
                        meta: metas,
                        galleriesList: galleriesList ?? [],
                        csrfToken: req.csrfToken(),
                        pageCount: parseInt(pageCount),
                        currentPage: parseInt(page),
                        paginationLink: "gallery",
                    });
                }
            });
        }
    });
}

module.exports = { getGalleryList };
