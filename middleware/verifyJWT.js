const jwt = require("jsonwebtoken");
const handleRefreshToken = require("../middleware/handleRefreshToken");
require("dotenv").config();

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['Authorization'];
    if (!authHeader) return res.status(401).json({ status: "error" });    // Unauthorized
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            handleRefreshToken(req, res);
        }

        return next();
    });
}

module.exports = verifyJWT;
