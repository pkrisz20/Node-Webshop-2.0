const mix = require("laravel-mix");

mix
    .setPublicPath('public')

    .js("resources/js/main.js", "public/js")

    .sass("resources/scss/main.scss", "public/css")
    .sass("resources/scss/pages/home.scss", "public/css")
    .sass("resources/scss/pages/about.scss", "public/css")
    .sass("resources/scss/pages/product-list.scss", "public/css")
    .sass("resources/scss/pages/gallery-list.scss", "public/css")
    .sass("resources/scss/pages/blog-list.scss", "public/css")
    .sass("resources/scss/pages/faq.scss", "public/css")
    .sass("resources/scss/pages/product-details.scss", "public/css")
    .sass("resources/scss/pages/gallery-details.scss", "public/css")
    .sass("resources/scss/pages/blog-details.scss", "public/css")

    .version();

mix
    .copyDirectory('resources/js/plugins', 'public/js/plugins')

    .copyDirectory('resources/images', 'public/images')

    .copyDirectory('resources/scss/plugins', 'public/css/plugins')
