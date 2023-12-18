const { escapeHtml } = require('../../helpers/globalFunctions');

function generateUniqueSlug (titleText, identificationNumber) {

    if ( typeof titleText !== 'string' || !identificationNumber ) return false;

    titleText = escapeHtml(titleText);
    let slugResult = titleText.replaceAll(' ', '-').toLowerCase();
    slugResult = slugResult + "-" + identificationNumber;

    return slugResult ?? false;
}

module.exports = { generateUniqueSlug };
