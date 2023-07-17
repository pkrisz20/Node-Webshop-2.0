const frontTranslations = require("../locales/front-translations");

function getFrontTranslations (currentLang = "en") {

    var translationsList = frontTranslations[currentLang];
    return translationsList;
}

module.exports = getFrontTranslations;
