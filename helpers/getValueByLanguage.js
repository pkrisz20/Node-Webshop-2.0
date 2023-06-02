function getValueByLanguage ( data, selectedLang = "en" ) {

    if ( !data ) {
        return null;
    }

    let dataObject = JSON.parse(data);
    let value = dataObject[selectedLang];

    return value;
}

module.exports = getValueByLanguage;
