const express = require("express");
const galleryRouter = express.Router();
const GalleryController = require("../controllers/GalleryController");

galleryRouter.route("/gallery")
    .post(GalleryController.getAllGallery);

galleryRouter.route("/gallery/:galleryId")
    .post(GalleryController.getGalleryDetails);

module.exports = galleryRouter;
