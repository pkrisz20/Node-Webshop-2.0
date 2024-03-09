const fs = require('fs');
const path = require('path');

// Function to read the mix-manifest.json file and return versioned asset paths
function getAssetPath (fileName) {

    // Construct the absolute URL to the mix-manifest.json file
    let manifestPath = process.env.APP_URL + '/mix-manifest.json';

    try {
        // Read mix-manifest.json file
        let mixManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

        // Return the asset path corresponding to the fileName
        return mixManifest[fileName];

    } catch (error) {
        console.error('Error reading mix-manifest.json:', error);
        return null; // Handle the error appropriately
    }
}

module.exports = getAssetPath;
