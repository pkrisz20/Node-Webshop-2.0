const { db } = require("../config/db-config");
const getValueByLanguage = require("../helpers/getValueByLanguage");

const getFAQ = (req, res) => {
    const { lang } = req.body;
    let result = [];
    const sqlQuery = "SELECT question, answer FROM faq WHERE is_active = ?";

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
                    question: getValueByLanguage(element.question, lang),
                    answer: getValueByLanguage(element.answer, lang)
                }

                result.push(tempObject);
            });
        }

        return res.status(200).json({ status: 'success', result: result ?? [] });
    });
}

module.exports = { getFAQ };
