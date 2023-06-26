const path = require("path");

function imagePathConverter ( images, path = "products" ) {

    if (typeof images === "string") {
        return `/${path}/${images}`;
    }

    else if (Array.isArray(images)) {
        images = images.map(image => {
            return `/${path}/${image}`;
        });

        return images;
    }
}

module.exports = imagePathConverter;
