const { db } = require("../../config/db-connection");
const getValueByLanguage = require("../../helpers/getValueByLanguage");
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

const getOrderDetails = (req, res) => {

    const { orderId } = req.params;
    const lang = req.session.lang ?? process.env.ADMIN_LANG;
    setMomentLocale("hu");

    let htmlProductsList = "";
    let orderInfo = {
        email: null,
        address: null,
        postalCode: null,
        note: null,
        fullName: null,
        city: null,
        phone: null,
        sumPrice: 0
    };

    const selectOrderDetails = "SELECT orders.customer_firstname, orders.customer_lastname, orders.customer_email, orders.customer_address, orders.customer_postal_code, orders.customer_city, orders.customer_phone, orders.customer_note, orders.order_sum_price FROM orders WHERE orders.order_id = ?";

    const selectProductDetailsByOrder = "SELECT products.name, products.price, products.discount_value, order_details.quantity AS 'ordered_quantity' FROM products INNER JOIN order_details ON products.id = order_details.product_id WHERE order_details.order_id = ?";

    db.query(selectOrderDetails, orderId, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(200).json({
                status: "error",
                title: languageHandler('errors.error', lang ?? process.env.ADMIN_LANG),
                message: languageHandler('errors.common_error', lang ?? process.env.ADMIN_LANG),
                csrfToken: req.csrfToken()
            });
        }

        else if (data.length > 0) {
            orderInfo.email = data[0].customer_email;
            orderInfo.postalCode = data[0].customer_postal_code;
            orderInfo.address = data[0].customer_address;
            orderInfo.note = data[0].customer_note ?? "<span class='badge text-uppercase fw-medium bg-danger'>Nincs megjegyzés</span>";
            orderInfo.fullName = data[0].customer_firstname + " " + data[0].customer_lastname;
            orderInfo.city = data[0].customer_city;
            orderInfo.phone = data[0].customer_phone;
            orderInfo.sumPrice = numberWithCommas(data[0].order_sum_price);
        }

        db.query(selectProductDetailsByOrder, orderId, (err_details, products_details_data) => {
            if (err_details) {
                console.log(err_details);
                return res.status(200).json({
                    status: "error",
                    title: languageHandler('errors.error', req.session.lang),
                    message: languageHandler('errors.common_error', req.session.lang),
                    csrfToken: req.csrfToken()
                });
            }

            else if (products_details_data.length > 0) {

                products_details_data.forEach(productData => {

                    htmlProductsList += `<p class='fs-6 mb-0'>${ productData.ordered_quantity } x ${ getValueByLanguage(productData.name, lang ?? process.env.ADMIN_LANG) } (${ numberWithCommas(productData.discount_value != null ? productData.discount_value : productData.price) } RSD / db)</p>`;
                });
            }

            var htmlResponse = `
                <div class='d-flex flex-column'>
                    <div class='text-start mb-2'>
                        <strong class='text-uppercase fs-5 bg-warning px-1'>Megrendelő adatai</strong>
                        <p class='fs-6 mb-0'><b>Teljes név:</b> ${ orderInfo.fullName }</p>
                        <p class='fs-6 mb-0'><b>Település:</b> ${ orderInfo.city }</p>
                        <p class='fs-6 mb-0'><b>E-mail:</b> ${ orderInfo.email }</p>
                        <p class='fs-6 mb-0'><b>Szállítási cím:</b> ${ orderInfo.address }</p>
                        <p class='fs-6 mb-0'><b>Irányítószám:</b> ${ orderInfo.postalCode }</p>
                        <p class='fs-6 mb-0'><b>Hozzáfűzött megjegyzés:</b> ${ orderInfo.note }</p>
                    </div>
                    <div class='text-start'>
                        <strong class='text-uppercase fs-5 bg-warning px-1'>Rendelt termékek</strong>
                        ${ htmlProductsList }
                        <div class='fs-6 mt-2 bg-danger link-light p-2 d-inline-block'>Fizetendő összeg: <b>${ orderInfo.sumPrice } RSD</b></div>
                    </div>
                </div>
            `;

            return res.status(200).json({
                status: "success",
                htmlResponse: htmlResponse ?? "<div class='fs-6 mt-2 bg-danger link-light p-2 d-inline-block'>Nincs megjeleníthető adat!</div>",
                csrfToken: req.csrfToken()
            });
        });
    });
};

module.exports = { deleteOrder, getOrdersListPage, getOrderDetails };
