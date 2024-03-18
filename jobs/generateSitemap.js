// Include env variables, cause it's a seperate file
const dotenv = require('dotenv');
const path = require('path');
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Include required packages
const fs = require('fs');
const { format } = require("date-fns");
const { logEvents } = require("../middleware/logEvents");
const staticUrls = require('../config/sitemapStaticUrls');
const defaultLang = process.env.FALLBACK_LANG ?? "en";
const otherLangs = [
    {
        langCode: 'sr-Latn',
        langPath: 'sr'
    },
    {
        langCode: 'hu',
        langPath: 'hu'
    },
    {
        langCode: 'en',
        langPath: 'en'
    }
];

const generateSitemap = () => {
    try {
        const DbTablesWithUrls = ["products", "blogs", "categories", "galleries"];

        // Data structure
        let dinamicUrls = [
            {
                loc: 'https://example.com/en/page1',
                alternate: [
                    {
                        hrefLang: 'sr-Latn',
                        langUrl: 'https://example.com/sr/page1'
                    }
                ],
                lastmod: format(new Date(), "yyyy-MM-dd"),
                changefreq: 'daily',
                priority: 0.7
            },
        ];

        // Generate the sitemap XML content
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        staticUrls.forEach(url => {
            xml += '  <url>\n';
            xml += `    <loc>${ url.loc }</loc>\n`;
            if (url.alternate.length > 0) {
                url.alternate.forEach(alternateLink => {
                    xml += `    <xhtml:link rel="alternate" hreflang="${ alternateLink.hreflang }" href="${ alternateLink.href }"/>\n`
                });
            }
            xml += `    <lastmod>${ url.lastmod }</lastmod>\n`;
            xml += `    <changefreq>${ url.changefreq }</changefreq>\n`;
            xml += `    <priority>${ url.priority }</priority>\n`;
            xml += '  </url>\n';
        });

        xml += '</urlset>';

        // Save the sitemap to a file
        fs.writeFileSync('../public/sitemap.xml', xml);
        // Update the robots.txt file
        fs.writeFileSync('../public/robots.txt', `User-agent: *\nDisallow: /admin/\nSitemap: ${ process.env.APP_URL }/sitemap.xml`);

        logEvents("Sitemap successfully generated", "messages.log");
    }
    catch (error) {
        logEvents(`Sitemap generating failed! Error name: ${ error.name }, Error message: ${ error.message }`, "errors.log");
    }
}

module.exports = generateSitemap;
