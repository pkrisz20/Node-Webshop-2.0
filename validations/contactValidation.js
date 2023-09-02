const yup = require("yup");

const contactSchema = yup.object({
    firstName: yup.string().required().max(100),
    lastName: yup.string().required().max(100),
    phone: yup.string().required().max(15),
    email: yup.string().email().required().max(100),
    comment: yup.string().max(500).required(),
    recaptcha: yup.string().required()
});

module.exports = contactSchema;
