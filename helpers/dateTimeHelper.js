const moment = require("moment");

const dateTimeHelper = {

    isValidDate: function (dateString) {
        if (!dateString) {
            return false;
        }

        const date = new Date(dateString);
        return !isNaN(date.getTime());
    },

    formatDateByLang: function (dateTime, lang = "en") {
        var formattedDate = null;

        if (lang == "en" || lang == "hu") {
            formattedDate = moment(dateTime).format("YYYY MMMM DD.");
        }
        else if (lang == "sr") {
            formattedDate = moment(dateTime).format("DD. MMMM YYYY");
        }

        return formattedDate;
    }
}

module.exports = dateTimeHelper;
