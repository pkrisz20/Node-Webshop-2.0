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
            xml += `    <xhtml:link rel="alternate" hreflang="en" href="https://example.com/en/page1" />`
            xml += `    <xhtml:link rel="alternate" hreflang="de" href="https://example.com/de/page1" />`
            xml += `    <lastmod>${ url.lastmod }</lastmod>\n`;
            xml += `    <changefreq>${ url.changefreq }</changefreq>\n`;
            xml += `    <priority>${ url.priority }</priority>\n`;
            xml += '  </url>\n';
        });

        xml += '</urlset>';

        // Save the sitemap to a file
        fs.writeFileSync('sitemap.xml', xml);

        logEvents("Sitemap successfully generated", "messages.log");
    }
    catch (error) {
        logEvents(`Sitemap generating failed! Error name: ${ error.name }, Error message: ${ error.message }`, "errors.log");
    }
}

module.exports = generateSitemap;
