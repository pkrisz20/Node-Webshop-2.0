const path = require("path");
const fs = require("fs");

const deleteLogs = async () => {
    try {
        if (fs.existsSync(path.join(__dirname, "..", "logs/requests.log"))) {
            await fs.unlink(path.resolve(__dirname, "..", "logs/requests.log"), (err) => {
                if (err) throw err.message;
            });
        }

        if (fs.existsSync(path.join(__dirname, "..", "logs/errors.log"))) {
            await fs.unlink(path.resolve(__dirname, "..", "logs/errors.log"), (err) => {
                if (err) throw err.message;
            });
        }
    }
    catch (err) {
        console.log(err.message);
    }
}

module.exports = deleteLogs;
