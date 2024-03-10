const getAssetPath = require('../helpers/getAssetPath');

const metaDefault = {
    title: process.env.SITE_NAME,
    "default_og_images": getAssetPath('/images/cover_default.png'),
    separator: ' | ',
    limits: {
        title: 60,
        description: 150
    },
    langs: {
        sr: 'sr-Latn',
        en: 'en',
        hu: 'hu',
    },
    'og:image:width': 1200,
    'og:image:height': 630,
    robots: 'index, follow',
    // 'google-site-verification' : 'g7ppJE9S4-8rTQBHnsQ73yl1P0D3ZG8JmWPdTmIkfSU',
    googlebot: "noodp",
    slurp: "noydir",
    msnbot: "noodp",
    'og:type': 'website',
};

module.exports = metaDefault;
