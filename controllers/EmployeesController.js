const { db } = require("../config/db-config");
const getValueByLanguage = require("../helpers/getValueByLanguage");
const imagePathConverter = require("../helpers/imagePathConverter");

const getEmployees = (req, res) => {
    const { lang } = req.body;
    let result = [];
    const sqlQuery = "SELECT name, position, image, facebook, twitter, instagram, email, phone FROM employees WHERE is_active = ?";

    if (!lang) {
        return res.status(400).json({ status: "error" });
    }

    db.query(sqlQuery, 1, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ status: "error" });
        }

        else if (data.length > 0) {

            data.forEach(element => {
                let tempObject = {
                    name: element.name,
                    image: imagePathConverter(element.image, "employees"),
                    position: getValueByLanguage(element.position, lang),
                    contact: {
                        facebook: element.facebook,
                        twitter: element.twitter,
                        instagram: element.instagram,
                        email: element.email,
                        phone: element.phone
                    }
                }

                result.push(tempObject);
            });
        }

        return res.status(200).json({ status: 'success', result: result ?? [] });
    });
}

module.exports= { getEmployees };
