const { db } = require("../../config/db-connection");
const getValueByLanguage = require("../../helpers/getValueByLanguage");
const imagePathConverter = require("../../helpers/imagePathConverter");
const { setMomentLocale, limitText, escapeHtml } = require("../../helpers/globalFunctions");
const { getIconByActivity } = require('../../helpers/admin/getIconByActivity');
const { showServerErrorPage, showBadRequestPage } = require("../../helpers/showErrorPages");
const getValidFormValues = require("../../helpers/admin/getValidFormValues");
const { generateUniqueSlug } = require("../../helpers/admin/slugHelper");
const languageHandler = require("../../helpers/languageHandler");
const moment = require("moment");

const getGalleryList = (req, res) => {
    var metas = {
        title: 'Admin gallery',
        type: "webiste",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the gallery list page",
        // keywords: []
    };

    const lang = req.session.lang ?? process.env.ADMIN_LANG;
    let { page = 1 } = req.query;
    page = parseInt(page);

    if (isNaN(page) || page <= 0) {
        return showBadRequestPage(req, res);
    }

    setMomentLocale("hu");
    let galleriesList = [];

    const selectGalleryList = "SELECT galleries.id, galleries.is_active, galleries.gallery_name, galleries.created_at, galleries.updated_at FROM galleries ORDER BY galleries.id DESC LIMIT ? OFFSET ?";

    let pageOffset = (page - 1) * parseInt(process.env.ADMIN_PAGINATION);

    db.query(selectGalleryList, [parseInt(process.env.ADMIN_PAGINATION), pageOffset], (err, gallery_list) => {

        if (err) {
            console.log(err);
            return showServerErrorPage(req, res);
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
                    galleryName: limitText(item.galleryName, 40),
                    date: moment(item.date).format("YYYY. MMMM DD. HH:mm:ss"),
                };
            });

            let selectForPagination = "SELECT COUNT(galleries.id) AS 'each_article_count' FROM galleries";

            // Select for pagination count
            db.query(selectForPagination, (err_pagination, elementsCount) => {
                if (err_pagination) {
                    console.log(err_pagination);

                    return showServerErrorPage(req, res);
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

const deleteGallery = (req, res) => {
    let { galleryId } = req.params;

    const deleteGalleryQuery = "DELETE FROM galleries WHERE id = ?";

    db.query(deleteGalleryQuery, galleryId, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(200).json({ status: "error" });
        }
        else {
            return res.status(200).json({ status: "success" });
        }
    });
}

const getGalleryUploadPage = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    var metas = {
        title: "Új galléria",
        type: "website",
        url: `${ process.env.APP_URL }/${ lang }/faq`,
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the gallery upload page",
    };

    return res.render("admin/gallery/new", {
        meta: metas,
        current_locale: lang,
        csrfToken: req.csrfToken()
    });
}

const handleGalleryUpload = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    let galleryData = req.body;

    // Numbers and Boolean types data check
    let is_active = parseInt(galleryData.is_active ?? 0);
    let is_featured = parseInt(galleryData.is_featured ?? 0);

    if (
        isNaN(is_active)
        || isNaN(is_featured)
        || !galleryData['name[hu]']
        || !galleryData['name[sr]']
        || !galleryData['name[en]']
        || !galleryData['date']
    )
    {
        return res.status(200).json({
            status: 'error',
            title: languageHandler('errors.error', lang),
            text: languageHandler('errors.wrong_data', lang),
            csrfToken: req.csrfToken()
        });
    }

    // The gallery names are required
    let galleryNames = {
        en: escapeHtml(galleryData['name[en]']),
        sr: escapeHtml(galleryData['name[sr]']),
        hu: escapeHtml(galleryData['name[hu]']),
    };
    // The short description simple textarea, it's a string
    let descriptions = {
        en: galleryData['description[en]'].length > 0 ? escapeHtml(galleryData['description[en]']) : null,
        sr: galleryData['description[sr]'].length > 0 ? escapeHtml(galleryData['description[sr]']) : null,
        hu: galleryData['description[hu]'].length > 0 ? escapeHtml(galleryData['description[hu]']) : null
    };

    const SQLInsertGallery = "INSERT INTO galleries (gallery_name, description, gallery_date, is_active, is_featured, created_at) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(
        SQLInsertGallery,
        [
            JSON.stringify(galleryNames),
            JSON.stringify(descriptions),
            galleryData['date'],
            is_active,
            is_featured,
            moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        ],
        (err, data) => {
            if (err) {
                console.log(err);
                return res.status(200).json({ status: "error", csrfToken: req.csrfToken() });
            }

            else if (data.affectedRows > 0) {

                // Slug generate for product with inserted id
                let generatedSlug = generateUniqueSlug(galleryNames);

                if ( generatedSlug === false ) {
                    return res.status(200).json({
                        status: 'error',
                        title: languageHandler('errors.error', lang),
                        text: languageHandler('errors.slug_error', lang),
                        csrfToken: req.csrfToken()
                    });
                }
                else {
                    const updateSlugForGallery = "UPDATE galleries SET slug = ? WHERE id = ?";

                    db.query(updateSlugForGallery,
                        [
                            generatedSlug,
                            data.insertId
                        ],
                        (update_err, queryStatus) => {
                            if (update_err) {
                                console.log(update_err);
                                return res.status(200).json({ status: "error", csrfToken: req.csrfToken() });
                            }
                            else if (queryStatus.changedRows > 0) {
                                return res.status(200).json({
                                    status: "success",
                                    redirect_url: `/admin/gallery/edit/${ data.insertId }`,
                                    csrfToken: req.csrfToken()
                                });
                            }
                            else {
                                return res.status(200).json({
                                    status: 'error',
                                    title: languageHandler('errors.error', lang),
                                    csrfToken: req.csrfToken()
                                });
                            }
                        }
                    );
                }
            }
        }
    );
}

const getGalleryEditPage = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    var metas = {
        title: "Szerkesztés",
        type: "website",
        // url: `${ process.env.APP_URL }/${ lang }/edit`,
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the gallery edit page",
    };

    let { galleryId } = req.params;
    galleryId = parseInt(galleryId);

    if ( isNaN(galleryId) ) {
        return showBadRequestPage(req, res);
    }

    // function params => Table, database ID, callback
    getValidFormValues('galleries', galleryId, function (err, DBformData) {
        // If there is ANY error, then the ID does not exist -> show new upload form
        if (err) {
            return res.redirect('/admin/gallery/new');
        }

        // If HAS form values, then show edit page
        else if ( DBformData.length > 0 ) {

            const validLanguages = process.env.VALID_LANGS.split(',');
            let formValues = DBformData[0];
            let formattedValues = {
                en: {},
                hu: {},
                sr: {}
            };

            setMomentLocale("hu");

            // Convert & format the form values
            validLanguages.forEach(currentLanguage => {
                formattedValues[currentLanguage].name = getValueByLanguage(formValues.gallery_name, currentLanguage);
                formattedValues[currentLanguage].description = formValues.description != null ? getValueByLanguage(formValues.description, currentLanguage) : null;
            });

            formattedValues.images = formValues.gallery_images != null ? imagePathConverter(JSON.parse(formValues.gallery_images), 'galleries') : null;
            formattedValues.thumbnail = formValues.gallery_thumbnail != null ? imagePathConverter(formValues.gallery_thumbnail, 'galleries') : null;
            formattedValues.date = moment(formValues.gallery_date).format("YYYY-MM-DD");
            formattedValues.id = parseInt(formValues.id);
            formattedValues.is_active = parseInt(formValues.is_active);
            formattedValues.is_featured = parseInt(formValues.is_featured);

            return res.render("admin/gallery/edit", {
                formValues: formattedValues,
                meta: metas,
                current_locale: lang,
                csrfToken: req.csrfToken()
            });
        }

        // If NO form values, then show new product upload page
        else if ( DBformData.length === 0 ) {
            return res.redirect('/admin/gallery/new');
        }
    });
}

const handleEditGallery = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    let galleryData = req.body;
    let { galleryId } = req.params;
    galleryId = parseInt(galleryId);

    // Boolean types data check
    let is_active = parseInt(galleryData.is_active ?? 0);
    let is_featured = parseInt(galleryData.is_featured ?? 0);

    if (
        isNaN(is_active)
        || isNaN(is_featured)
        || isNaN(galleryId)
        || !galleryData['name[hu]']
        || !galleryData['name[sr]']
        || !galleryData['name[en]']
        || !galleryData['date']
    )
    {
        return res.status(200).json({
            status: 'error',
            title: languageHandler('errors.error', lang),
            text: languageHandler('errors.wrong_data', lang),
            csrfToken: req.csrfToken()
        });
    }

    // The product names are required
    let names = {
        en: escapeHtml(galleryData['name[en]']),
        sr: escapeHtml(galleryData['name[sr]']),
        hu: escapeHtml(galleryData['name[hu]']),
    };

    let galleryNameParam = JSON.stringify(names);
    let newSlugs = generateUniqueSlug(names);

    // The short description simple textarea, it's a string
    let descriptions = {
        en: galleryData['description[en]'].length > 0 ? escapeHtml(galleryData['description[en]']) : null,
        sr: galleryData['description[sr]'].length > 0 ? escapeHtml(galleryData['description[sr]']) : null,
        hu: galleryData['description[hu]'].length > 0 ? escapeHtml(galleryData['description[hu]']) : null
    };

    const SQLUpdateGallery = "UPDATE galleries SET gallery_name = ?, description = ?, slug = ?, gallery_date = ?, is_active = ?, is_featured = ?, updated_at = ? WHERE id = ?";

    db.query(
        SQLUpdateGallery,
        [
            galleryNameParam,
            JSON.stringify(descriptions),
            newSlugs,
            galleryData['date'],
            is_active,
            is_featured,
            moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            galleryId
        ],
        (err, data) => {
            if (err) {
                console.log(err);
                return res.status(200).json({ status: "error", csrfToken: req.csrfToken() });
            }

            else if (data.affectedRows > 0) {
                return res.status(200).json({
                    status: "success",
                    redirect_url: `/admin/gallery/edit/${ galleryId }`,
                    csrfToken: req.csrfToken()
                });
            }
        }
    );
}

module.exports = { getGalleryList, deleteGallery, getGalleryUploadPage, handleGalleryUpload, getGalleryEditPage, handleEditGallery };
