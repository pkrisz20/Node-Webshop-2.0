// Include env variables, cause it's a seperate file
const dotenv = require('dotenv');
const path = require('path');
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const { format } = require("date-fns");
const validLangs = process.env.VALID_LANGS.split(',');
const currentDate = format(new Date(), "yyyy-MM-dd");
const languageHandler = require('../helpers/languageHandler');
const staticPathnames = [
    'slugs.products',
    'slugs.blogs',
    'slugs.galleries',
    'slugs.faq',
    'slugs.cart',
    'slugs.wishlist',
    'slugs.contact',
    'slugs.about_us',
];

let staticUrls = [];

// Generate the base structure
staticPathnames.forEach(pathname => {
    validLangs.forEach(lang => {
        staticUrls.push({
            loc: `${ process.env.APP_URL }/${ lang }/${ languageHandler(pathname, lang) }`,
            lastmod: currentDate,
            changefreq: 'never',
            priority: 0.8
        });
    });
});

module.exports = staticUrls;
