const languageHandler = require("../helpers/languageHandler");

const validationMiddleware = (schema) => async (req, res, next) => {
    const body = req.body;

    try {
        await schema.validate(body);
        return next();
    }
    catch (err) {
        return res.status(200).json({
            status: "error",
            title: languageHandler('errors.wrong_data', req.session.lang ?? process.env.FALLBACK_LANG)
        });
    }
}

module.exports = validationMiddleware;
