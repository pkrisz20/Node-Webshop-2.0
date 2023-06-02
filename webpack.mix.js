const mix = require("laravel-mix");

mix
    .setPublicPath('public')

    .js("resources/js/main.js", "public/js")

    .sass("resources/scss/main.scss", "public/css")

    .version();
