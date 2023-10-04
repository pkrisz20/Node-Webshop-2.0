function formatJSONByLanguage (newData, lang = "en", oldData = null) {

    var availableLanguages = ['en', 'sr', 'hu'];

    // There is already data in the json (WHEN UPDATE)
    if (oldData != null) {
        let dataObject = JSON.parse(oldData);
        dataObject[lang] = newData;
        return JSON.stringify(dataObject);
    }

    // There is nothing in the json yet (WHEN INSERT)
    else if (oldData == null) {
        let newObjectValue = {};
        newObjectValue[lang] = newData;

        let otherLanguages = availableLanguages.filter(item => item !== lang);

        otherLanguages.forEach(item => {
            newObjectValue[item] = null;
        });

        return JSON.stringify(newObjectValue);
    }
}

module.exports = formatJSONByLanguage;
