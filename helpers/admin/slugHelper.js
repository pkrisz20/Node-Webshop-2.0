const { escapeHtml } = require('../globalFunctions');
const slugify = require('slugify');

function generateUniqueSlug (titlesObject) {

    if (typeof titlesObject !== 'object') return false;

    for (const item in titlesObject) {
        titlesObject[item] = escapeHtml(titlesObject[item]);

        titlesObject[item] = slugify(titlesObject[item], {
            replacement: '-',
            lower: true,
            trim: true
        });
    }

    return JSON.stringify(titlesObject) ?? false;
}

function getSlug (jsonDataWithSlugs, lang = 'en') {
    let formattedJson = JSON.parse(jsonDataWithSlugs);
    return formattedJson[lang];
}

module.exports = { generateUniqueSlug, getSlug };
