const { db } = require("../../config/db-connection");
const getValueByLanguage = require("../../helpers/getValueByLanguage");
const imagePathConverter = require("../../helpers/imagePathConverter");
const { setMomentLocale, escapeHtml } = require("../../helpers/globalFunctions");
const { showServerErrorPage, showBadRequestPage } = require("../../helpers/showErrorPages");
const getValidFormValues = require("../../helpers/admin/getValidFormValues");
const { generateUniqueSlug } = require("../../helpers/admin/generateSlug");
const languageHandler = require("../../helpers/languageHandler");
const moment = require("moment");

const getWebshopCategoryList = (req, res) => {
    var metas = {
        title: 'Admin category list page',
        type: "webiste",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the Webshop category list page",
        // keywords: []
    };
    setMomentLocale("hu");

    let webshopCategories = [];
    const lang = req.session.lang ?? process.env.ADMIN_LANG;
    const selectWebshopCategories = "SELECT id, name, created_at, updated_at, (SELECT COUNT(products.id) FROM products WHERE products.category_id = categories.id) AS 'products_count' FROM categories";

    db.query(selectWebshopCategories, (err, category_list) => {

        if (err) {
            console.log(err);
            return showServerErrorPage(req, res);
        }

        if (category_list.length > 0) {

            category_list.forEach(category => {
                let tempObject = {
                    id: parseInt(category.id),
                    name: getValueByLanguage(category.name, lang),
                    date: category.updated_at != null ? category.updated_at : category.created_at,
                    productsCount: category.products_count ?? 0
                }

                webshopCategories.push(tempObject);
            });

            webshopCategories = webshopCategories.map(item => {
                return {
                    ...item,
                    date: moment(item.date).format("YYYY. MMMM DD. HH:mm:ss"),
                };
            });
        }

        return res.render("admin/categories/list", {
            meta: metas,
            webshopCategories: webshopCategories ?? [],
            csrfToken: req.csrfToken()
        });
    });
}

const deleteWebshopCategory = (req, res) => {
    let { categoryId } = req.params;

    const deleteCategoryQuery = "DELETE FROM categories WHERE id = ?";

    db.query(deleteCategoryQuery, categoryId, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(200).json({ status: "error" });
        }
        else {
            return res.status(200).json({ status: "success" });
        }
    });
}

const getNewCategoryPage = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    var metas = {
        title: "Új kategória",
        type: "website",
        url: `${ process.env.APP_URL }/admin/category/new`,
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the category upload page",
    };

    return res.render("admin/categories/new", {
        meta: metas,
        current_locale: lang,
        csrfToken: req.csrfToken()
    });
}

const addNewCategory = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    let categoryData = req.body;

    if ( !categoryData['name[hu]'] || !categoryData['name[sr]'] || !categoryData['name[en]'] )
    {
        return res.status(200).json({
            status: 'error',
            title: languageHandler('errors.error', lang),
            text: languageHandler('errors.wrong_data', lang),
            csrfToken: req.csrfToken()
        });
    }

    // The category names are required
    let categoryNames = {
        en: escapeHtml(categoryData['name[en]']),
        sr: escapeHtml(categoryData['name[sr]']),
        hu: escapeHtml(categoryData['name[hu]']),
    };
    // The short description simple textarea, it's a string
    let shortDescriptions = {
        en: categoryData['short_description[en]'].length > 0 ? escapeHtml(categoryData['short_description[en]']) : null,
        sr: categoryData['short_description[sr]'].length > 0 ? escapeHtml(categoryData['short_description[sr]']) : null,
        hu: categoryData['short_description[hu]'].length > 0 ? escapeHtml(categoryData['short_description[hu]']) : null
    };

    const SQLInsertCategory = "INSERT INTO categories (name, short_description, created_at) VALUES(?, ?, ?)";

    db.query(
        SQLInsertCategory,
        [
            JSON.stringify(categoryNames),
            JSON.stringify(shortDescriptions),
            moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        ],
        (err, data) => {
            if (err) {
                console.log(err);
                return res.status(200).json({ status: "error", csrfToken: req.csrfToken() });
            }

            else if (data.affectedRows > 0) {

                // Slug generate for product with inserted id
                let generatedSlug = generateUniqueSlug(categoryData["name[en]"], data.insertId);

                if ( generatedSlug === false ) {
                    return res.status(200).json({
                        status: 'error',
                        title: languageHandler('errors.error', lang),
                        text: languageHandler('errors.slug_error', lang),
                        csrfToken: req.csrfToken()
                    });
                }
                else {
                    const updateSlugForCategory = "UPDATE categories SET slug = ? WHERE id = ?";

                    db.query(updateSlugForCategory,
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
                                    redirect_url: `/admin/category/edit/${ data.insertId }`,
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

const getCategoryEditPage = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    var metas = {
        title: "Szerkesztés",
        type: "website",
        // url: `${ process.env.APP_URL }/admin/category/edit`,
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the category edit page",
    };

    let { categoryId } = req.params;
    categoryId = parseInt(categoryId);

    if ( isNaN(categoryId) ) {
        return showBadRequestPage(req, res);
    }

    // function params => Table, database ID, callback
    getValidFormValues('categories', categoryId, function (err, DBformData) {
        // If there is ANY error, then the ID does not exist -> show new upload form
        if (err) {
            return res.redirect('/admin/categories/new');
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

            // Convert & format the form values
            validLanguages.forEach(currentLanguage => {
                formattedValues[currentLanguage].name = getValueByLanguage(formValues.name, currentLanguage);
                formattedValues[currentLanguage].short_description = formValues.short_description != null ? getValueByLanguage(formValues.short_description, currentLanguage) : null;
            });

            formattedValues.image = formValues.image != null ? imagePathConverter(formValues.image, 'categories') : null;
            formattedValues.id = parseInt(formValues.id);

            return res.render("admin/categories/edit", {
                formValues: formattedValues,
                meta: metas,
                current_locale: lang,
                csrfToken: req.csrfToken()
            });
        }

        // If NO form values, then show new product upload page
        else if ( DBformData.length === 0 ) {
            return res.redirect('/admin/categories/new');
        }
    });
}

const handleEditCategory = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    let categoryData = req.body;
    let { categoryId } = req.params;
    categoryId = parseInt(categoryId);

    if ( !categoryData['name[hu]'] || !categoryData['name[sr]'] || !categoryData['name[en]'] || isNaN(categoryId) )
    {
        return res.status(200).json({
            status: 'error',
            title: languageHandler('errors.error', lang),
            text: languageHandler('errors.wrong_data', lang),
            csrfToken: req.csrfToken()
        });
    }

    // The product names are required
    let categoryNames = {
        en: escapeHtml(categoryData['name[en]']),
        sr: escapeHtml(categoryData['name[sr]']),
        hu: escapeHtml(categoryData['name[hu]']),
    };
    // The short description simple textarea, it's a string
    let shortDescriptions = {
        en: categoryData['short_description[en]'].length > 0 ? escapeHtml(categoryData['short_description[en]']) : null,
        sr: categoryData['short_description[sr]'].length > 0 ? escapeHtml(categoryData['short_description[sr]']) : null,
        hu: categoryData['short_description[hu]'].length > 0 ? escapeHtml(categoryData['short_description[hu]']) : null
    };

    const SQLUpdateCategory = "UPDATE categories SET name = ?, short_description = ?, updated_at = ? WHERE id = ?";

    db.query(
        SQLUpdateCategory,
        [
            JSON.stringify(categoryNames),
            JSON.stringify(shortDescriptions),
            moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            categoryId
        ],
        (err, data) => {
            if (err) {
                console.log(err);
                return res.status(200).json({ status: "error", csrfToken: req.csrfToken() });
            }

            else if (data.affectedRows > 0) {
                return res.status(200).json({
                    status: "success",
                    redirect_url: `/admin/category/edit/${ categoryId }`,
                    csrfToken: req.csrfToken()
                });
            }
        }
    );
}

module.exports = {
    getWebshopCategoryList,
    deleteWebshopCategory,
    getNewCategoryPage,
    addNewCategory,
    getCategoryEditPage,
    handleEditCategory
};
