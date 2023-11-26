const { db } = require("../../config/db-connection");
const { setMomentLocale, numberWithCommas, createUniqueID } = require("../../helpers/globalFunctions");
const { getOrderStatus } = require('../../helpers/admin/orderHelpers');
const { showServerErrorPage } = require("../../helpers/showErrorPages");
const languageHandler = require('../../helpers/languageHandler');
const moment = require("moment");
const multer = require("multer");
const path = require("path");

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
        current_locale: process.env.ADMIN_LANG,
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
            return showServerErrorPage(req, res);
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
                return showServerErrorPage(req, res);
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
                    return showServerErrorPage(req, res);
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
                        return showServerErrorPage(req, res);
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
                    });
                });
            });
        });
    });
};

const uploadImageFiles = (req, res) => {

    const fileStorageImage = multer.diskStorage({
        destination: (req, file, callback) => {
            // Set the exact destination inside the files folder
            callback(null, path.join('./files/' + req.params.folder));
        },
        filename: (req, file, callback) => {
            callback(null, createUniqueID() + "-" + file.originalname);
        }
    });

    const uploadImage = multer({
        storage: fileStorageImage,
        limits: { fileSize: 4000000 },
        fileFilter: function (req, file, callback) {
            const enabledFileTypes = /jpeg|jpg|png/;
            const extname = enabledFileTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = enabledFileTypes.test(file.mimetype);

            if (mimetype && extname) {
                return callback(null, true);
            }
            else {
                return res.status(200).json({
                    status: 'error',
                    title: 'Nem megfelelő képformátum',
                    message: 'Engedélyezett képformátumok: jpg, jpeg, png',
                    csrfToken: req.csrfToken()
                });
            }
        }
    }).single("files");

    uploadImage(req, res, (err) => {
        if (err) {
            console.error(err);

            return res.status(200).json({
                status: 'error',
                csrfToken: req.csrfToken()
            });
        }
        else {
            if (req.file == undefined) {
                return res.status(200).json({
                    status: 'error',
                    message: languageHandler('errors.no_selected_file', process.env.ADMIN_LANG),
                    csrfToken: req.csrfToken()
                });
            }
            else {
                // TODO: save the image path into database
                // Here you can earn the req.body => it will include the ID for database query
                const finalImageName = req.file.filename;
                console.log(req.file);
                console.log(finalImageName);
                return res.status(200).json({ status: 'success' });

                const sqlQuery = "UPDATE movies SET image = ? WHERE id = ?;";

                db.query(sqlQuery, [finalImageName, movieId], (error, result) => {
                    if (error) {
                        console.log(error);
                        res.json({ status: false, message: "Something went wrong" });
                    }
                    if (result) {
                        res.json({ status: true, message: "Successfully changed thumbnail image!" });
                    }
                });
            }
        }
    });
};

const uploadMultipleImages = (req, res) => {

    const fileStorageImage = multer.diskStorage({
        destination: (req, file, callback) => {
            // Set the exact destination inside the files folder
            callback(null, path.join('./files/' + req.params.folder));
        },
        filename: (req, file, callback) => {
            callback(null, createUniqueID() + "-" + file.originalname);
        }
    });

    const uploadImage = multer({
        storage: fileStorageImage,
        limits: { fileSize: 4000000 },
        fileFilter: function (req, file, callback) {
            const enabledFileTypes = /jpeg|jpg|png/;
            const extname = enabledFileTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = enabledFileTypes.test(file.mimetype);

            if (mimetype && extname) {
                return callback(null, true);
            }
            else {
                return res.status(200).json({
                    status: 'error',
                    title: 'Nem megfelelő képformátum',
                    message: 'Engedélyezett képformátumok: jpg, jpeg, png',
                    csrfToken: req.csrfToken()
                });
            }
        }
    }).any("files");

    uploadImage(req, res, (err) => {
        if (err) {
            console.error(err);

            return res.status(200).json({
                status: 'error',
                csrfToken: req.csrfToken()
            });
        }
        else {
            if (req.files == undefined) {
                return res.status(200).json({
                    status: 'error',
                    message: languageHandler('errors.no_selected_file', process.env.ADMIN_LANG),
                    csrfToken: req.csrfToken()
                });
            }
            else {
                // TODO: save the path of images into database
                // Here you can earn the req.body => it will include the ID for database query
                // You can use the req.files variable, it's an array which includes the images
                console.log(req.files);
                return res.status(200).json({ status: 'success' });

                const sqlQuery = "UPDATE movies SET image = ? WHERE id = ?;";

                db.query(sqlQuery, [finalImageName, movieId], (error, result) => {
                    if (error) {
                        console.log(error);
                        res.json({ status: false, message: "Something went wrong" });
                    }
                    if (result) {
                        res.json({ status: true, message: "Successfully changed thumbnail image!" });
                    }
                });
            }
        }
    });
};

module.exports = { getLoginPage, getDashboard, uploadImageFiles, uploadMultipleImages };
