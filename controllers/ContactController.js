const { db } = require("../config/db-connection");
// const nodemailer = require("nodemailer");
// const xoauth2 = require('xoauth2');
const languageHandler = require("../helpers/languageHandler");
const { numberWithCommas } = require("../helpers/globalFunctions");
const getFrontTranslations = require("../helpers/frontTranslations");
const moment = require("moment");

const getContactPage = (req, res) => {
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

    var { DB_CONFIG } = req;
    var metas = {
        title: languageHandler("nav.contact", req.session.lang ?? process.env.FALLBACK_LANG),
        type: "website",
        url: `${ process.env.APP_URL }/${ req.session.lang ?? process.env.FALLBACK_LANG }/contact`,
        image: `${ process.env.APP_URL }/images/logo.png`,
        description: "This is the contact page",
        // keywords: []
    };

    return res.render("pages/contact", {
        meta: metas,
        current_locale: req.session.lang ?? process.env.FALLBACK_LANG,
        cart: cart,
        locales: ['hu', 'sr', 'en'],
        frontTranslations: getFrontTranslations(req.session.lang ?? process.env.FALLBACK_LANG),
        languageHandler: languageHandler,
        DB_CONFIG: DB_CONFIG,
        csrfToken: req.csrfToken()
    });
};

const handleContactMessage = (req, res) => {
    const { firstName, lastName, email, phone, city, comment } = req.body;
    moment.locale("hu");

    db.query("INSERT INTO contact_messages (first_name, last_name, email, phone, city, client_message, date) VALUES (?,?,?,?,?,?,?)", [firstName, lastName, email, phone, city, comment, moment(new Date()).format("YYYY-MM-DD HH:mm:ss")], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).render("500", {
                title: languageHandler("errors.server_error", req.session.lang ?? process.env.FALLBACK_LANG),
                current_locale: req.session.lang,
                back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
                learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
                csrfToken: req.csrfToken()
            });
        }

        else if (result) {

            // var smtpTransport = nodemailer.createTransport({
            //     service: "gmail",
            //     auth: {
            //         xoauth2: xoauth2.createXOAuth2Generator({
            //             user: process.env.INFO_EMAIL_ADDRESS,
            //             pass: process.env.MAIL_PASSWORD,
            //             clientId: process.env.EMAIL_CLIENT_ID,
            //             clientSecret: process.env.EMAIL_CLIENT_SECRET,
            //             refreshToken: process.env.EMAIL_REFRESH_TOKEN
            //         })
            //     }
            // });

            // var mailOptions = {
            //     from: email,
            //     to: process.env.ADMIN_EMAIL_ADDRESS,
            //     subject: `Üzenet egy klienstől (${ firstName })`,
            //     html: `
            //     <html>
            //         <head></head>
            //         <body style="position: relative; margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif">
            //             <div style="background-color: #082a2e; padding: 40px; text-align: center; color: #fff">
            //                 <h1>${ firstName } ${ lastName } üzenete</h1>
            //                 <div style="height: 5px; background-color: #fff"></div>
            //             </div>
            //             <div style="padding: 50px 0; text-align: left;">
            //                 <p style="font-size: 16px; margin-bottom: 10px;"><u>Üzenet:</u> ${ comment }</p><br>
            //                 <p style="font-size: 16px; margin-bottom: 10px;"><u>Elérhetőség:</u> <b>${ phone }</b> vagy <b>${ email }</b></p><br>
            //                 <p style="font-size: 16px;"><u>A küldés időpontja:</u> <b>${ moment(new Date()).format("YYYY. MMMM DD. HH:mm") }</b></p>
            //             </div>
            //         </body>
            //     </html>`,
            // };

            // smtpTransport.sendMail(mailOptions, function(error, response) {
            //     if (error) {
            //         console.log(error);
            //         return res.status(500).render("500", {
            //             title: languageHandler("errors.server_error", req.session.lang ?? process.env.FALLBACK_LANG),
            //             current_locale: req.session.lang,
            //             back_to_home: languageHandler("general.back_to_home", req.session.lang ?? process.env.FALLBACK_LANG),
            //             learn_more: languageHandler("general.information", req.session.lang ?? process.env.FALLBACK_LANG),
            //             csrfToken: req.csrfToken()
            //         });
            //     }
            //     else {
            //         console.log(response);
            //         console.log("Email sent");

            //         smtpTransport.close();
            //     }
            // });

            return res.status(200).json({
                status: "success",
                title: languageHandler("general.process_success", req.session.lang ?? process.env.FALLBACK_LANG),
                content: languageHandler("general.contact_email_success_message", req.session.lang ?? process.env.FALLBACK_LANG),
                redirect_url: `${ process.env.APP_URL }/${ req.session.lang ?? process.env.FALLBACK_LANG }/contact`
            });
        }
    });
}

module.exports = { handleContactMessage, getContactPage };
