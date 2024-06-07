const dateTimeHelper = {

    isValidDate: function (dateString) {
        if (!dateString) {
            return false;
        }

        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }
}

module.exports = dateTimeHelper;
