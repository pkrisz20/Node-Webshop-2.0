const slugify = require('slugify');

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/** Same JSON as `LocalizedField.stringify()` of the app: one value per language */
function localized({ hu, en, sr }) {
    return JSON.stringify({ hu, en, sr });
}

/** Same as `Slug.fromTitles()` of the app */
function slugOf(titles) {
    const toSlug = title => (title ? slugify(title, { replacement: '-', lower: true, trim: true }) : null);
    return localized({ hu: toSlug(titles.hu), en: toSlug(titles.en), sr: toSlug(titles.sr) });
}

/** ASCII e-mail address from a name, e.g. "Tóth Eszter" -> "toth.eszter.3@example.com" */
function emailOf(name, index) {
    return `${slugify(name, { replacement: '.', lower: true, strict: true })}.${index}@example.com`;
}

/**
 * Deterministic pseudo random generator (mulberry32): the same seed always gives the same test data,
 * so the undo of a seeder can rebuild the identifying values (slugs, e-mails) and delete exactly those rows.
 */
function createRandom(seed) {
    let state = seed >>> 0;

    const next = () => {
        state = (state + 0x6D2B79F5) >>> 0;
        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };

    const int = (min, max) => min + Math.floor(next() * (max - min + 1));
    const pick = items => items[Math.floor(next() * items.length)];
    const chance = probability => next() < probability;

    /** `count` different items in random order */
    const sample = (items, count) => {
        const copy = [...items];

        for (let index = copy.length - 1; index > 0; index--) {
            const swapIndex = Math.floor(next() * (index + 1));
            [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
        }

        return copy.slice(0, count);
    };

    return { next, int, pick, chance, sample };
}

function addDays(date, days) {
    return new Date(date.getTime() + days * DAY_IN_MS);
}

/** The given day at the given local time */
function atTime(date, hours, minutes) {
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
}

/** "YYYY-MM-DD" in local time, the format of the DATE columns and the admin date inputs */
function toDateOnly(date) {
    const pad = value => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The earlier of the two dates, the test data never gets a date in the future by accident */
function notAfter(date, limit) {
    return date.getTime() > limit.getTime() ? new Date(limit) : date;
}

module.exports = { localized, slugOf, emailOf, createRandom, addDays, atTime, toDateOnly, notAfter };
