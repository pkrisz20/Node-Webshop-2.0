const en = require("../locales/en");
const sr = require("../locales/sr");
const hu = require("../locales/hu");
const frontTranslations = require("../locales/front-translations");

function languageHandler ( key, lang = "en", ...params ) {

    let keys = [];
    let isDeeper = false;
    let translatedText = "";

    if (key.includes(".")) {
        isDeeper = true;
        keys = key.split(".");
    }

    if (lang === "en") {
        translatedText = isDeeper ? en[keys[0]][keys[1]] : en[key];
    }

    else if (lang === "sr") {
        translatedText = isDeeper ? sr[keys[0]][keys[1]] : sr[key];
    }

    else if (lang === "hu") {
        translatedText = isDeeper ? hu[keys[0]][keys[1]] : hu[key];
    }

    if ( params.length > 0 ) {
        params.forEach((paramItem, index) => {
            translatedText = translatedText.replace(`{${index}}`, paramItem);
        });
    }

    return translatedText;
}

function getFrontTranslations (currentLang = "en") {

    // TODO: Finish the front translations getter / setter functions
    const translations = frontTranslations.filter(lang => lang == currentLang);
    console.log('translations', translations);

    // return translations;
}

module.exports = languageHandler;
