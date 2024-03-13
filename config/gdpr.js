const gdprCookies = {
    domain: process.env.APP_DOMAIN,
    types: [
        { type: 'necessary', checked: true, disabled: true },
        { type: 'preferences', checked: true, disabled: false },
        { type: 'statistics', checked: true, disabled: false },
        { type: 'marketing', checked: false, disabled: false },
    ],
};

module.exports = gdprCookies;
