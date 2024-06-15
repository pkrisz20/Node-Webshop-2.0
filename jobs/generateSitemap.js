// Include env variables, cause it's a seperate file
const dotenv = require('dotenv');
const path = require('path');
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Include required packages
const fs = require('fs');
const { format } = require("date-fns");
const DoDatabaseQuery = require('../helpers/databaseQueryHelper');
const { logEvents } = require("../middleware/logEvents");
const validLangs = process.env.VALID_LANGS.split(',');
const languageHandler = require('../helpers/languageHandler');
const staticUrls = require('./sitemapStaticUrls');

const DbTablesWithSlugs = [
    {
        table: "products",
        translationSlugKey: "slugs.product",
    },
    {
        table: "blogs",
        translationSlugKey: "slugs.article",
    },
    {
        table: "categories",
        translationSlugKey: "slugs.products",
    },
    {
        table: "galleries",
        translationSlugKey: "slugs.gallery",
    }
];

async function selectSlugsFromTables () {
    try {
        let slugResults = [];
        let dbArray = [];

        for (const currentLang of validLangs) {
            for (const tableName of DbTablesWithSlugs) {

                let query = tableName.table !== "categories" ? `SELECT id, json_extract(slug, '$.${ currentLang }') as 'slug' FROM ${ tableName.table } WHERE is_active = ?` : `SELECT id, json_extract(slug, '$.${ currentLang }') as 'slug' FROM ${ tableName.table }`;
                let queryParam = tableName.table !== "categories" ? [1] : [];

                const rows = await DoDatabaseQuery(query, queryParam);

                if (tableName.table !== "categories") {
                    dbArray.push(rows.map(({ slug, id }) => currentLang + '/' + languageHandler(tableName.translationSlugKey, currentLang) + '/' + slug.substr(1).slice(0, -1) + '/' + id));
                }
                else if (tableName.table === "categories") {
                    dbArray.push(rows.map(({ slug, id }) => currentLang + '/' + slug.substr(1).slice(0, -1) + '/' + languageHandler(tableName.translationSlugKey, currentLang) + '/' + id));
                }

                slugResults = [].concat(...dbArray);
            }
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
        let generatedDinamicSlugs = await selectSlugsFromTables();
        let dinamicUrls = [];

        generatedDinamicSlugs.forEach(slug => {
            dinamicUrls.push({
                loc: process.env.APP_URL + '/' + slug,
                lastmod: dateTime,
                changefreq: 'daily',
                priority: 0.9
            });
        });

        // Generate the sitemap XML content
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        staticUrls.forEach(url => {
            xml += '  <url>\n';
            xml += `    <loc>${ url.loc }</loc>\n`;
            xml += `    <lastmod>${ url.lastmod }</lastmod>\n`;
            xml += `    <changefreq>${ url.changefreq }</changefreq>\n`;
            xml += `    <priority>${ url.priority }</priority>\n`;
            xml += '  </url>\n';
        });

        dinamicUrls.forEach(url => {
            xml += '  <url>\n';
            xml += `    <loc>${ url.loc }</loc>\n`;
            xml += `    <lastmod>${ url.lastmod }</lastmod>\n`;
            xml += `    <changefreq>${ url.changefreq }</changefreq>\n`;
            xml += `    <priority>${ url.priority }</priority>\n`;
            xml += '  </url>\n';
        });

        xml += '</urlset>';

        // Save the sitemap to a file
        fs.writeFileSync('../public/sitemap.xml', xml);
        // Update the robots.txt file
        fs.writeFileSync(
            '../public/robots.txt',
            `User-agent: JoobleBot\nDisallow: /\nUser-agent: *\nDisallow: /admin\nSitemap: ${ process.env.APP_URL }/sitemap.xml`
        );

        logEvents("Sitemap successfully generated", "messages.log");
    }
    catch (error) {
        logEvents(`Sitemap generating failed! Error name: ${ error.name }, Error message: ${ error.message }`, "errors.log");
    }
}

module.exports = generateSitemap;
