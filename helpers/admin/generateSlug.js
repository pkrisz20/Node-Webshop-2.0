const { createUniqueID, escapeHtml } = require('../../helpers/globalFunctions');

function generateUniqueSlug (titleText) {

    if ( typeof titleText !== 'string' ) return false;

    titleText = escapeHtml(titleText);
    let slugResult = titleText.replaceAll(' ', '-').toLowerCase();
    slugResult = slugResult + "-" + createUniqueID();

    return slugResult ?? false;
}

module.exports = { generateUniqueSlug };
