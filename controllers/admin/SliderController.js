const { db } = require("../../config/db-connection");
const getValueByLanguage = require("../../helpers/getValueByLanguage");
const imagePathConverter = require("../../helpers/imagePathConverter");
const { setMomentLocale, limitText, escapeHtml } = require("../../helpers/globalFunctions");
const { getIconByActivity } = require('../../helpers/admin/getIconByActivity');
const { showServerErrorPage, showBadRequestPage } = require("../../helpers/showErrorPages");
const getValidFormValues = require("../../helpers/admin/getValidFormValues");
const languageHandler = require("../../helpers/languageHandler");
const moment = require("moment");

const getSlidersListPage = (req, res) => {
    var metas = {
        title: 'Admin sliders list',
        type: "website",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the Slider list page page",
        // keywords: []
    };
    setMomentLocale("hu");

    let sliders = [];
    const lang = req.session.lang ?? process.env.ADMIN_LANG;
    const selectSlidersQuery = "SELECT id, title, is_active, created_at, updated_at FROM heros";

    db.query(selectSlidersQuery, (err, hero_list) => {

        if (err) {
            console.log(err);
            return showServerErrorPage(req, res);
        }

        if (hero_list.length > 0) {

            hero_list.forEach(hero => {
                let tempObject = {
                    id: parseInt(hero.id),
                    title: getValueByLanguage(hero.title, lang),
                    is_active: getIconByActivity(hero.is_active ?? 0),
                    date: hero.updated_at != null ? hero.updated_at : hero.created_at
                }

                sliders.push(tempObject);
            });

            sliders = sliders.map(item => {
                return {
                    ...item,
                    title: limitText(item.title, 40),
                    date: moment(item.date).format("YYYY. MMMM DD. HH:mm:ss"),
                };
            });
        }

        return res.render("admin/sliders/list", {
            meta: metas,
            sliders: sliders ?? [],
            csrfToken: req.csrfToken()
        });
    });
};

const getSliderUploadPage = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    var metas = {
        title: "Új termék",
        type: "website",
        // url: `${ process.env.APP_URL }/${ lang }/faq`,
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the sliders upload page",
    };

    return res.render("admin/sliders/new", {
        meta: metas,
        current_locale: lang,
        csrfToken: req.csrfToken()
    });
};

const handleSliderUpload = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    let heroData = req.body;

    // Numbers and Boolean types data check
    let is_active = parseInt(heroData.is_active ?? 0);

    if (
        isNaN(is_active)
        || !heroData['target_page']
        || !heroData['title[hu]']
        || !heroData['title[sr]']
        || !heroData['title[en]']
    )
    {
        return res.status(200).json({
            status: 'error',
            title: languageHandler('errors.error', lang),
            text: languageHandler('errors.wrong_data', lang),
            csrfToken: req.csrfToken()
        });
    }

    // The hero titles are required
    let heroTitles = {
        en: escapeHtml(heroData['title[en]']),
        sr: escapeHtml(heroData['title[sr]']),
        hu: escapeHtml(heroData['title[hu]']),
    };
    // The short description simple textarea, it's a string
    let heroDesc = {
        en: heroData['subtitle[en]'].length > 0 ? escapeHtml(heroData['subtitle[en]']) : null,
        sr: heroData['subtitle[sr]'].length > 0 ? escapeHtml(heroData['subtitle[sr]']) : null,
        hu: heroData['subtitle[hu]'].length > 0 ? escapeHtml(heroData['subtitle[hu]']) : null
    };

    let isThereAnyLink = heroData['link[hu]'].length > 0 || heroData['link[sr]'].length > 0 || heroData['link[en]'].length > 0;
    let isThereAnyButtonText = heroData['button[hu]'].length > 0 || heroData['button[sr]'].length > 0 || heroData['button[en]'].length > 0;

    if ( isThereAnyLink ) {
        var heroLinks = {
            en: heroData['link[en]'].length > 0 ? escapeHtml(heroData['link[en]']) : null,
            sr: heroData['link[sr]'].length > 0 ? escapeHtml(heroData['link[sr]']) : null,
            hu: heroData['link[hu]'].length > 0 ? escapeHtml(heroData['link[hu]']) : null
        };

        if ( isThereAnyButtonText ) {
            var buttonTexts = {
                en: heroData['button[en]'].length > 0 ? escapeHtml(heroData['button[en]']) : null,
                sr: heroData['button[sr]'].length > 0 ? escapeHtml(heroData['button[sr]']) : null,
                hu: heroData['button[hu]'].length > 0 ? escapeHtml(heroData['button[hu]']) : null
            };
        }
    }

    var heroParamValues = [
        JSON.stringify(heroTitles),
        JSON.stringify(heroDesc),
        heroData['target_page'] ?? '_blank',
        is_active,
        moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    ];

    isThereAnyLink && heroParamValues.push(JSON.stringify(heroLinks));
    isThereAnyButtonText && heroParamValues.push(JSON.stringify(buttonTexts));
    let paramsCount = Array(heroParamValues.length).fill("?").join(",");

    const SQLInsertHero = `INSERT INTO hero (title, subtitle, target_page, is_active, created_at ${ isThereAnyLink ? ', link' : '' } ${ isThereAnyButtonText ? ', button_text' : '' }) VALUES(${ paramsCount })`;

    db.query(
        SQLInsertHero,
        heroParamValues,
        (err, data) => {
            if (err || data.affectedRows === 0) {
                console.log(err);
                return res.status(200).json({ status: "error", csrfToken: req.csrfToken() });
            }
            else if (data.affectedRows > 0) {
                return res.status(200).json({
                    status: "success",
                    redirect_url: `/admin/slider/edit/${ data.insertId }`,
                    csrfToken: req.csrfToken()
                });
            }
        }
    );
};

const getSliderEditPage = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    var metas = {
        title: "Szerkesztés",
        type: "website",
        // url: `${ process.env.APP_URL }/${ lang }/edit`,
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the sliders edit page",
    };

    let { sliderId } = req.params;
    sliderId = parseInt(sliderId);

    if ( isNaN(sliderId) ) {
        return showBadRequestPage(req, res);
    }

    // function params => Table, database ID, callback
    getValidFormValues('heros', sliderId, function (err, DBformData) {
        // If there is ANY error, then the ID does not exist -> show new upload form
        if (err) {
            return res.redirect('/admin/slider/new');
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
                formattedValues[currentLanguage].title = getValueByLanguage(formValues.title, currentLanguage);
                formattedValues[currentLanguage].subtitle = formValues.subtitle != null ? getValueByLanguage(formValues.subtitle, currentLanguage) : null;
                formattedValues[currentLanguage].button = formValues.button_text != null ? getValueByLanguage(formValues.button_text, currentLanguage) : null;
                formattedValues[currentLanguage].link = formValues.link != null ? getValueByLanguage(formValues.link, currentLanguage) : null;
            });

            formattedValues.image = formValues.image != null ? imagePathConverter(formValues.image, 'heros') : null;
            formattedValues.id = parseInt(formValues.id);
            formattedValues.is_active = parseInt(formValues.is_active ?? 0);
            formattedValues.target_page = formValues.target_page ?? '_blank';

            return res.render("admin/sliders/edit", {
                formValues: formattedValues,
                meta: metas,
                current_locale: lang,
                csrfToken: req.csrfToken()
            });
        }

        // If NO form values, then show new product upload page
        else if ( DBformData.length === 0 ) {
            return res.redirect('/admin/slider/new');
        }
    });
};

const handleEditSlider = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    let heroData = req.body;
    let { sliderId } = req.params;

    // Numbers and Boolean types data check
    let is_active = parseInt(heroData.is_active ?? 0);
    sliderId = parseInt(sliderId);

    if ( isNaN(is_active) || isNaN(sliderId) || !heroData['title[hu]'] || !heroData['title[sr]'] || !heroData['title[en]'] )
    {
        return res.status(200).json({
            status: 'error',
            title: languageHandler('errors.error', lang),
            text: languageHandler('errors.wrong_data', lang),
            csrfToken: req.csrfToken()
        });
    }

    // The hero titles are required
    let heroTitles = {
        en: escapeHtml(heroData['title[en]']),
        sr: escapeHtml(heroData['title[sr]']),
        hu: escapeHtml(heroData['title[hu]']),
    };
    // The short description simple textarea, it's a string
    let heroDesc = {
        en: heroData['subtitle[en]'].length > 0 ? escapeHtml(heroData['subtitle[en]']) : null,
        sr: heroData['subtitle[sr]'].length > 0 ? escapeHtml(heroData['subtitle[sr]']) : null,
        hu: heroData['subtitle[hu]'].length > 0 ? escapeHtml(heroData['subtitle[hu]']) : null
    };

    let isThereAnyLink = heroData['link[hu]'].length > 0 || heroData['link[sr]'].length > 0 || heroData['link[en]'].length > 0;
    let isThereAnyButtonText = heroData['button[hu]'].length > 0 || heroData['button[sr]'].length > 0 || heroData['button[en]'].length > 0;

    if ( isThereAnyLink ) {
        var heroLinks = {
            en: heroData['link[en]'].length > 0 ? escapeHtml(heroData['link[en]']) : null,
            sr: heroData['link[sr]'].length > 0 ? escapeHtml(heroData['link[sr]']) : null,
            hu: heroData['link[hu]'].length > 0 ? escapeHtml(heroData['link[hu]']) : null
        };

        if ( isThereAnyButtonText ) {
            var buttonTexts = {
                en: heroData['button[en]'].length > 0 ? escapeHtml(heroData['button[en]']) : null,
                sr: heroData['button[sr]'].length > 0 ? escapeHtml(heroData['button[sr]']) : null,
                hu: heroData['button[hu]'].length > 0 ? escapeHtml(heroData['button[hu]']) : null
            };
        }
    }

    const SQLUpdateHero = "UPDATE heros SET title = ?, subtitle = ?, link = ?, button_text = ?, target_page = ?, is_active = ?, updated_at = ? WHERE id = ?";

    db.query(
        SQLUpdateHero,
        [
            JSON.stringify(heroTitles),
            JSON.stringify(heroDesc),
            isThereAnyLink ? JSON.stringify(heroLinks) : null,
            isThereAnyButtonText ? JSON.stringify(buttonTexts) : null,
            heroData['target_page'] ?? '_blank',
            is_active,
            moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            sliderId
        ],
        (err, data) => {
            if (err || data.affectedRows === 0) {
                console.log(err);
                return res.status(200).json({ status: "error", csrfToken: req.csrfToken() });
            }

            else if (data.affectedRows > 0) {
                return res.status(200).json({
                    status: "success",
                    redirect_url: `/admin/slider/edit/${ sliderId }`,
                    csrfToken: req.csrfToken()
                });
            }
        }
    );
};

module.exports = { getSlidersListPage, getSliderUploadPage, handleSliderUpload, getSliderEditPage, handleEditSlider };
