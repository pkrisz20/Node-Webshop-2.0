const jwt = require('jsonwebtoken');
const { db } = require("../../config/db-connection");

const handleRefreshToken = (req, res) => {
    const cookies = req.cookies;

    if ( !cookies?.jwt ) return res.status(401).json({ status: "error" });

    const refreshToken = cookies.jwt;

    db.query("SELECT login_token FROM logins WHERE login_token IS NOT NULL AND login_token = ?", refreshToken, (err, result) => {
        if ( err ) return res.status(500).json({ status: "error" });

        else if ( result ) {

            jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, decoded) => {
                if ( err ) return res.status(403);

                const newAccessToken = jwt.sign(
                    { 'username': decoded.username },
                    process.env.ACCESS_TOKEN,
                    { expiresIn: '30s' }
                );

                req.newAccessToken = newAccessToken;
            });
        }

        // Forbidden
        else if ( !result ) {
            return res.status(403).json({ status: "error" });
        }
    });
}

module.exports = handleRefreshToken;
