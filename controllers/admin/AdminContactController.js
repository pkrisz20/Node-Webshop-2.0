const { db } = require("../../config/db-connection");
const { setMomentLocale } = require("../../helpers/globalFunctions");
const { showServerErrorPage, showBadRequestPage } = require("../../helpers/showErrorPages");
const moment = require("moment");

const getIncomingMessagesList = (req, res) => {
    var metas = {
        title: 'Admin messages list page',
        type: "webiste",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the messages list page",
        // keywords: []
    };

    let { page = 1 } = req.query;
    page = parseInt(page);

    if (isNaN(page) || page <= 0) {
        return showBadRequestPage(req, res);
    }

    setMomentLocale("hu");
    let incomingMessages = [];

    const selectIncomingMessages = "SELECT id, first_name, last_name, phone, city, date FROM contact_messages ORDER BY id DESC LIMIT ? OFFSET ?";

    let pageOffset = (page - 1) * parseInt(process.env.ADMIN_PAGINATION);

    db.query(selectIncomingMessages, [parseInt(process.env.ADMIN_PAGINATION), pageOffset], (err, messages_list) => {

        if (err) {
            console.log(err);
            return showServerErrorPage(req, res);
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

                    return showServerErrorPage(req, res);
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

const deleteMessageItem = (req, res) => {
    let { messageId } = req.params;

    const deleteMessageItemQuery = "DELETE FROM contact_messages WHERE id = ?";

    db.query(deleteMessageItemQuery, messageId, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(200).json({ status: "error" });
        }
        else {
            return res.status(200).json({ status: "success" });
        }
    });
}

const getMessageDetails = (req, res) => {
    const { messageId } = req.params;
    const lang = req.session.lang ?? process.env.ADMIN_LANG;
    var htmlResponse = null;

    setMomentLocale("hu");

    const selectMessageDetails = "SELECT client_message FROM contact_messages WHERE id = ?";

    db.query(selectMessageDetails, messageId, (err, message_data) => {
        if (err || message_data.length === 0) {
            console.log(err);
            return res.status(200).json({
                status: "error",
                title: languageHandler('errors.error', lang ?? process.env.ADMIN_LANG),
                message: languageHandler('errors.common_error', lang ?? process.env.ADMIN_LANG),
                csrfToken: req.csrfToken()
            });
        }

        else if (message_data.length > 0) {
            let clientMessage = message_data[0].client_message ?? "<span class='badge text-uppercase fw-medium bg-danger'>Nincs megjegyzés</span>";

            htmlResponse = `
                <div class='d-flex flex-column'>
                    <div class='text-start mb-2'>
                        <p class='fs-6 mb-0'><b>Üzenet:</b> ${ clientMessage }</p>
                    </div>
                </div>
            `;

            return res.status(200).json({
                status: "success",
                htmlResponse: htmlResponse ?? "<div class='fs-6 mt-2 bg-danger link-light p-2 d-inline-block'>Nincs megjeleníthető adat!</div>",
                csrfToken: req.csrfToken()
            });
        }
    });
}

module.exports = { getIncomingMessagesList, deleteMessageItem, getMessageDetails };
