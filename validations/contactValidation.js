const yup = require("yup");

const contactSchema = yup.object({
    firstName: yup.string().required().max(100),
    lastName: yup.string().required().max(100),
    phone: yup.string().matches(/^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/).required().max(15),
    email: yup.string().email().required().max(100),
    clientMessage: yup.string().max(500).required(),
    lang: yup.string().required(),
});

module.exports = contactSchema;
