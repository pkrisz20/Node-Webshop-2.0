const mix = require("laravel-mix");

/**
 * Older browsers support: the JavaScript is compiled to ES5 and the missing features are polyfilled.
 * The supported browsers are listed in the "browserslist" field of package.json (the CSS autoprefixer uses them too).
 */
mix
    .babelConfig({
        // Files without import / export stay classic scripts, so their behaviour does not change (no strict mode)
        sourceType: 'unambiguous',
        presets: [
            ['@babel/preset-env', {
                modules: false,
                forceAllTransforms: true,
                // Only the polyfills of the features used by the code are bundled
                useBuiltIns: 'usage',
                corejs: require('core-js/package.json').version,
            }],
        ],
    })
    // The webpack runtime code (module wrapper) is generated in ES5 as well
    .webpackConfig({ target: ['web', 'es5'] })
    // The shared webpack runtime is saved next to the vendor file: public/js/manifest.js
    .options({ runtimeChunkPath: 'js' });

mix
    .setPublicPath('public')

    .js("resources/js/main.js", "public/js")
    .js("resources/js/pages/product-list.js", "public/js")

    .sass("resources/scss/main.scss", "public/css")
    .sass("resources/scss/pages/home.scss", "public/css")
    .sass("resources/scss/pages/about.scss", "public/css")
    .sass("resources/scss/pages/product-list.scss", "public/css")
    .sass("resources/scss/pages/gallery-list.scss", "public/css")
    .sass("resources/scss/pages/blog-list.scss", "public/css")
    .sass("resources/scss/pages/static-page.scss", "public/css")
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
    .js("resources/admin/js/product-form.js", "public/admin/js")

    // The polyfills are shared by every bundle: public/js/vendor.js + public/js/manifest.js (webpack runtime),
    // every page loads them once, before its own bundles
    .extract('public/js/vendor.js')

    .version();

mix
    .copyDirectory('resources/js/plugins', 'public/js/plugins')

    .copyDirectory('resources/images', 'public/images')

    .copyDirectory('resources/scss/plugins', 'public/css/plugins')

    // Admin assets
    .copyDirectory('resources/admin/scss/plugins', 'public/admin/css/plugins')
    .copyDirectory('resources/admin/js/plugins', 'public/admin/js/plugins')
    .copyDirectory('resources/admin/js/select2', 'public/admin/js/select2')
