const yup = require("yup");

const orderSchema = yup.object({
    firstname: yup.string().required().max(100),
    lastname: yup.string().required().max(100),
    phone: yup.string().required().max(15),
    email: yup.string().email().required().max(100),
    city: yup.string().required().max(100),
    postcode: yup.string().required().max(6),
    address: yup.string().required().max(100),
    comment: yup.string().max(1000)
});

module.exports = orderSchema;
