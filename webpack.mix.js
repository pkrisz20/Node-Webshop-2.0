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
    .sass("resources/scss/pages/error.scss", "public/css")
    .sass("resources/scss/pages/gdpr.scss", "public/css")
    .sass("resources/scss/pages/search-list.scss", "public/css")
    .sass("resources/scss/pages/contact.scss", "public/css")
    .sass("resources/scss/pages/order.scss", "public/css")
    .sass("resources/scss/pages/login.scss", "public/css")

    // Admin setup
    .sass("resources/admin/scss/admin-index.scss", "public/admin/css")
    .js("resources/admin/js/admin.js", "public/admin/js")
    .js("resources/admin/js/image-uploader.js", "public/admin/js")

    .version();

mix
    .copyDirectory('resources/js/plugins', 'public/js/plugins')

    .copyDirectory('resources/images', 'public/images')

    .copyDirectory('resources/scss/plugins', 'public/css/plugins')

    // Admin assets
    .copyDirectory('resources/admin/scss/plugins', 'public/admin/css/plugins')
    .copyDirectory('resources/admin/js/plugins', 'public/admin/js/plugins')
