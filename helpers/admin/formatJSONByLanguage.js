const { groupBy } = require('../../helpers/globalFunctions');

function formatJSONByLanguage (formValues, inputFieldName) {

    let languageValues = {
        en: "",
        hu: "",
        sr: ""
    };

    // Filter to get the keys, which are kinda object type keys, example: name[hu]
    const keysWithLanguageCode = Object.keys(formValues).filter(key => {
        return /\[\w+\]$/.test(key) && key.substring(0, key.indexOf('[')) === inputFieldName
    });

    // NOTE: This prints out: [ 'name[hu]', 'name[sr]', 'name[en]' ]
    console.log('keysWithLanguageCode', keysWithLanguageCode);

    // TODO: Finish the json formatter separated by languages inside an attribute

    // keysWithLanguageCode.forEach(languageCode => {

    //     languageValues[languageCode] = formValues[languageCode];
    // });

    // languageValues[languageKey] = formValue;
    // return JSON.stringify(newObjectValue);
}

module.exports = formatJSONByLanguage;
