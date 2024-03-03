const formatDateByLang = require('../helpers/formatDateByLocale');

const gdprCookies = {
    domain: process.env.APP_DOMAIN,
    types: [
        { type: 'necessary', checked: true, disabled: true },
        { type: 'preferences', checked: false, disabled: false },
        { type: 'performance', checked: false, disabled: false },
    ],
};

module.exports = gdprCookies;
