const { createUniqueID, escapeHtml } = require('../../helpers/globalFunctions');

function generateSlug (titleText) {

    if ( typeof titleText !== 'string' ) return false;

    let slugResult = null;

    titleText = escapeHtml(titleText);
    slugResult = titleText.replaceAll(' ', '-').toLowerCase();
    slugResult.concat(createUniqueID);

    return slugResult;
}

module.exports = { generateSlug };
