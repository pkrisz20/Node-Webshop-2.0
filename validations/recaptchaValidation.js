const languageHandler = require("../helpers/languageHandler");
const Axios = require("axios");

async function recaptchaValidation ( req, res, next ) {
    const lang = req.session.lang;
    const token = req.body.recaptcha;

    if (!token) {
        return res.status(200).json({ status: "error", title: languageHandler('errors.wrong_data', lang ?? process.env.FALLBACK_LANG) });
    }

    try {
        await Axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${ process.env.RECAPTCHA_SECRET_KEY }&response=${ token }`)
        .then(res => {
            if (res.data.success && res.data.score > 0.7) {
                return next();
            }

            else {
                return res.status(200).json({ status: "error", title: languageHandler('errors.no_permission', lang ?? process.env.FALLBACK_LANG) });
            }
        })
        .catch(err => {
            console.log(err);
            return res.status(200).json({ status: "error", title: languageHandler('errors.server_error', lang ?? process.env.FALLBACK_LANG), content: languageHandler('errors.common_error', lang ?? process.env.FALLBACK_LANG) });
        });
    }
    catch (err) {
        return res.status(200).json({ status: "error", title: languageHandler('errors.server_error', lang ?? process.env.FALLBACK_LANG), content: languageHandler('errors.common_error', lang ?? process.env.FALLBACK_LANG) });
    }
}

module.exports = recaptchaValidation;
