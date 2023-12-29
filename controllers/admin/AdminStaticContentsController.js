const { db } = require("../../config/db-connection");
const getValueByLanguage = require("../../helpers/getValueByLanguage");
const { limitText, setMomentLocale, escapeHtml } = require("../../helpers/globalFunctions");
const { getIconByActivity } = require("../../helpers/admin/getIconByActivity");
const { showServerErrorPage, showBadRequestPage } = require("../../helpers/showErrorPages");
const getValidFormValues = require("../../helpers/admin/getValidFormValues");
const languageHandler = require("../../helpers/languageHandler");
const moment = require("moment");

const getFAQListPage = (req, res) => {
    const lang = req.session.lang ?? process.env.ADMIN_LANG;
    let FAQList = [];
    setMomentLocale("hu");

    var metas = {
        title: "This is the FAQ admin list page",
        type: "website",
        url: `${ process.env.APP_URL }/admmin/faq/list`,
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the FAQ admin list page",
        // keywords: []
    };

    const selectFAQList = "SELECT id, question, is_active, created_at, updated_at FROM faq ORDER BY id DESC";

    db.query(selectFAQList, (err, data) => {
        if (err) {
            console.log(err);
            return showServerErrorPage(req, res);
        }

        else if (data.length > 0) {

            data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    question: limitText(getValueByLanguage(element.question, lang), 60),
                    is_active: getIconByActivity(element.is_active ?? 0),
                    date: element.updated_at != null ? element.updated_at : element.created_at
                }

                FAQList.push(tempObject);
            });

            FAQList = FAQList.map(item => {
                return {
                    ...item,
                    date: moment(item.date).format("YYYY. MMMM DD. HH:mm:ss"),
                };
            });
        }

        return res.render("admin/FAQ/list", {
            FAQList: FAQList ?? [],
            meta: metas,
            csrfToken: req.csrfToken()
        });
    });
}

const deleteFAQItem = (req, res) => {
    let { faqId } = req.params;

    const deleteFAQItemQuery = "DELETE FROM faq WHERE id = ?";

    db.query(deleteFAQItemQuery, faqId, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(200).json({ status: "error" });
        }
        else {
            return res.status(200).json({ status: "success" });
        }
    });
}

const getNewFAQPage = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    var metas = {
        title: "Új GYIK",
        type: "website",
        // url: `${ process.env.APP_URL }/${ lang }/faq`,
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the product upload page",
    };

    return res.render("admin/FAQ/new", {
        meta: metas,
        current_locale: lang,
        csrfToken: req.csrfToken()
    });
}

const handleFAQUpload = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    let data = req.body;
    let is_active = parseInt(data.is_active ?? 0);

    if (
        isNaN(is_active)
        || !data['question[hu]']
        || !data['question[sr]']
        || !data['question[en]']
        || !data['answer[hu]']
        || !data['answer[sr]']
        || !data['answer[en]']
    )
    {
        return res.status(200).json({
            status: 'error',
            title: languageHandler('errors.error', lang),
            text: languageHandler('errors.wrong_data', lang),
            csrfToken: req.csrfToken()
        });
    }

    let questions = {
        en: escapeHtml(data['question[en]']),
        sr: escapeHtml(data['question[sr]']),
        hu: escapeHtml(data['question[hu]']),
    };

    let answers = {
        en: data['answer[en]'],
        sr: data['answer[sr]'],
        hu: data['answer[hu]']
    };

    const SQLInsertFAQ = "INSERT INTO faq (question, answer, is_active, created_at) VALUES (?, ?, ?, ?)";

    db.query(
        SQLInsertFAQ,
        [
            JSON.stringify(questions),
            JSON.stringify(answers),
            is_active,
            moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        ],
        (err, data) => {
            if (err) {
                console.log(err);
                return res.status(200).json({ status: "error", csrfToken: req.csrfToken() });
            }

            else if (data.affectedRows > 0) {
                return res.status(200).json({
                    status: "success",
                    redirect_url: `/admin/faq/edit/${ data.insertId }`,
                    csrfToken: req.csrfToken()
                });
            }
        }
    );
}

const getFAQEditPage = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    var metas = {
        title: "Szerkesztés",
        type: "website",
        // url: `${ process.env.APP_URL }/admin/category/edit`,
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the faq edit page",
    };

    let { faqId } = req.params;
    faqId = parseInt(faqId);

    if ( isNaN(faqId) ) {
        return showBadRequestPage(req, res);
    }

    // function params => Table, database ID, callback
    getValidFormValues('faq', faqId, function (err, DBformData) {
        // If there is ANY error, then the ID does not exist -> show new upload form
        if (err) {
            return res.redirect('/admin/faq/new');
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
                formattedValues[currentLanguage].question = getValueByLanguage(formValues.question, currentLanguage);
                formattedValues[currentLanguage].answer = formValues.answer != null ? getValueByLanguage(formValues.answer, currentLanguage) : null;
            });

            formattedValues.id = parseInt(formValues.id);
            formattedValues.is_active = parseInt(formValues.is_active ?? 0);

            return res.render("admin/faq/edit", {
                formValues: formattedValues,
                meta: metas,
                current_locale: lang,
                csrfToken: req.csrfToken()
            });
        }

        // If NO form values, then show new product upload page
        else if ( DBformData.length === 0 ) {
            return res.redirect('/admin/faq/new');
        }
    });
}

const handleEditFAQ = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    let data = req.body;
    let is_active = parseInt(data.is_active ?? 0);
    let { faqId } = req.params;
    faqId = parseInt(faqId);

    if (
        isNaN(faqId)
        || isNaN(is_active)
        || !data['question[hu]']
        || !data['question[sr]']
        || !data['question[en]']
        || !data['answer[hu]']
        || !data['answer[sr]']
        || !data['answer[en]']
    )
    {
        return res.status(200).json({
            status: 'error',
            title: languageHandler('errors.error', lang),
            text: languageHandler('errors.wrong_data', lang),
            csrfToken: req.csrfToken()
        });
    }

    let questions = {
        en: escapeHtml(data['question[en]']),
        sr: escapeHtml(data['question[sr]']),
        hu: escapeHtml(data['question[hu]']),
    };

    let answers = {
        en: data['answer[en]'],
        sr: data['answer[sr]'],
        hu: data['answer[hu]']
    };

    const SQLUpdateFAQ = "UPDATE faq SET question = ?, answer = ?, is_active = ?, updated_at = ? WHERE id = ?";

    db.query(
        SQLUpdateFAQ,
        [
            JSON.stringify(questions),
            JSON.stringify(answers),
            is_active,
            moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            faqId
        ],
        (err, data) => {
            if (err) {
                console.log(err);
                return res.status(200).json({ status: "error", csrfToken: req.csrfToken() });
            }

            else if (data.affectedRows > 0) {
                return res.status(200).json({
                    status: "success",
                    redirect_url: `/admin/faq/edit/${ faqId }`,
                    csrfToken: req.csrfToken()
                });
            }
        }
    );
}

module.exports = { getFAQListPage, deleteFAQItem, getNewFAQPage, handleFAQUpload, getFAQEditPage, handleEditFAQ };
