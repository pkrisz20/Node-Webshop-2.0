const { db } = require("../../config/db-config");
const getValueByLanguage = require("../../helpers/getValueByLanguage");
const { setMomentLocale } = require("../../helpers/globalFunctions");
const { getIconByActivity } = require('../../helpers/admin/getIconByActivity');
const languageHandler = require('../../helpers/languageHandler');
const moment = require("moment");

const getSlidersListPage = (req, res) => {
    var metas = {
        title: 'Admin sliders list',
        type: "page",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the Slider list page page",
        // keywords: []
    };
    setMomentLocale("hu");

    let sliders = [];
    const lang = req.session.lang ?? process.env.ADMIN_LANG;
    const selectSlidersQuery = "SELECT id, title, is_active, created_at, updated_at FROM hero";

    db.query(selectSlidersQuery, (err, hero_list) => {

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

module.exports = { getSlidersListPage };
