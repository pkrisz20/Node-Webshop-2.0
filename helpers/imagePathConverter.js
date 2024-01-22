function imagePathConverter ( images, path = "products" ) {

    if (!images) {
        return null;
    }

    if (typeof images === "string") {
        return `${process.env.APP_URL}/${path}/${images}`;
    }

    else if (Array.isArray(images)) {
        images = images.map(image => {
            return `${process.env.APP_URL}/${path}/${image}`;
        });

        return images;
    }
}

module.exports = imagePathConverter;
