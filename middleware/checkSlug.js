const languageHandler = require('../helpers/languageHandler');

function checkSlug (slugPropertyName) {
  return (req, res, next) => {
    const { slug, lang } = req.params;

    console.log('slug', slug);
    console.log('lang', lang);

    const translatedSlug = languageHandler(slugPropertyName, lang);

    console.log('translatedSlug', translatedSlug);

    if (slug === translatedSlug) {
      console.log('next to controller');
      return next();
    }

    console.log('next route');

    next('route');
  };
}

module.exports = checkSlug;
