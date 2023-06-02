const validationMiddleware = (schema) => async (req, res, next) => {
    const body = req.body;

    try {
        await schema.validate(body);
        return next();
    }
    catch (err) {
        return res.status(422).json({ status: "error" });
    }
}

module.exports = validationMiddleware;
