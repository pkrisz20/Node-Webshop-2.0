const moment = require("moment");

function setMomentLocale (lang = "en") {
    if (lang === "en") {
        moment.locale('en-gb');
    }
    else {
        moment.locale(lang);
    }
}

function numberWithCommas (num) {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function capitalizeFirstLetter (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createUniqueID () {
    return (Math.random().toString(36) + Date.now().toString(36)).substring(2);
}

function getFirst (array, unit = 1) {
    if (unit === 1) return array[0];
    return array.filter((_, index) => index < unit);
}

function getLast (array, unit = 1) {
    if (unit === 1) return array[array.length - 1];
    return array.filter((_, index) => array.length - index <= unit);
}

function getOnly (array, key) {
    return array.map(element => element[key]);
}

function groupBy (array, key) {
    return array.reduce((group, element) => {
        const keyValue = element[key];
        return { ...group, [keyValue]: [...(group[keyValue] ?? []), element] }
    }, {});
}

function limitText (text, limitNumber = 90) {
    return text.length > limitNumber ? text.substring(0, limitNumber) + '...' : text;
}

module.exports = { setMomentLocale, numberWithCommas, capitalizeFirstLetter, createUniqueID, getFirst, getLast, getOnly, groupBy, limitText };
