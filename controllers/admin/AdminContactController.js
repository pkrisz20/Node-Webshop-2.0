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
    setMomentLocale("hu");

    let incomingMessages = [];
    const lang = req.session.lang ?? process.env.ADMIN_LANG;

    // TODO: Finish the query with limit offset for pagination
    const selectIncomingMessages = "SELECT id, first_name, last_name, phone, city, date FROM contact_messages ORDER BY id DESC";

    db.query(selectIncomingMessages, 1, (err, messages_list) => {

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
        }

        return res.render("admin/messages/list", {
            meta: metas,
            incomingMessages: incomingMessages ?? [],
            csrfToken: req.csrfToken()
        });
    });
}

module.exports = { getIncomingMessagesList };
