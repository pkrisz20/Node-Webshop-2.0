const Axios = require("axios");

async function recaptchaValidation ( req, res, next ) {
    const token = req.headers["recaptchatoken"];

    if (!token) {
        return res.status(500).json({ status: "error" });
    }

    try {
        await Axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`)
        .then(res => {
            if (res.data.success && res.data.score > 0.7) {
                return next();
            }

            else {
                return res.status(500).json({ status: "error" });
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({ status: "error" });
        });
    }
    catch (err) {
        return res.status(500).json({ status: "error" });
    }
}

module.exports = recaptchaValidation;
