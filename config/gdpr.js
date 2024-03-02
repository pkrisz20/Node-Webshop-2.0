const gdprCookies = {
    domain: process.env.APP_DOMAIN,
    'last_update': '2024-03-02',
    types: [
        { type: 'necessary', checked: true, disabled: true },
        { type: 'preferences', checked: false, disabled: false },
        { type: 'performance', checked: false, disabled: false },
    ],
    'date_format': {
        hu: 'YYYY MMMM DD.',
        sr: 'DD. MMMM YYYY',
        en: 'YYYY MMMM DD.',
    },
};

module.exports = gdprCookies;
