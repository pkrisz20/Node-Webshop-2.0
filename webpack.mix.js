const mix = require("laravel-mix");

mix
    .setPublicPath('public')

    .copyDirectory('resources/js/plugins', 'public/js/plugins')

    .copyDirectory('resources/images', 'public/images')

    .js("resources/js/main.js", "public/js")

    .sass("resources/scss/main.scss", "public/css")
    .sass("resources/scss/pages/home.scss", "public/css")

    .vue()

    .version();
