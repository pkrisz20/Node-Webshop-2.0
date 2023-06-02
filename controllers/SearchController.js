const { db } = require("../config/db-config");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");

const handleSearch = async (req, res) => {
    let { lang, query } = req.body;

    if ( !lang || typeof query !== "string" ) {
        return res.status(400).json({ status: "error" });
    }

    if ( query === "" ) return;

    let categoriesFound = [];
    let productsFound = [];
    let resultsCount = 0;

    query = `%${query}%`;
    let paramLanguage = `$.${ lang }`;

    const searchProductsQuery = "SELECT products.id, products.name, products.image_thumbnail, categories.name AS 'category_name' FROM products INNER JOIN categories ON products.category_id = categories.id WHERE products.is_active = ? AND json_extract(products.name, ?) LIKE ?";

    const searchCategoriesQuery = "SELECT categories.id, categories.name, categories.icon FROM categories WHERE json_extract(categories.name, ?) LIKE ?";

    db.query(searchProductsQuery, [1, paramLanguage, query], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ status: "error" });
        }

        else if (result) {

            result.forEach(element => {
                let tempObject = {
                    id: parseInt(element.id),
                    name: getValueByLanguage(element.name, lang),
                    image: imagePathConverter(element.image_thumbnail, "products"),
                    category: getValueByLanguage(element.category_name, lang)
                }

                productsFound.push(tempObject);
            });

            resultsCount = productsFound.length;

            db.query(searchCategoriesQuery, [paramLanguage, query], (err, categoryResult) => {

                if (err) {
                    console.log(err);
                    return res.status(500).json({ status: "error" });
                }

                else if (categoryResult) {

                    categoryResult.forEach(element => {
                        let tempObject = {
                            id: parseInt(element.id),
                            name: getValueByLanguage(element.name, lang),
                            icon: imagePathConverter(element.icon, "categories")
                        }

                        categoriesFound.push(tempObject);
                    });

                    resultsCount += categoriesFound.length;
                }

                if (categoriesFound.length == 0) categoriesFound = null;
                if (productsFound.length == 0) productsFound = null;

                return res.status(200).json({ status: "success", categories: categoriesFound, products: productsFound, resultsCount: resultsCount });
            });
        }
    });
}

module.exports = { handleSearch };
