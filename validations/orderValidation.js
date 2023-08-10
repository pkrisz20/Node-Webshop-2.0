const yup = require("yup");

const orderSchema = yup.object({
    firstname: yup.string().required().max(100),
    lastname: yup.string().required().max(100),
    phone: yup.string().matches(/^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/).required().max(15),
    email: yup.string().email().required().max(100),
    city: yup.string().required().max(100),
    postcode: yup.string().required().max(6),
    address: yup.string().required().max(100),
    comment: yup.string().max(1000),
    orderedProducts: yup.array().of(
        yup.object().shape({
            productId: yup.number().integer().required().positive(),
            quantity: yup.number().integer().required().min(1).positive()
        })
    ).required()
});

module.exports = orderSchema;
