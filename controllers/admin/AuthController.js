
const { db } = require("../../config/db-config");
const moment = require("moment");
const requestIp = require('request-ip');
const languageHandler = require('../../helpers/languageHandler');

const handleAdminLogin = (req, res) => {
    let { admin_username: adminUsername, admin_password: adminPassword } = req.body;

    // Check the payload
    if ( typeof adminUsername !== "string" || typeof adminPassword !== "string" || adminUsername.length == 0 || adminPassword.length == 0) {
        return res.status(200).json({ status: "error", title: languageHandler("errors.unprocessable_data", process.env.ADMIN_LANG) });
    }

    // Authenticate
    if ( adminUsername !== process.env.ADMIN_USERNAME || adminPassword !== process.env.ADMIN_PWD ) {
        return res.status(200).json({ status: "error", title: languageHandler("errors.wrong_data", process.env.ADMIN_LANG) });
    }

    else if ( adminUsername === process.env.ADMIN_USERNAME && adminPassword === process.env.ADMIN_PWD ) {
        var clientIp = requestIp.getClientIp(req);

        db.query("INSERT INTO logins (login_ip_address, login_datetime) VALUES(?, ?)", [clientIp, moment(new Date()).format("YYYY-MM-DD HH:mm:ss")], (err, loginRegistered) => {
            if ( err ) {
                console.log(err);
                return res.status(200).json({ status: "error", title: languageHandler("errors.server_error", process.env.ADMIN_LANG) });
            }

            else if ( loginRegistered ) {
                req.session.authenticated = true;
                req.session.lang = "hu";

                return res.status(200).json({
                    status: "success",
                    title: "Sikeres bejelentkezés",
                    content: "Csak egy pillanat és átirányítjuk!",
                    redirect_url: `${ process.env.APP_URL }/admin/dashboard`
                });
            }
        });
    }
}

const handleAdminLogout = (req, res) => {
    req.session.authenticated = false;

    return res.status(200).json({
        status: "success",
        text: "Hamarosan átirányítjuk!",
        redirect_url: `${ process.env.APP_URL }/admin`
    });
}

module.exports = { handleAdminLogin, handleAdminLogout };
