const { db } = require("../../config/db-connection");
const languageHandler = require("../../helpers/languageHandler");
const { getOrderStatus } = require('../../helpers/admin/orderHelpers');
const { numberWithCommas, setMomentLocale } = require("../../helpers/globalFunctions");
const moment = require("moment");

const deleteOrder = (req, res) => {
    let { orderId } = req.params;

    const deleteOrderQuery = "DELETE FROM orders WHERE order_id = ?";

    db.query(deleteOrderQuery, orderId, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(200).json({ status: "error" });
        }
        else {
            return res.status(200).json({ status: "success" });
        }
    });
};

const getOrdersListPage = (req, res) => {

    var metas = {
        title: 'Admin orders list page',
        type: "webiste",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the orders list page",
        // keywords: []
    };

    setMomentLocale("hu");

    const lang = req.session.lang ?? process.env.ADMIN_LANG;
    let ordersList = [];
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

    const selectOrdersList = "SELECT order_id, customer_firstname, customer_lastname, customer_city, customer_phone, order_status, order_sum_price, order_date FROM `orders` ORDER BY order_date DESC LIMIT ? OFFSET ?";

    let pageOffset = (page - 1) * parseInt(process.env.ADMIN_PAGINATION);

    db.query(selectOrdersList, [parseInt(process.env.ADMIN_PAGINATION), pageOffset], (err, orders) => {
        if (err) {
            console.log(err);
            return res.status(500).render("500", {
                title: languageHandler("errors.server_error", process.env.ADMIN_LANG),
                current_locale: process.env.ADMIN_LANG,
                back_to_home: languageHandler("general.back_to_home", process.env.ADMIN_LANG),
                learn_more: languageHandler("general.information", process.env.ADMIN_LANG),
                csrfToken: req.csrfToken()
            });
        }

        else if (orders.length == 0) {
            return res.render("admin/orders/list", {
                meta: metas,
                pageCount: 0,
                ordersList: ordersList ?? [],
                csrfToken: req.csrfToken()
            });
        }

        else if (orders.length > 0) {
            orders.forEach(order => {
                let result = {
                    id: order.order_id,
                    firstname: order.customer_firstname,
                    lastname: order.customer_lastname,
                    city: order.customer_city,
                    phone: order.customer_phone,
                    statusData: getOrderStatus(order.order_status),
                    sumPrice: numberWithCommas(order.order_sum_price),
                    orderDate: moment(order.order_date).format("YYYY. MMMM DD. HH:mm").toLocaleLowerCase()
                }

                ordersList.push(result);
            });

            let selectForPagination = "SELECT COUNT(orders.order_id) AS 'each_article_count' FROM orders";

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

                    return res.render("admin/orders/list", {
                        pageCount: parseInt(pageCount),
                        currentPage: parseInt(page),
                        paginationLink: "orders",
                        meta: metas,
                        ordersList: ordersList ?? [],
                        csrfToken: req.csrfToken(),
                    });
                }
            });
        }
    });
};

module.exports = { deleteOrder, getOrdersListPage };
