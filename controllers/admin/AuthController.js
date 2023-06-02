
const { db } = require("../../config/db-config");
const moment = require("moment");
const requestIp = require('request-ip');
const jwt = require('jsonwebtoken');

const handleAdminLogin = (req, res) => {
    let { username, password } = req.body;

    // TODO: Fix it to authenticate, not just check for cookie
    // Quick return for admin pages loading if there is a cookie
    if ( req.cookies?.jwt ) return res.status(200).json({ status: "success", isAuthenticated: true });

    // Check the payload
    if ( typeof username !== "string" || typeof password !== "string" || username.length == 0 || password.length == 0) {
        return res.status(422).json({ status: "error" });
    }

    // Authenticate
    if ( username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PWD ) {
        return res.status(420).json({ status: "error" });
    }

    else if ( username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PWD ) {
        var clientIp = requestIp.getClientIp(req);

        // If the last IP address is not equals to this, then call the Google Authenticator for key
        db.query("SELECT login_ip_address from logins WHERE login_id = (SELECT max(login_id) FROM logins)", (err, result) => {
            if ( err ) {
                console.log(err);
                return res.status(500).json({ status: "error" });
            }

            else if ( result ) {

                // if ( clientIp !== result[0].login_ip_address ) {
                    // Send to Google Authenticator for a new key
                // }

                const accessToken = jwt.sign(
                    { "username": process.env.ADMIN_USERNAME },
                    process.env.ACCESS_TOKEN,
                    { expiresIn: '30s' }
                );

                const refreshToken = jwt.sign(
                    { "username": process.env.ADMIN_USERNAME },
                    process.env.REFRESH_TOKEN,
                    { expiresIn: '1d' }
                );

                db.query("INSERT INTO logins (login_ip_address, login_token, login_datetime) VALUES(?, ?, ?)", [clientIp, refreshToken, moment(new Date()).format("YYYY-MM-DD HH:mm:ss")], (err, loginRegistered) => {
                    if ( err ) {
                        console.log(err);
                        return res.status(500).json({ status: "error" });
                    }

                    else if ( loginRegistered ) {

                        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: "None" });
                        return res.status(200).json({ status: "success", accessToken: accessToken });
                    }
                });
            }
        });
    }
}

const handleAdminLogout = (req, res) => {
    const cookies = req.cookies;

    if ( !cookies?.jwt ) return res.status(204).json({ status: "success" });

    res.clearCookie('jwt');
    return res.status(403).json({ status: "success" });
}

module.exports = { handleAdminLogin, handleAdminLogout };
