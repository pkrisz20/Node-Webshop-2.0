const yup = require("yup");

const commentsSchema = yup.object({
    fullName: yup.string().required().max(100),
    email: yup.string().email().required().max(100),
    comment: yup.string().max(1000).required(),
    recaptcha: yup.string().required()
});

module.exports = commentsSchema;
