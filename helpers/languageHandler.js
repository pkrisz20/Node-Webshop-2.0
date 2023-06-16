const en = require("../locales/en");
const sr = require("../locales/sr");
const hu = require("../locales/hu");

function languageHandler ( key, lang = "en" ) {

    let keys = [];
    let isDeeper = false;

    if (key.includes(".")) {
        isDeeper = true;
        keys = key.split(".");
    }

    if (lang === "en") {
        return isDeeper ? en[keys[0]][keys[1]] : en[key];
    }

    else if (lang === "sr") {
        return isDeeper ? sr[keys[0]][keys[1]] : sr[key];
    }

    else if (lang === "hu") {
        return isDeeper ? hu[keys[0]][keys[1]] : hu[key];
    }
}

module.exports = languageHandler;
