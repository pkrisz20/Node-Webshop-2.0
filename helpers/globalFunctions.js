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

function escapeHtml (unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function validateUrl (url) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
}

module.exports = {
    setMomentLocale,
    numberWithCommas,
    capitalizeFirstLetter,
    createUniqueID,
    getFirst,
    getLast,
    getOnly,
    groupBy,
    limitText,
    escapeHtml,
    validateUrl
};
