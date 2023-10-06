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
    let ordersList = [];
    const selectOrdersList = "SELECT order_id, customer_firstname, customer_lastname, customer_city, customer_phone, order_status, order_sum_price, order_date FROM `orders` ORDER BY order_date DESC";

    db.query(selectOrdersList, 15, (err, orders) => {
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
        }

        return res.render("admin/orders/list", {
            meta: metas,
            ordersList: ordersList ?? [],
            csrfToken: req.csrfToken(),
        });
    });
};

module.exports = { deleteOrder, getOrdersListPage };
