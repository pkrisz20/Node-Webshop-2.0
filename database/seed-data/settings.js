const { localized, slugOf } = require('./helpers');

/**
 * Defaults of every setting of the admin settings page (see `SiteConfigService`).
 * Only the missing keys are inserted, an existing setting is never overwritten.
 */
const DEFAULT_CONFIG = {
    home_page_title: localized({ hu: 'Szeretjük az állatokat', en: 'We love the animals', sr: 'Mi volimo životinje' }),
    home_page_text: localized({
        hu: 'Boldog libák, egészséges termékek: állatainkat a legnagyobb gondossággal, tágas, természetes környezetben neveljük.',
        en: 'Happy geese, healthy products: we raise our animals with the utmost care, in a spacious, natural environment.',
        sr: 'Srećne guske, zdravi proizvodi: naše životinje uzgajamo s najvećom pažnjom, u prostranom, prirodnom okruženju.',
    }),
    about_us_short: localized({
        hu: 'Itt olvashat rólunk: kik vagyunk és mivel foglalkozunk.',
        en: 'Here you can read about us: who we are and what we do.',
        sr: 'Ovde možete pročitati o nama: ko smo i čime se bavimo.',
    }),
    about_us_long: localized({
        hu: '<p>Családi gazdaságunk több mint húsz éve foglalkozik baromfitartással.</p><p>Termékeinket saját állományból, hagyományos módszerekkel készítjük.</p>',
        en: '<p>Our family farm has been keeping poultry for more than twenty years.</p><p>We make our products from our own flock, with traditional methods.</p>',
        sr: '<p>Naše porodično gazdinstvo se više od dvadeset godina bavi uzgojem živine.</p><p>Proizvode pravimo od sopstvenog jata, tradicionalnim metodama.</p>',
    }),
    posted_products_number: '120',
    animals_in_numbers: '850',
    cups_of_coffe_number: '1500',
    satisfied_clients_number: '640',
    phone_1: '0641234567',
    phone_2: null,
    email: 'info@example.com',
    facebook: 'https://www.facebook.com/',
    instagram: 'https://www.instagram.com/',
    tiktok: null,
    company_street: 'Tornyos',
    currency: 'RSD',
    // Key of appConfig.priceFormat.thousandsSeparators: dot, comma or space
    thousands_separator: 'dot',
    map_lat: '45.922090581383735',
    map_long: '19.769180935709972',
};

const TERMS_TITLE = { hu: 'Általános szerződési feltételek', en: 'Terms of use', sr: 'Opšti uslovi korišćenja' };
const PRIVACY_TITLE = { hu: 'Adatvédelmi nyilatkozat', en: 'Privacy policy', sr: 'Zaštita privatnosti' };

/** The locked static pages, the site links them by `content_name` (footer, order and comment forms) */
const STATIC_CONTENTS = [
    {
        content_name: 'terms_of_use',
        title: localized(TERMS_TITLE),
        slug: slugOf(TERMS_TITLE),
        short_description: localized({
            hu: 'A webshop használatának feltételei.',
            en: 'The terms of using the webshop.',
            sr: 'Uslovi korišćenja internet prodavnice.',
        }),
        description: localized({
            hu: '<p>A webshopban leadott rendelések a visszaigazolással válnak érvényessé.</p><p>A termékek árai dinárban értendők.</p>',
            en: '<p>An order placed in the webshop becomes valid with its confirmation.</p><p>All prices are in dinars.</p>',
            sr: '<p>Porudžbina u internet prodavnici postaje važeća potvrdom.</p><p>Sve cene su izražene u dinarima.</p>',
        }),
    },
    {
        content_name: 'privacy_policy',
        title: localized(PRIVACY_TITLE),
        slug: slugOf(PRIVACY_TITLE),
        short_description: localized({
            hu: 'Hogyan kezeljük a személyes adatait.',
            en: 'How we handle your personal data.',
            sr: 'Kako postupamo sa vašim ličnim podacima.',
        }),
        description: localized({
            hu: '<p>A megadott adatokat kizárólag a rendelések teljesítéséhez használjuk.</p><p>Adatait harmadik félnek nem adjuk át.</p>',
            en: '<p>We use the data you provide only to fulfil your orders.</p><p>We never pass your data to third parties.</p>',
            sr: '<p>Podatke koje unesete koristimo isključivo za izvršenje porudžbina.</p><p>Vaše podatke ne prosleđujemo trećim licima.</p>',
        }),
    },
];

module.exports = { DEFAULT_CONFIG, STATIC_CONTENTS };
