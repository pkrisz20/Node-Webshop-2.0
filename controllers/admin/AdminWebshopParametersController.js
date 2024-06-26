const { db } = require("../../config/db-connection");
const DoDatabaseQuery = require("../../helpers/databaseQueryHelper");
const getValueByLanguage = require("../../helpers/getValueByLanguage");
const { setMomentLocale, escapeHtml } = require("../../helpers/globalFunctions");
const { showBadRequestPage } = require("../../helpers/showErrorPages");
const errorHandler = require('../../middleware/errorHandler');
const getValidFormValues = require("../../helpers/admin/getValidFormValues");
const languageHandler = require("../../helpers/languageHandler");
const moment = require("moment");
const { message } = require("laravel-mix/src/Log");

const getWebshopParamsListPage = async (req, res) => {
    var metas = {
        title: 'Admin webshop params list',
        type: "website",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the webshop params list page",
        // keywords: []
    };

    setMomentLocale("hu");

    let webshopParameters = [];
    const lang = req.session.lang ?? process.env.ADMIN_LANG;
    const selectWebshopParamsQuery = "SELECT * FROM parameters ORDER BY id DESC";

    try {
        webshopParameters = await DoDatabaseQuery(selectWebshopParamsQuery, []);
        webshopParameters = webshopParameters.map(parameter => {
            return {
                id: parseInt(parameter.id),
                name: getValueByLanguage(parameter.parameter_name, lang),
                date: moment(parameter.updated_at != null ? parameter.updated_at : parameter.created_at).format("YYYY. MMMM DD. HH:mm:ss"),
            }
        });

        return res.render("admin/webshop-parameters/list", {
            meta: metas,
            webshopParameters: webshopParameters ?? [],
            csrfToken: req.csrfToken()
        });
    }
    catch (error) {
        return errorHandler(error, req, res, 'adminWebshopParametersController list method');
    }
};

const getWebshopParamsUploadPage = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    var metas = {
        title: "Új paraméter",
        type: "website",
        // url: `${ process.env.APP_URL }/${ lang }/faq`,
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the sliders upload page",
    };

    return res.render("admin/webshop-parameters/new", {
        meta: metas,
        current_locale: lang,
        csrfToken: req.csrfToken()
    });
};

const handleWebshopParamUpload = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    let webshopParameterNames = req.body;

    if (!webshopParameterNames['parameter_name[hu]'] || !webshopParameterNames['parameter_name[sr]'] || !webshopParameterNames['parameter_name[en]'])
    {
        return res.status(200).json({
            status: 'error',
            title: languageHandler('errors.error', lang),
            text: languageHandler('errors.wrong_data', lang),
            csrfToken: req.csrfToken()
        });
    }

    let parameterNames = {
        en: escapeHtml(webshopParameterNames['parameter_name[en]']),
        sr: escapeHtml(webshopParameterNames['parameter_name[sr]']),
        hu: escapeHtml(webshopParameterNames['parameter_name[hu]']),
    };

    var SQLParamValues = [
        JSON.stringify(parameterNames),
        moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    ];

    const SQLInsertWebshopParameter = "INSERT INTO parameters (parameter_name, created_at) VALUES(?, ?)";

    db.query(
        SQLInsertWebshopParameter,
        SQLParamValues,
        (err, data) => {
            if (err || data.affectedRows === 0) {
                console.log(err);
                return res.status(200).json({ status: "error", csrfToken: req.csrfToken() });
            }
            else if (data.affectedRows > 0) {
                return res.status(200).json({
                    status: "success",
                    redirect_url: `/admin/webshop-params/edit/${ data.insertId }`,
                    csrfToken: req.csrfToken()
                });
            }
        }
    );
};

const getWebshopParamsEditPage = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    var metas = {
        title: "Szerkesztés",
        type: "website",
        // url: `${ process.env.APP_URL }/${ lang }/edit`,
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the webshop params edit page",
    };

    let { paramId } = req.params;
    paramId = parseInt(paramId);

    if ( isNaN(paramId) ) {
        return showBadRequestPage(req, res);
    }

    // function params => Table, database ID, callback
    getValidFormValues('parameters', paramId, function (err, DBformData) {
        // If there is ANY error, then the ID does not exist -> show new upload form
        if (err) {
            return res.redirect('/admin/webshop-params/new');
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
                formattedValues[currentLanguage].parameter_name = getValueByLanguage(formValues.parameter_name, currentLanguage);
            });

            formattedValues.id = parseInt(formValues.id);

            return res.render("admin/webshop-parameters/edit", {
                formValues: formattedValues,
                meta: metas,
                current_locale: lang,
                csrfToken: req.csrfToken()
            });
        }

        // If NO form values, then show new product upload page
        else if ( DBformData.length === 0 ) {
            return res.redirect('/admin/webshop-params/new');
        }
    });
};

const handleEditWebshopParams = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    let webshopParameterNames = req.body;
    let { paramId } = req.params;

    // Numbers and Boolean types data check
    paramId = parseInt(paramId);

    if (isNaN(paramId) || !webshopParameterNames['parameter_name[hu]'] || !webshopParameterNames['parameter_name[sr]'] || !webshopParameterNames['parameter_name[en]'] )
    {
        return res.status(200).json({
            status: 'error',
            title: languageHandler('errors.error', lang),
            text: languageHandler('errors.wrong_data', lang),
            csrfToken: req.csrfToken()
        });
    }

    let parameterNames = {
        en: escapeHtml(webshopParameterNames['parameter_name[en]']),
        sr: escapeHtml(webshopParameterNames['parameter_name[sr]']),
        hu: escapeHtml(webshopParameterNames['parameter_name[hu]']),
    };

    var SQLParamValues = [
        JSON.stringify(parameterNames),
        moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        paramId
    ];

    const SQLUpdateWebshopParameter = "UPDATE parameters SET parameter_name = ?, updated_at = ? WHERE id = ?";

    db.query(
        SQLUpdateWebshopParameter,
        SQLParamValues,
        (err, data) => {
            if (err || data.affectedRows === 0) {
                console.log(err);
                return res.status(200).json({ status: "error", csrfToken: req.csrfToken() });
            }

            else if (data.affectedRows > 0) {
                return res.status(200).json({
                    status: "success",
                    redirect_url: `/admin/webshop-params/edit/${ paramId }`,
                    csrfToken: req.csrfToken()
                });
            }
        }
    );
};

const deleteWebshopParam = async (req, res) => {
    try {
        let { paramId } = req.params;
        paramId = parseInt(paramId);

        if ( isNaN(paramId) ) {
            return res.status(200).json({ status: "error", text: languageHandler('errors.wrong_data', process.env.ADMIN_LANG) });
        }

        const deleteWebshopParameter = "DELETE FROM parameters WHERE id = ?";
        const deleteParameterValues = "DELETE FROM product_parameters WHERE parameter_id = ?";

        let deleteResult = await DoDatabaseQuery(deleteWebshopParameter, [paramId]);
        let deleteParamValuesResult = await DoDatabaseQuery(deleteParameterValues, [paramId]);

        if (deleteResult && deleteParamValuesResult) {
            return res.status(200).json({ status: "success" });
        }

    } catch (error) {
        errorHandler(error, req, res, 'adminWebshopParametersController', 240, true);
        return res.status(200).json({ status: "error" });
    }
};

module.exports = { getWebshopParamsListPage, getWebshopParamsUploadPage, handleWebshopParamUpload, getWebshopParamsEditPage, handleEditWebshopParams, deleteWebshopParam };
