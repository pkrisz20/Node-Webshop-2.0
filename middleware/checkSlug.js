const languageHandler = require('../helpers/languageHandler');

function checkSlug (slugPropertyName) {
  return (req, res, next) => {

    console.log(slugPropertyName);

    const { slug, lang } = req.params;
    const translatedSlug = languageHandler(slugPropertyName, lang);

    if (slug === translatedSlug) {
      return next();
    }

    next('route');
  };
}

module.exports = checkSlug;
