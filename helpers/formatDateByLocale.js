const moment = require("moment");

function formatDateByLang (dateTime, lang = "en") {
    var formattedDate = null;

    if (lang == "en" || lang == "hu") {
        formattedDate = moment(dateTime).format("YYYY MMMM DD.")
    }
    else if (lang == "sr") {
        formattedDate = moment(dateTime).format("DD. MMMM YYYY")
    }

    return formattedDate;
}

module.exports = formatDateByLang;
