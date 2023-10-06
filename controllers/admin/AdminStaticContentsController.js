const { db } = require("../../config/db-connection");
const getValueByLanguage = require("../../helpers/getValueByLanguage");
const languageHandler = require("../../helpers/languageHandler");
const { limitText, setMomentLocale } = require("../../helpers/globalFunctions");
const { getIconByActivity } = require("../../helpers/admin/getIconByActivity");
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
            return res.status(500).render("500", {
                title: languageHandler("errors.server_error", lang ?? process.env.ADMIN_LANG),
                current_locale: lang ?? process.env.ADMIN_LANG,
                back_to_home: languageHandler("general.back_to_home", lang ?? process.env.ADMIN_LANG),
                learn_more: languageHandler("general.information", lang ?? process.env.ADMIN_LANG),
                csrfToken: req.csrfToken()
            });
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

module.exports = { getFAQListPage };
