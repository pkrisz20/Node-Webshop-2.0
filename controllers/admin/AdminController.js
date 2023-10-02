const { db } = require("../../config/db-connection");
const getValueByLanguage = require("../../helpers/getValueByLanguage");
// const imagePathConverter = require("../../helpers/imagePathConverter");
const { setMomentLocale, numberWithCommas } = require("../../helpers/globalFunctions");
const getFrontTranslations = require("../../helpers/frontTranslations");
const { getOrderStatus } = require('../../helpers/admin/orderHelpers');
const languageHandler = require('../../helpers/languageHandler');
const moment = require("moment");

const getLoginPage = (req, res) => {

    if ( req.session.authenticated === true ) {
        return res.redirect("/admin/dashboard");
    }

    var metas = {
        title: 'Admin belépés',
        type: "website",
        url: `${ process.env.APP_URL }/admin/login`,
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the Admin login page",
        // keywords: []
    };

    return res.render("admin/login", {
        meta: metas,
        csrfToken: req.csrfToken(),
        frontTranslations: getFrontTranslations("hu")
    });
};

const getDashboard = (req, res) => {
    var metas = {
        title: 'Admin dashboard',
        type: "website",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the Admin dashboard page",
        // keywords: []
    };

    let lastOrders = [];
    let orderCounts = {};
    let financesPerMonth = Array(12).fill(0);
    let ordersCountPerMonth = Array(12).fill(0);

    setMomentLocale("hu");
    const selectLastOrders = "SELECT order_id, customer_firstname, customer_lastname, customer_city, customer_phone, order_status, order_sum_price, order_date FROM `orders` ORDER BY order_date DESC LIMIT ?";

    db.query(selectLastOrders, 15, (err, data) => {
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

        else if (data.length > 0) {
            data.forEach(order => {
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

                lastOrders.push(result);
            });
        }

        const selectStatusCounters = "SELECT count(*) AS total, sum(case when order_status = 'new' then 1 else 0 end) AS new_orders, sum(case when order_status = 'in process' then 1 else 0 end) AS in_process_orders, sum(case when order_status = 'done' then 1 else 0 end) AS finished_orders, sum(case when order_status = 'canceled' then 1 else 0 end) AS canceled_orders FROM orders";

        // ["new", "in process", "done", "canceled"]
        db.query(selectStatusCounters, (status_err, status_data) => {

            if (status_err) {
                console.log(status_err);
                return res.status(500).render("500", {
                    title: languageHandler("errors.server_error", process.env.ADMIN_LANG),
                    current_locale: process.env.ADMIN_LANG,
                    back_to_home: languageHandler("general.back_to_home", process.env.ADMIN_LANG),
                    learn_more: languageHandler("general.information", process.env.ADMIN_LANG),
                    csrfToken: req.csrfToken()
                });
            }

            else if (status_data.length > 0) {
                orderCounts = {
                    totalOrders: status_data[0].total,
                    new: status_data[0].new_orders,
                    in_process: status_data[0].in_process_orders,
                    finished: status_data[0].finished_orders,
                    canceled: status_data[0].canceled_orders,
                };
            }

            // Select finances per month
            const selectFinancesPerMonth = "SELECT SUM(order_sum_price) as total, MONTH(closed_order_at) as month FROM orders WHERE order_status = 'done' AND YEAR(closed_order_at) = '2023' GROUP BY MONTH(closed_order_at) ASC;";

            db.query(selectFinancesPerMonth, moment(new Date()).year(), (finance_err, monthly_finance_data) => {

                if (finance_err) {
                    console.log(finance_err);
                    return res.status(500).render("500", {
                        title: languageHandler("errors.server_error", process.env.ADMIN_LANG),
                        current_locale: process.env.ADMIN_LANG,
                        back_to_home: languageHandler("general.back_to_home", process.env.ADMIN_LANG),
                        learn_more: languageHandler("general.information", process.env.ADMIN_LANG),
                        csrfToken: req.csrfToken()
                    });
                }

                else if (monthly_finance_data.length > 0) {
                    // Overwrite the data where has value for that month
                    monthly_finance_data.forEach(finance_data => {
                        financesPerMonth[finance_data.month - 1] = finance_data.total;
                    });
                }

                // Select orders count per month
                const selectOrdersCountPerMonth = "SELECT COUNT(order_id) as total_order, MONTH(order_date) as month FROM orders WHERE YEAR(order_date) = ? GROUP BY MONTH(order_date) ASC";

                db.query(selectOrdersCountPerMonth, moment(new Date()).year(), (order_count_err, order_count_data) => {

                    if (order_count_err) {
                        console.log(order_count_err);
                        return res.status(500).render("500", {
                            title: languageHandler("errors.server_error", process.env.ADMIN_LANG),
                            current_locale: process.env.ADMIN_LANG,
                            back_to_home: languageHandler("general.back_to_home", process.env.ADMIN_LANG),
                            learn_more: languageHandler("general.information", process.env.ADMIN_LANG),
                            csrfToken: req.csrfToken()
                        });
                    }

                    else if (order_count_data.length > 0) {
                        // Overwrite the data where has value for that month
                        order_count_data.forEach(order_data => {
                            ordersCountPerMonth[order_data.month - 1] = order_data.total_order;
                        });
                    }

                    return res.render("admin/dashboard", {
                        meta: metas,
                        lastOrders: lastOrders ?? [],
                        ordersCountPerMonth: ordersCountPerMonth ?? [],
                        maxValueordersCount: Math.max.apply(null, ordersCountPerMonth ?? []),
                        financesPerMonth: financesPerMonth ?? [],
                        maxValueFromMonths: Math.max.apply(null, financesPerMonth ?? []),
                        showFinances: financesPerMonth.some(item => item > 0),
                        showOrdersCount: ordersCountPerMonth.some(item => item > 0),
                        csrfToken: req.csrfToken(),
                        orderCounts: orderCounts,
                        frontTranslations: getFrontTranslations("hu")
                    });
                });
            });
        });
    });
};

// const getProductDetails = (req, res) => {
//     const { lang } = req.body;
//     let { productId } = req.params;
//     let result = {};
//     let similarProducts = [];

//     if (!lang || !productId) {
//         return res.status(400).json({ status: "error" });
//     }

//     const sqlQuery = "SELECT id, name, description, images, image_thumbnail, price, discount_value, is_available, is_delivered, max_order_count, comments_allowed, category_id FROM products WHERE is_active = ? AND id = ?";

//     const similarProductsQuery = "SELECT products.id, products.name, products.image_thumbnail, products.price, products.discount_value, products.is_available, products.is_delivered, products.max_order_count FROM products WHERE (products.is_active = ? AND products.category_id = ? AND products.id != ?)";

//     db.query(sqlQuery, [1, productId], (err, data) => {
//         if (err) {
//             console.log(err);
//             return res.status(500).json({ status: "error" });
//         }

//         else if (data.length > 0) {
//             result = {
//                 id: parseInt(data[0].id),
//                 name: getValueByLanguage(data[0].name, lang),
//                 description: getValueByLanguage(data[0].description, lang),
//                 thumbnailImage: imagePathConverter(data[0].image_thumbnail, "products"),
//                 images: imagePathConverter(JSON.parse(data[0].images), "products"),
//                 price: data[0].price,
//                 isOnDiscount: Boolean(data[0].discount_value),
//                 discount: data[0].discount_value,
//                 isAvailable: Boolean(data[0].is_available),
//                 isPostable: Boolean(data[0].is_delivered),
//                 maxQuantity: parseInt(data[0].max_order_count),
//                 isAllowed: Boolean(data[0].comments_allowed)
//             }

//             db.query(similarProductsQuery, [1, data[0].category_id, productId], (err, similars) => {
//                 if (err) {
//                     console.log(err);
//                     return res.status(500).json({ status: "error" });
//                 }

//                 else if (similars.length > 0) {

//                     similars.forEach(element => {
//                         let tempObject = {
//                             id: parseInt(element.id),
//                             name: getValueByLanguage(element.name, lang),
//                             image: imagePathConverter(element.image_thumbnail, "products"),
//                             price: element.price,
//                             isOnDiscount: Boolean(element.discount_value),
//                             discount: element.discount_value,
//                             isAvailable: Boolean(element.is_available),
//                             isPostable: Boolean(element.is_delivered),
//                             maxQuantity: parseInt(element.max_order_count)
//                         }

//                         similarProducts.push(tempObject);
//                     });
//                 }

//                 return res.status(200).json({ status: 'success', result: result, similar: similarProducts ?? [] });
//             });
//         }
//     });
// }

const getProducts = (req, res) => {
    // const { lang } = req.body;
    let result = [];

    let sqlQuery = "SELECT products.id, products.name, products.price, products.discount_value, products.is_active, products.is_available, products.created_at, products.updated_at, categories.name AS 'category_name' FROM products INNER JOIN categories ON products.category_id = categories.id ORDER BY products.id DESC";

    // if (!lang) {
    //     return res.status(400).json({ status: "error" });
    // }

    setMomentLocale("hu");

    db.query(sqlQuery, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ status: "error" });
        }

        else if (data.length > 0) {

            data.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    name: getValueByLanguage(element.name, "hu"),
                    price: element.discount_value ?? element.price,
                    isOnDiscount: Boolean(element.discount_value),
                    isActive: Boolean(element.is_active),
                    isAvailable: Boolean(element.is_available),
                    categoryName: getValueByLanguage(element.category_name, "hu"),
                    date: element.updated_at ?? element.created_at
                }

                result.push(tempObject);
            });

            result = result.map(item => {
                return {
                    ...item,
                    price: numberWithCommas(item.price),
                    date: moment(item.date).format("YYYY MMM D. HH:mm")
                };
            });

            return res.status(200).json({
                result: result,
                cols: ['Termék neve', 'Ár', 'Kedvezmény', 'Aktiv', 'Rendelhető', 'Kategória', 'Utoljára módositva'],
                status: "success"
            });
        }
    });
}

// const getProductComments = (req, res) => {
//     const { lang } = req.body;
//     const { itemId } = req.body;
//     let result = [];
//     const sqlQuery = "SELECT product_comments.id, product_comments.name, product_comments.comment, product_comments.date FROM product_comments WHERE product_comments.is_active = ? AND product_comments.product_id = ?";

//     if (!lang || !itemId) {
//         return res.status(400).json({ status: "error" });
//     }

//     db.query(sqlQuery, [1, itemId], (err, data) => {
//         if (err) {
//             console.log(err);
//             return res.status(500).json({ status: "error" });
//         }

//         else if (data.length > 0) {
//             setMomentLocale(lang);

//             data.forEach(element => {
//                 let tempObject = {
//                     id: parseInt(element.id),
//                     name: element.name,
//                     description: element.comment,
//                     date: element.date,
//                 }

//                 result.push(tempObject);
//             });

//             result = result.map(item => {
//                 return {
//                     ...item,
//                     date: moment(item.date, "YYYY-MM-DD HH:mm").fromNow()
//                 };
//             });
//         }

//         return res.status(200).json({ status: 'success', comments: result ?? [] });
//     });
// }

// const getCategories = (req, res) => {
//     const { lang } = req.body;
//     let result = [];
//     const sqlQuery = "SELECT id, name, icon FROM categories";

//     if (!lang) {
//         return res.status(400).json({ status: "error" });
//     }

//     db.query(sqlQuery, (err, data) => {
//         if (err) {
//             console.log(err);
//             return res.status(500).json({ status: "error" });
//         }

//         else if (data.length > 0) {
//             data.forEach(element => {
//                 let tempObject = {
//                     id: parseInt(element.id),
//                     name: getValueByLanguage(element.name, lang),
//                     icon: imagePathConverter(element.icon, "categories")
//                 }

//                 result.push(tempObject);
//             });
//         }

//         return res.status(200).json({ status: 'success', result: result ?? [] });
//     });
// };

module.exports = { getProducts, getLoginPage, getDashboard };
