// Include env variables, cause it's a seperate file
const dotenv = require('dotenv');
const path = require('path');
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Include required packages
const fs = require('fs');
const { format } = require("date-fns");
const { db } = require('../config/db-connection');
const { logEvents } = require("../middleware/logEvents");
const staticUrls = require('../config/sitemapStaticUrls');
var validLanguages = [
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

const DbTablesWithSlugs = [
    {
        table: "products",
        startSlug: "/products/",
    },
    {
        table: "blogs",
        startSlug: "/blog/",
    },
    {
        table: "categories",
        startSlug: "/products/category/",
    },
    {
        table: "galleries",
        startSlug: "/gallery/",
    }
];

function DoDatabaseQuery (sql) {
    return new Promise((resolve, reject) => {
        db.query(sql, (err, rows) => {
            if (err) return reject(err);
            return resolve(rows);
        });
    });
}

async function selectSlugsFromTables () {
    try {
        let slugResults = [];
        let dbArray = [];

        for (const tableName of DbTablesWithSlugs) {
            const rows = await DoDatabaseQuery(`SELECT slug FROM ${ tableName.table }`);

            dbArray.push(rows.map(({ slug }) => tableName.startSlug + slug));
            slugResults = [].concat(...dbArray);
        }

        return slugResults;
    }
    catch (error) {
        logEvents(`Sitemap generating failed! Error name: ${ error.name }, Error message: ${ error.message }`, "errors.log");
    }
}

const generateSitemap = async () => {
    try {
        const dateTime = format(new Date(), "yyyy-MM-dd");
        let dbSlugs = await selectSlugsFromTables();
        let dinamicUrls = [];

        validLanguages.forEach(validLang => {
            dbSlugs.forEach(slug => {
                dinamicUrls.push({
                    loc: process.env.APP_URL + '/' + validLang.langPath + slug,
                    alternate: [],
                    lastmod: dateTime,
                    changefreq: 'daily',
                    priority: 0.9
                });
            });
        });

        dinamicUrls.forEach(sitemapItem => {
            validLanguages.forEach(({ langCode, langPath }) => {

                // Generate hreflang alternate link for the language
                let alternateUrl = sitemapItem.loc.replace(/\/[a-z]{2}\//i, `/${ langPath }/`);
                sitemapItem.alternate.push({ hreflang: langCode, href: alternateUrl });
            });
        });

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

        dinamicUrls.forEach(url => {
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
