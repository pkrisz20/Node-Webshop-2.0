const { db } = require("../../config/db-connection");
const { setMomentLocale, numberWithCommas, createUniqueID, getLast, escapeHtml } = require("../../helpers/globalFunctions");
const { getOrderStatus, isOrderStatusEditable, getSelectableOrderStatuses } = require('../../helpers/admin/orderHelpers');
const { saveImageToDatabase } = require('../../helpers/admin/saveImageToDatabase');
const { deleteImageFromDatabase } = require('../../helpers/admin/deleteImageFromDatabase');
const { showServerErrorPage } = require("../../helpers/showErrorPages");
const getValidFormValues = require('../../helpers/admin/getValidFormValues');
const getValueByLanguage = require('../../helpers/getValueByLanguage');
const languageHandler = require('../../helpers/languageHandler');
const moment = require("moment");
const multer = require("multer");
const path = require("path");
const fs = require('fs');

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
                    can_edit_status: isOrderStatusEditable(order.order_status),
                    selectableStatuses: getSelectableOrderStatuses(order.order_status),
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
            const selectFinancesPerMonth = "SELECT SUM(order_sum_price) as total, MONTH(closed_order_at) as month FROM orders WHERE order_status = 'done' AND YEAR(closed_order_at) = ? GROUP BY MONTH(closed_order_at) ASC;";

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
                        languageHandler: languageHandler,
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
            const enabledFileTypes = /jpeg|jpg|png/;    // Enable only jpg, jpeg, and png formats
            const extname = enabledFileTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = enabledFileTypes.test(file.mimetype);

            if (mimetype && extname) {
                return callback(null, true);
            }
            else {
                return res.status(200).json({
                    status: 'error',
                    title: languageHandler('errors.wrong_image_format', process.env.ADMIN_LANG),
                    message: languageHandler('errors.enabled_image_format', process.env.ADMIN_LANG, 'jpg, jpeg, png'),
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

            saveImageToDatabase(res, req.file, req.params.folder, req.body.databaseId, true);
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
                    title: languageHandler('errors.wrong_image_format', process.env.ADMIN_LANG),
                    message: languageHandler('errors.enabled_image_format', process.env.ADMIN_LANG, 'jpg, jpeg, png'),
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

            saveImageToDatabase(res, req.files, req.params.folder, req.body.databaseId);
        }
    });
};

const deleteImageFile = (req, res) => {
    const { databaseId, fileSource, fileType } = req.body;
    const { folder } = req.params;

    // TODO: Optimize the path converter
    const pathToFile = path.join('./files' + fileSource.replace(process.env.APP_URL, ''));

    fs.unlink(pathToFile, function (error) {
        if(error && error.code == 'ENOENT') {
            // file doens't exist
            return res.status(200).json({
                status: 'error',
                title: languageHandler('errors.error', process.env.ADMIN_LANG),
                message: languageHandler('errors.file_does_not_exist', process.env.ADMIN_LANG)
            });

        } else if (error) {
            // other errors occur
            return res.status(200).json({ status: 'error' });
        } else {

            // Example: duck.jpg
            var exactSourceFileName = getLast(pathToFile.split('\\'));  // Split by single back slash

            // NOTE: The folder name is the same like the database table name
            deleteImageFromDatabase(res, exactSourceFileName, folder, databaseId, fileType);
        }
    });

};

const getGlobalSettingsPage = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    var metas = {
        title: 'Admin dashboard',
        type: "website",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the admin global settings page",
        // keywords: []
    };

    // function params => Table, database ID, callback
    getValidFormValues('config', null, function (err, DBformData) {
        // If there is ANY error, then the ID does not exist -> show new upload form
        if (err) {
            return showServerErrorPage(req, res);
        }

        // If HAS form values, then show edit page
        else if ( DBformData.length > 0 ) {

            const validLanguages = process.env.VALID_LANGS.split(',');
            let formattedConfigValues = {
                en: {},
                hu: {},
                sr: {}
            };

            // Getting the config values & formatting them into an object
            let configValues = DBformData.reduce((accumulator, row) => {
                accumulator[row.config_key] = row.config_value;
                return accumulator;
            }, {});

            // Convert & format the form values
            // The home page banner texts
            validLanguages.forEach(currentLanguage => {
                formattedConfigValues[currentLanguage].home_page_title = configValues.home_page_title != null ? getValueByLanguage(configValues.home_page_title, currentLanguage) : null;
                formattedConfigValues[currentLanguage].home_page_text = configValues.home_page_text != null ? getValueByLanguage(configValues.home_page_text, currentLanguage) : null;
            });

            // Countup numbers
            formattedConfigValues.posted_products_number = parseInt(configValues.posted_products_number ?? 0);
            formattedConfigValues.animals_in_numbers = parseInt(configValues.animals_in_numbers ?? 0);
            formattedConfigValues.cups_of_coffe_number = parseInt(configValues.cups_of_coffe_number ?? 0);
            formattedConfigValues.satisfied_clients_number = parseInt(configValues.satisfied_clients_number ?? 0);

            // Contact data
            formattedConfigValues.phone_1 = configValues.phone_1 != null ? configValues.phone_1 : null;
            formattedConfigValues.phone_2 = configValues.phone_2 != null ? configValues.phone_2 : null;
            formattedConfigValues.email = configValues.email != null ? configValues.email : null;
            formattedConfigValues.facebook = configValues.facebook != null ? configValues.facebook : null;
            formattedConfigValues.instagram = configValues.instagram != null ? configValues.instagram : null;
            formattedConfigValues.tiktok = configValues.tiktok != null ? configValues.tiktok : null;
            formattedConfigValues.company_street = configValues.company_street != null ? configValues.company_street : null;
            formattedConfigValues.currency = configValues.currency != null ? configValues.currency : null;

            return res.render("admin/settings-form", {
                configValues: formattedConfigValues,
                meta: metas,
                current_locale: lang,
                csrfToken: req.csrfToken()
            });
        }
    });
};

const saveGlobalSettings = (req, res) => {
    const lang = process.env.ADMIN_LANG;
    let settings = req.body;

    // Numbers and Boolean types data check
    settings.satisfied_clients_number = parseInt(settings.satisfied_clients_number || 0);
    settings.cups_of_coffe_number = parseInt(settings.cups_of_coffe_number || 0);
    settings.animals_in_numbers = parseInt(settings.animals_in_numbers || 0);
    settings.posted_products_number = parseInt(settings.posted_products_number || 0);

    if (
        isNaN(settings.satisfied_clients_number)
        || isNaN(settings.cups_of_coffe_number)
        || isNaN(settings.animals_in_numbers)
        || isNaN(settings.posted_products_number)
        || !settings.currency
        || !settings['home_page_title[en]']
        || !settings['home_page_title[sr]']
        || !settings['home_page_title[hu]']
        || !settings['home_page_text[hu]']
        || !settings['home_page_text[hu]']
        || !settings['home_page_text[hu]']
    )
    {
        return res.status(200).json({
            status: 'error',
            title: languageHandler('errors.error', lang),
            text: languageHandler('errors.wrong_data', lang),
            csrfToken: req.csrfToken()
        });
    }

    let homepageBannerTitles = {
        en: escapeHtml(settings['home_page_title[en]']),
        sr: escapeHtml(settings['home_page_title[sr]']),
        hu: escapeHtml(settings['home_page_title[hu]']),
    };
    let homepageBannerText = {
        en: escapeHtml(settings['home_page_text[en]']),
        sr: escapeHtml(settings['home_page_text[sr]']),
        hu: escapeHtml(settings['home_page_text[hu]']),
    };

    settings.home_page_title = JSON.stringify(homepageBannerTitles);
    settings.home_page_text = JSON.stringify(homepageBannerText);

    // Delete the unnecessary key-values from the object, due to make it usable to update the config table
    // These keys are used to make difference between the text values based on languages
    delete settings['home_page_title[en]'];
    delete settings['home_page_title[sr]'];
    delete settings['home_page_title[hu]'];
    delete settings['home_page_text[en]'];
    delete settings['home_page_text[sr]'];
    delete settings['home_page_text[hu]'];

    const SQLUpdateSettings = "UPDATE config SET config_value = ? WHERE config_key = ?";

    for (const [key, value] of Object.entries(settings)) {
        db.query(
            SQLUpdateSettings,
            [
                value,
                key
            ],
            (err, data) => {
                if (err) {
                    console.log(err);
                    return res.status(200).json({ status: "error", csrfToken: req.csrfToken() });
                }
            }
        );
    }

    return res.status(200).json({
        status: "success",
        redirect_url: "/admin/settings",
        csrfToken: req.csrfToken()
    });
};

module.exports = { getLoginPage, getDashboard, uploadImageFiles, uploadMultipleImages, deleteImageFile, getGlobalSettingsPage, saveGlobalSettings };
