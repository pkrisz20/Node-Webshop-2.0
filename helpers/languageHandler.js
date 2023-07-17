const en = require("../locales/en");
const sr = require("../locales/sr");
const hu = require("../locales/hu");

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

module.exports = languageHandler;
