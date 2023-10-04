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
    setMomentLocale("hu");

    let galleriesList = [];
    const lang = req.session.lang ?? process.env.ADMIN_LANG;

    // TODO: Finish the query with limit offset for pagination
    const selectGalleryList = "SELECT galleries.id, galleries.is_active, galleries.gallery_name, galleries.created_at, galleries.updated_at, categories.name AS 'category_name' FROM galleries INNER JOIN categories ON galleries.category_id = categories.id ORDER BY galleries.id DESC";

    db.query(selectGalleryList, 1, (err, gallery_list) => {

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

        if (gallery_list.length > 0) {

            gallery_list.forEach(gallery => {
                let tempObject = {
                    galleryId: parseInt(gallery.id),
                    galleryName: getValueByLanguage(gallery.gallery_name, lang),
                    is_active: getIconByActivity(gallery.is_active ?? 0),
                    date: gallery.updated_at != null ? gallery.updated_at : gallery.created_at,
                    galleryCategory: getValueByLanguage(gallery.category_name, lang),
                }

                galleriesList.push(tempObject);
            });

            galleriesList = galleriesList.map(item => {
                return {
                    ...item,
                    date: moment(item.date).format("YYYY. MMMM DD. HH:mm:ss"),
                };
            });
        }

        return res.render("admin/gallery/list", {
            meta: metas,
            galleriesList: galleriesList ?? [],
            csrfToken: req.csrfToken()
        });
    });
}

module.exports = { getGalleryList };
