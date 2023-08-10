const { db } = require("../config/db-config");
const { setMomentLocale, createUniqueID, numberWithCommas } = require("../helpers/globalFunctions");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");
// const nodemailer = require("nodemailer");
const moment = require("moment");
const languageHandler = require("../helpers/languageHandler");
const getFrontTranslations = require("../helpers/frontTranslations");

const getOrderPage = (req, res) => {
    // Cart converting stuffs
    var cart = {
        items: req.session.cart ?? [],
        totalCount: req.session.totalCount,
        totalPrice: numberWithCommas(req.session.totalPrice)
    };
    cart.items = cart.items.map(item => {
        return {
            ...item,
            price: numberWithCommas(item.price)
        }
    });

    const lang = req.session.lang ?? process.env.FALLBACK_LANG;
    var metas = {
        title: languageHandler('orders.order', lang),
        type: "page",
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: `This is the order page`,
        // keywords: []
    };

    return res.render("pages/order", {
        frontTranslations: getFrontTranslations(lang),
        meta: metas,
        current_locale: lang,
        cart: cart,
        locales: ['hu', 'sr', 'en'],
        languageHandler: languageHandler,
        csrfToken: req.csrfToken()
    });
}

const createOrder = (req, res) => {
    let { lang, firstName, lastName, email, phone, city, postcode, address, orderMessage, orderedProducts } = req.body;
    let isAnyBiggerThanMaximum = true;
    let isAvailableEachProduct = false;
    let orderDetails = [];
    let totalPrice = 0;

    let productIds = orderedProducts.map(item => item.productId);

    let countParams = Array(productIds.length).fill("?").join(",");

    db.query(`SELECT id, name, price, discount_value, is_active, is_available, max_order_count FROM products WHERE id IN (${ countParams })`, productIds, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ status: "error" });
        }

        else if (result) {

            // Check if any product is not orderable
            isAvailableEachProduct = result.every(product => product.is_active !== 0 && product.is_available !== 0);

            if ( !isAvailableEachProduct ) {
                return res.status(400).json({ status: "error" });
            }

            // Check if any quantity is bigger than the max orderable quantity
            orderedProducts.forEach(element => {

                result.forEach(item => {
                    if ( element.productId === item.id ) {
                        isAnyBiggerThanMaximum = element.quantity > item.max_order_count;
                    }
                });
            });

            if ( isAnyBiggerThanMaximum ) {
                return res.status(400).json({ status: "error" });
            }

            // Calculate total price for order
            orderedProducts.forEach(element => {

                result.forEach(item => {
                    if ( element.productId === item.id ) {
                        orderDetails.push({ productId: item.id, productName: item.name, quantity: element.quantity, price: item.discount_value != null ? item.discount_value : item.price });
                    }
                });
            });

            totalPrice = orderDetails.reduce((total, product) => product.quantity * product.price + total, 0);
        }
    });

    // Insert the order itself
    const randomOrderId = createUniqueID();
    let SQLInsertOrder = "INSERT INTO orders (order_id, customer_firstname, customer_lastname, customer_email, customer_address, customer_postal_code, customer_city, customer_phone, order_date) VALUES (?,?,?,?,?,?,?,?,?)";
    let bindingParams = [randomOrderId, firstName, lastName, email, address, postcode, city, phone, moment(new Date()).format("YYYY-MM-DD HH:mm:ss")];

    if ( orderMessage ) {
        SQLInsertOrder = "INSERT INTO orders (order_id, customer_firstname, customer_lastname, customer_email, customer_address, customer_postal_code, customer_city, customer_phone, order_date, customer_note) VALUES (?,?,?,?,?,?,?,?,?,?)";
        bindingParams.push(orderMessage);
    }

    // Register the order in db
    db.query(SQLInsertOrder, bindingParams, (err, order_result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ status: "error" });
        }

        else if (order_result) {
            // Register the order details in db
            orderDetails.forEach(orderedItem => {
                db.query("INSERT INTO order_details (order_id, product_id, quantity) VALUES (?, ?, ?)", [randomOrderId, orderedItem.productId, orderedItem.quantity], (err, order_details_result) => {

                    if (err) {
                        console.log(err);
                        return res.status(500).json({ status: "error" });
                    }
                });
            });

            // Destroy the session and delete cookie
            req.session.destroy();
            res.clearCookie("cart_uuid");

            var HTMLproductListToClient = "";
            var HTMLproductListToAdmin = "";

            orderDetails.forEach(product => {
                HTMLproductListToClient += `<li style="font-size: 16px; margin: 5px;">${ product.quantity} x ${ getValueByLanguage(product.productName, lang) }</li>`;
                HTMLproductListToAdmin += `<li style="font-size: 16px; margin: 5px;">${ product.quantity} x ${ getValueByLanguage(product.productName, "hu") }</li>`;
            });

            setMomentLocale(lang);
            var emailToClient = {
                en: {
                    from: process.env.INFO_EMAIL_ADDRESS,
                    to: email,
                    subject: "We have registered your order successfully",
                    html: `
                    <html>
                        <head></head>
                        <body style="position: relative; margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; color: #212121;">
                            <div style="background-color: #082a2e; padding: 40px; text-align: center; color: #fff">
                                <h1>Your order has been registered successfully!</h1>
                                <div style="height: 5px; background-color: #fff"></div>
                            </div>
                            <div style="padding: 50px 0; text-align: left;">
                                <p style="font-size: 16px; margin-bottom: 5px;"><b>Full name:</b> ${ firstName } ${ lastName }</p><br>
                                <p style="font-size: 16px; margin-bottom: 5px;"><b>Contacts:</b> ${ phone } or ${ email }</p><br>
                                <p style="font-size: 16px; margin-bottom: 5px;"><b>Registered address:</b> ${ address }, ${ city }, ${ postcode }</p><br>
                                <p style="font-size: 16px; margin-bottom: 5px;"><b>Ordered products:</b></p><br>
                                <ul style="list-style-type: square;">${ HTMLproductListToClient }</ul>
                                <div style="font-size: 16px;margin-bottom: 5px;background-color:#0b8b51;color:#fff;padding: 5px;display:inline-block;"><b>Total price:</b> ${ numberWithCommas(totalPrice) } RSD</div>
                                <div style="font-size: 16px;"><b>Date and time of the order:</b> ${ moment(new Date()).format("YYYY. MMMM DD. HH:mm") }</div>
                            </div>
                        </body>
                    </html>`,
                },
                sr: {
                    from: process.env.INFO_EMAIL_ADDRESS,
                    to: email,
                    subject: "Uspešno smo registrovali Vašu narudžbinu",
                    html: `
                    <html>
                        <head></head>
                        <body style="position: relative; margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif">
                            <div style="background-color: #082a2e; padding: 40px; text-align: center; color: #fff">
                                <h1>Uspešno smo registrovali Vašu narudžbinu!</h1>
                                <div style="height: 5px; background-color: #fff"></div>
                            </div>
                            <div style="padding: 50px 0; text-align: left;">
                                <p style="font-size: 16px; margin-bottom: 5px;"><b>Ime i prezime:</b> ${ firstName } ${ lastName }</p><br>
                                <p style="font-size: 16px; margin-bottom: 5px;"><b>Kontakti:</b> ${ phone } i ${ email }</p><br>
                                <p style="font-size: 16px; margin-bottom: 5px;"><b>Adresa:</b> ${ address }, ${ city }, ${ postcode }</p><br>
                                <p style="font-size: 16px; margin-bottom: 5px;"><b>Proizvodi:</b></p><br>
                                <ul style="list-style-type: square;">${ HTMLproductListToClient }</ul>
                                <div style="font-size: 16px;margin-bottom: 5px;background-color:#0b8b51;color:#fff;padding: 5px;display:inline-block;"><b>Ukupno:</b> ${ numberWithCommas(totalPrice) } RSD</div>
                                <div style="font-size: 16px;"><b>Datum i vreme narudžbine:</b> ${ moment(new Date()).format("YYYY. MMMM DD. HH:mm") }</div>
                            </div>
                        </body>
                    </html>`,
                },
                hu: {
                    from: process.env.INFO_EMAIL_ADDRESS,
                    to: email,
                    subject: "Rendelését sikeresen regisztráltuk",
                    html: `
                    <html>
                        <head></head>
                        <body style="position: relative; margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif">
                            <div style="background-color: #082a2e; padding: 40px; text-align: center; color: #fff">
                                <h1>A rendelését sikeresen regisztráltuk!</h1>
                                <div style="height: 5px; background-color: #fff"></div>
                            </div>
                            <div style="padding: 50px 0; text-align: left;">
                                <p style="font-size: 16px; margin-bottom: 5px;"><b>Teljes név:</b> ${ firstName } ${ lastName }</p><br>
                                <p style="font-size: 16px; margin-bottom: 5px;"><b>Elérhetőségek:</b> ${ phone } vagy ${ email }</p><br>
                                <p style="font-size: 16px; margin-bottom: 5px;"><b>Megadott cím:</b> ${ address }, ${ city }, ${ postcode }</p><br>
                                <p style="font-size: 16px; margin-bottom: 5px;"><b>Megrendelt termékek:</b></p><br>
                                <ul style="list-style-type: square;">${ HTMLproductListToClient }</ul>
                                <div style="font-size: 16px;margin-bottom: 5px;background-color:#0b8b51;color:#fff;padding: 5px;display:inline-block;"><b>Összeg:</b> ${ numberWithCommas(totalPrice) } RSD</div>
                                <div style="font-size: 16px;"><b>Rendelés időpontja:</b> ${ moment(new Date()).format("YYYY. MMMM DD. HH:mm") }</div>
                            </div>
                        </body>
                    </html>`,
                }
            };

            setMomentLocale("hu");
            var mailToAdmin = {
                from: email,
                to: process.env.ADMIN_EMAIL_ADDRESS,
                subject: "Rendelés érkezett egy klienstől!",
                html: `
                <html>
                    <head></head>
                    <body style="position: relative; margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif">
                        <div style="background-color: #082a2e; padding: 40px; text-align: center; color: #fff">
                            <h1>Rendelés egy klienstől</h1>
                            <div style="height: 5px; background-color: #fff"></div>
                        </div>
                        <div style="padding: 50px 0; text-align: left;">
                            <p style="font-size: 16px; margin-bottom: 5px;"><b>Kliens:</b> ${ firstName } ${ lastName }</p><br>
                            <p style="font-size: 16px; margin-bottom: 5px;"><b>Üzenet:</b> ${ orderMessage ? orderMessage : 'Nincs a rendeléshez hozzáfűzött megjegyzés!'}</p><br>
                            <p style="font-size: 16px; margin-bottom: 5px;"><b>Elérhetőség:</b> ${ phone } vagy ${ email }</p><br>
                            <p style="font-size: 16px; margin-bottom: 5px;"><b>A leadott cím:</b> ${ address }, ${ city }, ${ postcode }</p><br>
                            <p style="font-size: 16px; margin-bottom: 5px;"><b>Rendelt termékek:</b></p><br>
                            <ul style="list-style-type: square;">${ HTMLproductListToAdmin }</ul>
                            <div style="font-size: 16px;margin-bottom: 5px;background-color:#0b8b51;color:#fff;padding: 5px;display:inline-block;"><b>Összeg:</b> ${ numberWithCommas(totalPrice) } RSD</div>
                            <div style="font-size: 16px;"><b>A rendelés időpontja:</b> ${ moment(new Date()).format("YYYY. MMMM DD. HH:mm") }</div>
                        </div>
                    </body>
                </html>`,
            };

            // Sending the emails
            // var smtpTransport = nodemailer.createTransport("SMTP", {
            //     service: "Gmail",
            //     auth: {
            //         XOAuth2: {
            //             user: process.env.INFO_EMAIL_ADDRESS,
            //             clientId: process.env.EMAIL_CLIENT_ID,
            //             clientSecret: process.env.EMAIL_CLIENT_SECRET,
            //             refreshToken: process.env.EMAIL_REFRESH_TOKEN
            //         }
            //     }
            // });

            // smtpTransport.sendMail(mailToAdmin, function(error, response) {
            //     if (error) {
            //         console.log(error);
            //         return res.status(500).json({ status: "error" });
            //     }
            //     else {
            //         console.log("Email sent successfully to the admin");
            //     }
            // });

            // smtpTransport.sendMail(emailToClient[lang], function(error, response) {
            //     if (error) {
            //         console.log(error);
            //         return res.status(500).json({ status: "error" });
            //     }
            //     else {
            //         console.log(response);
            //         console.log("Email have been sent successfully to the client");
            //     }
            //     smtpTransport.close();
            // });

            return res.status(200).json({ status: "success" }).end();
        }
    });
}

module.exports = { createOrder, getOrderPage };
