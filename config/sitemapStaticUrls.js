const { format } = require("date-fns");
const validLangs = process.env.VALID_LANGS.split(',');
const staticPathnames = ['/', '/contact', '/faq', '/about', '/gallery', '/blogs', '/products', '/wishlist', '/terms-of-use', '/privacy-policy'];
const currentDate = format(new Date(), "yyyy-MM-dd");
let staticUrls = [];
const alternateLangs = [
    {
        langCode: 'en',
        langPath: 'en'
    },
    {
        langCode: 'sr-Latn',
        langPath: 'sr'
    },
    {
        langCode: 'hu',
        langPath: 'hu'
    },
];

// Generate the base structure
validLangs.forEach(lang => {
    staticPathnames.forEach(pathname => {
        staticUrls.push({
            loc: `${ process.env.APP_URL }/${ lang }${ pathname }`,
            alternate: [], // This is for other language URLs
            lastmod: currentDate,
            changefreq: 'never',
            priority: 0.7
        });
    });
});

// Generate alternate links for each available language
staticUrls.forEach(sitemapItem => {
    alternateLangs.forEach(({ langCode, langPath }) => {

        // Generate hreflang alternate link for the language
        let alternateUrl = sitemapItem.loc.replace(/\/[a-z]{2}\//i, `/${ langPath }/`);
        sitemapItem.alternate.push({ hreflang: langCode, href: alternateUrl });
    });
});

module.exports = staticUrls;
