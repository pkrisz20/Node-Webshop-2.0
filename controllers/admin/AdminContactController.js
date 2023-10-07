const { db } = require("../../config/db-connection");
const { setMomentLocale } = require("../../helpers/globalFunctions");
const languageHandler = require("../../helpers/languageHandler");
const moment = require("moment");

const getIncomingMessagesList = (req, res) => {
    var metas = {
        title: 'Admin messages list page',
        type: "webiste",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the messages list page",
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
    let incomingMessages = [];

    const selectIncomingMessages = "SELECT id, first_name, last_name, phone, city, date FROM contact_messages ORDER BY id DESC LIMIT ? OFFSET ?";

    let pageOffset = (page - 1) * parseInt(process.env.ADMIN_PAGINATION);

    db.query(selectIncomingMessages, [parseInt(process.env.ADMIN_PAGINATION), pageOffset], (err, messages_list) => {

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

        else if (messages_list.length == 0) {
            return res.render("admin/messages/list", {
                meta: metas,
                pageCount: 0,
                incomingMessages: incomingMessages ?? [],
                csrfToken: req.csrfToken()
            });
        }

        if (messages_list.length > 0) {

            messages_list.forEach(message => {
                let tempObject = {
                    contactId: parseInt(message.id),
                    firstName: message.first_name,
                    lastName: message.last_name,
                    phone: message.phone,
                    city: message.city,
                    date: message.date,
                }

                incomingMessages.push(tempObject);
            });

            incomingMessages = incomingMessages.map(item => {
                return {
                    ...item,
                    date: moment(item.date).format("YYYY. MMMM DD. HH:mm:ss"),
                };
            });

            let selectForPagination = "SELECT COUNT(contact_messages.id) AS 'each_article_count' FROM contact_messages";

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

                    return res.render("admin/messages/list", {
                        meta: metas,
                        incomingMessages: incomingMessages ?? [],
                        csrfToken: req.csrfToken(),
                        pageCount: parseInt(pageCount),
                        currentPage: parseInt(page),
                        paginationLink: "messages",
                    });
                }
            });
        }
    });
}

module.exports = { getIncomingMessagesList };
