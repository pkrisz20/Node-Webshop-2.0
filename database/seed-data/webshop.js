const { localized, slugOf, emailOf, createRandom, addDays, atTime, toDateOnly, notAfter } = require('./helpers');
const { REVIEWER_NAMES, REVIEW_TEXTS } = require('./people');

const product = (hu, en, sr, price) => ({ name: { hu, en, sr }, price });

const CATEGORIES = [
    {
        name: { hu: 'Tojások', en: 'Eggs', sr: 'Jaja' },
        short: {
            hu: 'Friss tojás a saját baromfiudvarunkból, minden reggel gyűjtve.',
            en: 'Fresh eggs from our own poultry yard, collected every morning.',
            sr: 'Sveža jaja iz našeg dvorišta, sakupljena svakog jutra.',
        },
        bullets: {
            hu: ['Szabad tartású állományból', 'Naponta gyűjtve', 'Kézzel válogatva'],
            en: ['From free range flocks', 'Collected every day', 'Sorted by hand'],
            sr: ['Od živine iz slobodnog uzgoja', 'Sakupljena svakog dana', 'Ručno sortirana'],
        },
        products: [
            product('Libatojás, 6 db', 'Goose eggs, 6 pcs', 'Guščija jaja, 6 kom', 540),
            product('Libatojás, 10 db', 'Goose eggs, 10 pcs', 'Guščija jaja, 10 kom', 880),
            product('Kacsatojás, 10 db', 'Duck eggs, 10 pcs', 'Pačja jaja, 10 kom', 350),
            product('Kacsatojás, 30 db', 'Duck eggs, 30 pcs', 'Pačja jaja, 30 kom', 990),
            product('Tyúktojás, 10 db', 'Hen eggs, 10 pcs', 'Kokošija jaja, 10 kom', 220),
            product('Tyúktojás, 30 db', 'Hen eggs, 30 pcs', 'Kokošija jaja, 30 kom', 620),
            product('Fürjtojás, 20 db', 'Quail eggs, 20 pcs', 'Prepeličja jaja, 20 kom', 300),
            product('Keltetőtojás libából, 6 db', 'Goose hatching eggs, 6 pcs', 'Guščija jaja za nasad, 6 kom', 1500),
        ],
    },
    {
        name: { hu: 'Húskészítmények', en: 'Meat products', sr: 'Mesne prerađevine' },
        short: {
            hu: 'Házi húskészítmények hagyományos receptek alapján.',
            en: 'Homemade meat products based on traditional recipes.',
            sr: 'Domaće mesne prerađevine po tradicionalnim receptima.',
        },
        bullets: {
            hu: ['Saját nevelésű állatokból', 'Bükkfán füstölve', 'Vákuumcsomagolva szállítjuk'],
            en: ['From animals raised by us', 'Smoked over beech wood', 'Delivered vacuum packed'],
            sr: ['Od životinja iz našeg uzgoja', 'Dimljeno na bukovom drvetu', 'Isporučuje se vakuumski pakovano'],
        },
        products: [
            product('Libakolbász, 500 g', 'Goose sausage, 500 g', 'Guščija kobasica, 500 g', 1300),
            product('Füstölt libamell, 500 g', 'Smoked goose breast, 500 g', 'Dimljena guščija prsa, 500 g', 2200),
            product('Libamáj, 500 g', 'Goose liver, 500 g', 'Guščija džigerica, 500 g', 3400),
            product('Kacsamell, 1 kg', 'Duck breast, 1 kg', 'Pačja prsa, 1 kg', 2900),
            product('Libazsír, 1 kg', 'Goose fat, 1 kg', 'Guščija mast, 1 kg', 950),
            product('Libatepertő, 250 g', 'Goose cracklings, 250 g', 'Guščiji čvarci, 250 g', 700),
            product('Házi disznósajt, 1 kg', 'Homemade head cheese, 1 kg', 'Domaća švargla, 1 kg', 1500),
            product('Füstölt sonka, 1 kg', 'Smoked ham, 1 kg', 'Dimljena šunka, 1 kg', 2600),
        ],
    },
    {
        name: { hu: 'Toll és pehely', en: 'Feathers and down', sr: 'Perje i paperje' },
        short: {
            hu: 'Válogatott, mosott liba- és kacsatoll, valamint pehelyből készült termékek.',
            en: 'Selected and washed goose and duck feathers, and products made of down.',
            sr: 'Odabrano i oprano guščije i pačje perje, kao i proizvodi od paperja.',
        },
        bullets: {
            hu: ['Kíméletesen mosva', 'Allergiateszten átesett', 'Hosszú élettartam'],
            en: ['Gently washed', 'Allergy tested', 'Long lifetime'],
            sr: ['Nežno oprano', 'Testirano na alergene', 'Dug vek trajanja'],
        },
        products: [
            product('Libapehely, 500 g', 'Goose down, 500 g', 'Guščije paperje, 500 g', 4900),
            product('Libapehely, 1 kg', 'Goose down, 1 kg', 'Guščije paperje, 1 kg', 9200),
            product('Kacsatoll, 1 kg', 'Duck feathers, 1 kg', 'Pačje perje, 1 kg', 3100),
            product('Pehelypárna, 40x50 cm', 'Down pillow, 40x50 cm', 'Jastuk od paperja, 40x50 cm', 4500),
            product('Pehelypárna, 60x80 cm', 'Down pillow, 60x80 cm', 'Jastuk od paperja, 60x80 cm', 6900),
            product('Pehelypaplan, 140x200 cm', 'Down duvet, 140x200 cm', 'Jorgan od paperja, 140x200 cm', 15900),
            product('Pehelypaplan, 200x220 cm', 'Down duvet, 200x220 cm', 'Jorgan od paperja, 200x220 cm', 21900),
            product('Tollseprű', 'Feather duster', 'Metlica od perja', 650),
        ],
    },
    {
        name: { hu: 'Takarmányok', en: 'Animal feed', sr: 'Stočna hrana' },
        short: {
            hu: 'Ugyanaz a takarmány, amivel a saját állatainkat etetjük.',
            en: 'The same feed we give to our own animals.',
            sr: 'Ista hrana kojom hranimo naše životinje.',
        },
        bullets: {
            hu: ['Saját földről', 'Vegyszermentes tárolás', 'Zsákban szállítjuk'],
            en: ['Grown on our own land', 'Stored without chemicals', 'Delivered in sacks'],
            sr: ['Sa naše zemlje', 'Skladišteno bez hemikalija', 'Isporučuje se u vrećama'],
        },
        products: [
            product('Kukoricadara, 10 kg', 'Ground corn, 10 kg', 'Kukuruzna prekrupa, 10 kg', 600),
            product('Kukoricadara, 25 kg', 'Ground corn, 25 kg', 'Kukuruzna prekrupa, 25 kg', 1400),
            product('Búza, 25 kg', 'Wheat, 25 kg', 'Pšenica, 25 kg', 1250),
            product('Árpa, 25 kg', 'Barley, 25 kg', 'Ječam, 25 kg', 1200),
            product('Libanevelő táp, 10 kg', 'Gosling feed, 10 kg', 'Hrana za guščiće, 10 kg', 1100),
            product('Tojótáp, 25 kg', 'Layer feed, 25 kg', 'Hrana za nosilje, 25 kg', 2300),
            product('Lucernaszéna, bála', 'Alfalfa hay, bale', 'Seno od lucerke, bala', 900),
            product('Szemes zab, 10 kg', 'Whole oats, 10 kg', 'Ovas u zrnu, 10 kg', 700),
        ],
    },
    {
        name: { hu: 'Kézműves termékek', en: 'Handmade products', sr: 'Rukotvorine' },
        short: {
            hu: 'A tanyán készült kézműves termékek és házi finomságok.',
            en: 'Handmade products and homemade treats made on the farm.',
            sr: 'Rukotvorine i domaći specijaliteti napravljeni na farmi.',
        },
        bullets: {
            hu: ['Kézzel készült', 'Természetes alapanyagokból', 'Ajándéknak is ideális'],
            en: ['Made by hand', 'From natural materials', 'Ideal as a gift'],
            sr: ['Ručno izrađeno', 'Od prirodnih materijala', 'Idealno za poklon'],
        },
        products: [
            product('Libazsíros szappan', 'Goose fat soap', 'Sapun od guščije masti', 450),
            product('Tollas kulcstartó', 'Feather keychain', 'Privezak od perja', 350),
            product('Festett libatojás', 'Painted goose egg', 'Oslikano guščije jaje', 900),
            product('Fonott kosár, közepes', 'Woven basket, medium', 'Pletena korpa, srednja', 1800),
            product('Méhviasz gyertya', 'Beeswax candle', 'Sveća od pčelinjeg voska', 600),
            product('Házi szilvalekvár, 700 g', 'Homemade plum jam, 700 g', 'Domaći pekmez od šljiva, 700 g', 750),
            product('Csipkebogyó szörp, 0,5 l', 'Rosehip syrup, 0.5 l', 'Sirup od šipka, 0,5 l', 650),
            product('Hímzett konyharuha', 'Embroidered tea towel', 'Vezena kuhinjska krpa', 1100),
        ],
    },
];

const SHORT_SUFFIXES = [
    { hu: 'Saját termelésből, közvetlenül a tanyáról.', en: 'Our own production, straight from the farm.', sr: 'Iz sopstvene proizvodnje, direktno sa farme.' },
    { hu: 'Kis tételben, gondos kézi munkával készül.', en: 'Made in small batches with careful handwork.', sr: 'Pravi se u malim serijama, pažljivim ručnim radom.' },
    { hu: 'Hagyományos módszerrel, adalékanyagok nélkül.', en: 'Traditional method, no additives.', sr: 'Tradicionalnim postupkom, bez aditiva.' },
];

/** The parameter names and the possible values of each, every product gets a few of them */
const PARAMETERS = [
    {
        name: { hu: 'Termelő régió', en: 'Region of production', sr: 'Region proizvodnje' },
        values: [
            { hu: 'Bácska', en: 'Bačka', sr: 'Bačka' },
            { hu: 'Bánát', en: 'Banat', sr: 'Banat' },
            { hu: 'Szerémség', en: 'Syrmia', sr: 'Srem' },
        ],
    },
    {
        name: { hu: 'Eltarthatóság', en: 'Shelf life', sr: 'Rok trajanja' },
        values: [
            { hu: '7 nap', en: '7 days', sr: '7 dana' },
            { hu: '14 nap', en: '14 days', sr: '14 dana' },
            { hu: '3 hónap', en: '3 months', sr: '3 meseca' },
            { hu: '12 hónap', en: '12 months', sr: '12 meseci' },
        ],
    },
    {
        name: { hu: 'Csomagolás', en: 'Packaging', sr: 'Pakovanje' },
        values: [
            { hu: 'Papírdoboz', en: 'Cardboard box', sr: 'Kartonska kutija' },
            { hu: 'Vákuumcsomagolás', en: 'Vacuum packed', sr: 'Vakuum pakovanje' },
            { hu: 'Üvegtégely', en: 'Glass jar', sr: 'Staklena tegla' },
            { hu: 'Vászonzsák', en: 'Linen bag', sr: 'Platnena vreća' },
        ],
    },
    {
        name: { hu: 'Tanúsítvány', en: 'Certificate', sr: 'Sertifikat' },
        values: [
            { hu: 'Bio', en: 'Organic', sr: 'Organski' },
            { hu: 'HACCP', en: 'HACCP', sr: 'HACCP' },
            { hu: 'Hazai termék', en: 'Local product', sr: 'Domaći proizvod' },
        ],
    },
    {
        name: { hu: 'Tartásmód', en: 'Husbandry', sr: 'Način uzgoja' },
        values: [
            { hu: 'Szabad tartás', en: 'Free range', sr: 'Slobodan uzgoj' },
            { hu: 'Legeltetéses tartás', en: 'Pasture raised', sr: 'Pašnjački uzgoj' },
            { hu: 'Félintenzív tartás', en: 'Semi-intensive', sr: 'Poluintenzivni uzgoj' },
        ],
    },
];

const INTRO = {
    hu: name => `<p><strong>${name}</strong> – a tanyánkon, természetes körülmények között, kis tételben készül.</p>`,
    en: name => `<p><strong>${name}</strong> – made in small batches on our farm, under natural conditions.</p>`,
    sr: name => `<p><strong>${name}</strong> – proizvodi se u malim serijama na našoj farmi, u prirodnim uslovima.</p>`,
};

const OUTRO = {
    hu: '<p>Rendelés előtt érdeklődjön a szállítási lehetőségekről.</p>',
    en: '<p>Ask about the delivery options before ordering.</p>',
    sr: '<p>Pre porudžbine se raspitajte o mogućnostima dostave.</p>',
};

function productDescription(name, bullets) {
    const html = language => `${INTRO[language](name[language])}<ul>${bullets[language].map(bullet => `<li>${bullet}</li>`).join('')}</ul>${OUTRO[language]}`;
    return localized({ hu: html('hu'), en: html('en'), sr: html('sr') });
}

/** A discount without an end date, with a future end date or an expired one, so every case of the shop can be tested */
function discountOf(random, price, now) {
    if (!random.chance(0.3)) {
        return { discount_value: null, discount_end_date: null };
    }

    const discountValue = Math.round((price * random.pick([0.7, 0.8, 0.9])) / 10) * 10;
    const endDate = random.pick([null, addDays(now, random.int(3, 30)), addDays(now, -random.int(3, 30))]);

    return { discount_value: discountValue, discount_end_date: endDate ? toDateOnly(endDate) : null };
}

function reviewsOf(random, productCreatedAt, now) {
    const count = random.int(0, 4);

    return Array.from({ length: count }, () => {
        const name = random.pick(REVIEWER_NAMES);
        const date = notAfter(atTime(addDays(productCreatedAt, random.int(5, 300)), random.int(7, 22), random.int(0, 59)), now);

        return {
            name,
            email: emailOf(name, random.int(1, 99)),
            comment: random.pick(REVIEW_TEXTS),
            is_verified_purchase: random.chance(0.4) ? 1 : 0,
            is_active: random.chance(0.85) ? 1 : 0,
            date,
            rating: random.pick([5, 5, 5, 4, 4, 4, 3, 2, null]),
        };
    });
}

/**
 * Categories, parameters and products with their parameter values and reviews.
 * The ids are not known yet: the products refer to their category by slug, the values to their parameter by name.
 */
function buildWebshop(now) {
    const random = createRandom(20261125);

    const categories = CATEGORIES.map(category => {
        const createdAt = atTime(addDays(now, -random.int(300, 400)), 9, 0);

        return {
            slug: slugOf(category.name),
            row: {
                name: localized(category.name),
                slug: slugOf(category.name),
                short_description: localized(category.short),
                image: null,
                created_at: createdAt,
                updated_at: createdAt,
            },
        };
    });

    const parameters = PARAMETERS.map(parameter => {
        const createdAt = atTime(addDays(now, -random.int(250, 300)), 10, 0);
        return { name: localized(parameter.name), row: { parameter_name: localized(parameter.name), created_at: createdAt, updated_at: createdAt } };
    });

    const products = CATEGORIES.flatMap(category => category.products.map(({ name, price }) => {
        const suffix = random.pick(SHORT_SUFFIXES);
        const createdAt = atTime(addDays(now, -random.int(10, 280)), random.int(8, 18), random.int(0, 59));
        const updatedAt = notAfter(addDays(createdAt, random.int(0, 20)), now);
        const commentsAllowed = random.chance(0.8);

        return {
            slug: slugOf(name),
            categorySlug: slugOf(category.name),
            row: {
                name: localized(name),
                slug: slugOf(name),
                short_description: localized({
                    hu: `${category.short.hu} ${suffix.hu}`,
                    en: `${category.short.en} ${suffix.en}`,
                    sr: `${category.short.sr} ${suffix.sr}`,
                }),
                description: productDescription(name, category.bullets),
                images: null,
                image_thumbnail: null,
                price,
                ...discountOf(random, price, now),
                is_active: random.chance(0.9) ? 1 : 0,
                is_featured: random.chance(0.25) ? 1 : 0,
                is_available: random.chance(0.85) ? 1 : 0,
                is_delivered: random.chance(0.6) ? 1 : 0,
                is_new: random.chance(0.2) ? 1 : 0,
                max_order_count: random.int(3, 20),
                comments_allowed: commentsAllowed ? 1 : 0,
                created_at: createdAt,
                updated_at: updatedAt,
            },
            parameterValues: random.sample(PARAMETERS, random.int(2, 4)).map(parameter => ({
                parameterName: localized(parameter.name),
                value: localized(random.pick(parameter.values)),
            })),
            reviews: commentsAllowed ? reviewsOf(random, createdAt, now) : [],
        };
    }));

    return { categories, parameters, products };
}

module.exports = { buildWebshop };
