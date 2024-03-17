const { format } = require("date-fns");
const defaultLang = process.env.FALLBACK_LANG ?? "en";
const validLangs = process.env.VALID_LANGS.split(',');
const staticPathnames = ['/', '/contact', '/faq', '/about', '/gallery', '/blogs', '/products', '/wishlist'];
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

// Add alternate URLs of the other languages
staticUrls.forEach(item => {
    alternateLangs.forEach(lang => {
        var currentAlternate = [];
        var regexPattern = new RegExp(`\/${ lang.langPath }(?=\/|$)`, 'i');

        currentAlternate.push({
            hreflang: lang.langCode,
            langUrl: item.loc.replace(regexPattern, '/' + lang.langPath)
        });
    });
});

// console.log(staticUrls[2]);

module.exports = staticUrls;
