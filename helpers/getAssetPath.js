const fs = require('fs');
const path = require('path');
const logEvents = require('../middleware/logEvents');

// Function to read the mix-manifest.json file and return versioned asset paths
function getAssetPath (fileName) {

    // Construct the absolute URL to the mix-manifest.json file
    let manifestPath = path.join(__dirname, "..", "public/mix-manifest.json");

    try {
        // Read mix-manifest.json file
        let mixManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

        // Return the asset path corresponding to the fileName
        return process.env.APP_URL + mixManifest[fileName];

    } catch (error) {
        logEvents(`Error reading asset path from mix-manifest.json: ${ err.message }\nFile: getAssetPath.js Row: 18\n-------------------------`, "errors.log");
        return "";
    }
}

module.exports = getAssetPath;
