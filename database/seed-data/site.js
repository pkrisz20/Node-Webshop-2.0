const { localized, slugOf, emailOf, createRandom, addDays, atTime, toDateOnly } = require('./helpers');
const { CITIES, CONTACT_MESSAGES, phoneOf } = require('./people');

const text = (hu, en, sr) => ({ hu, en, sr });

const GALLERY_NAMES = [
    text('Tavaszi kikelés', 'Spring hatching', 'Prolećno izleganje'),
    text('Libák a legelőn', 'Geese on the pasture', 'Guske na pašnjaku'),
    text('Nyílt nap képekben', 'Open day in pictures', 'Dan otvorenih vrata u slikama'),
    text('Az új istálló építése', 'Building the new barn', 'Izgradnja nove štale'),
    text('Téli hangulat a tanyán', 'Winter on the farm', 'Zima na farmi'),
    text('Piaci napok', 'Market days', 'Pijačni dani'),
    text('A kézműves műhely', 'The craft workshop', 'Zanatska radionica'),
    text('Aratás', 'Harvest', 'Žetva'),
    text('Kacsák a tavon', 'Ducks on the pond', 'Patke na jezeru'),
    text('Karácsonyi vásár', 'Christmas fair', 'Božićni vašar'),
];

const GALLERY_DESCRIPTIONS = [
    text('Képek a tanya mindennapjaiból.', 'Pictures from the everyday life of the farm.', 'Slike iz svakodnevnog života farme.'),
    text('Egy emlékezetes nap pillanatai.', 'Moments of a memorable day.', 'Trenuci jednog nezaboravnog dana.'),
    text('Nézze meg, hogyan dolgozunk.', 'See how we work.', 'Pogledajte kako radimo.'),
];

const EMPLOYEES = [
    {
        name: 'Kovács Péter',
        position: text('Tanyavezető', 'Farm manager', 'Upravnik farme'),
        description: text('Húsz éve foglalkozik állattartással, ő felel a farm mindennapi működéséért.', 'He has been working with animals for twenty years and runs the farm every day.', 'Dvadeset godina se bavi stočarstvom i vodi svakodnevni rad farme.'),
    },
    {
        name: 'Szabó Eszter',
        position: text('Állatgondozó', 'Animal keeper', 'Negovateljica životinja'),
        description: text('Ő gondoskodik a libákról és a kacsákról, a kikeléstől a felnevelésig.', 'She takes care of the geese and the ducks, from hatching to rearing.', 'Ona brine o guskama i patkama, od izleganja do odgoja.'),
    },
    {
        name: 'Milan Stojanović',
        position: text('Értékesítési vezető', 'Sales manager', 'Menadžer prodaje'),
        description: text('A rendelések és a piaci értékesítés felelőse, szívesen válaszol a kérdésekre.', 'He handles the orders and the market sales, and is happy to answer questions.', 'Zadužen je za porudžbine i prodaju na pijaci, rado odgovara na pitanja.'),
    },
    {
        name: 'Horváth Réka',
        position: text('Kézműves', 'Craftswoman', 'Zanatlija'),
        description: text('Ő készíti a pehelypárnákat, a festett tojásokat és a többi kézműves terméket.', 'She makes the down pillows, the painted eggs and the other handmade products.', 'Ona pravi jastuke od paperja, oslikana jaja i ostale rukotvorine.'),
    },
];

const FAQ = [
    {
        question: text('Hogyan rendelhetek?', 'How can I order?', 'Kako mogu da naručim?'),
        answer: text('Válassza ki a terméket, tegye a kosárba, majd adja meg a szállítási adatait. A rendelést e-mailben visszaigazoljuk.', 'Choose a product, add it to the cart and enter your delivery details. We confirm the order by e-mail.', 'Izaberite proizvod, dodajte ga u korpu i unesite podatke za dostavu. Porudžbinu potvrđujemo e-poštom.'),
    },
    {
        question: text('Mennyi a szállítási idő?', 'How long does the delivery take?', 'Koliko traje dostava?'),
        answer: text('Általában 2-4 munkanap, a friss termékeket hűtve szállítjuk.', 'Usually 2-4 working days, the fresh products are delivered chilled.', 'Obično 2-4 radna dana, sveži proizvodi se isporučuju rashlađeni.'),
    },
    {
        question: text('Átvehetem személyesen a terméket?', 'Can I pick up the products in person?', 'Mogu li lično da preuzmem proizvode?'),
        answer: text('Igen, előzetes egyeztetés után a farmon is átveheti a rendelését.', 'Yes, after arranging it with us you can pick up your order at the farm.', 'Da, uz prethodni dogovor porudžbinu možete preuzeti i na farmi.'),
    },
    {
        question: text('Hogyan fizethetek?', 'How can I pay?', 'Kako mogu da platim?'),
        answer: text('Átvételkor készpénzzel vagy bankkártyával fizethet.', 'You can pay in cash or by card on delivery.', 'Plaćanje je gotovinom ili karticom prilikom preuzimanja.'),
    },
    {
        question: text('Látogatható a farm?', 'Can the farm be visited?', 'Da li se farma može posetiti?'),
        answer: text('A nyílt napokon bárki ellátogathat hozzánk, csoportoknak egyedi időpontot is tudunk adni.', 'Anyone can visit us on the open days, groups can also book their own date.', 'Na danima otvorenih vrata svi su dobrodošli, a grupe mogu zakazati i poseban termin.'),
    },
    {
        question: text('Mit tegyek, ha sérült a csomag?', 'What should I do if the package is damaged?', 'Šta da radim ako je paket oštećen?'),
        answer: text('Kérjük, készítsen róla fényképet, és írjon nekünk, a terméket kicseréljük.', 'Please take a photo of it and write to us, we will replace the product.', 'Molimo fotografišite ga i pišite nam, zamenićemo proizvod.'),
    },
];

/** The links point to the list pages of the site, in the language of the slide */
const SLIDERS = [
    {
        title: text('Friss termékek a tanyáról', 'Fresh products from the farm', 'Sveži proizvodi sa farme'),
        subtitle: text('Tojás, hús és pehely saját termelésből.', 'Eggs, meat and down from our own production.', 'Jaja, meso i perje iz sopstvene proizvodnje.'),
        button: text('Termékek', 'Products', 'Proizvodi'),
        link: text('/hu/termekek', '/en/products', '/sr/proizvodi'),
        isActive: 1,
    },
    {
        title: text('Ismerje meg a farmot', 'Get to know the farm', 'Upoznajte farmu'),
        subtitle: text('Olvassa el legfrissebb cikkeinket.', 'Read our latest articles.', 'Pročitajte naše najnovije članke.'),
        button: text('Cikkek', 'Articles', 'Članci'),
        link: text('/hu/cikkek', '/en/blogs', '/sr/clanci'),
        isActive: 1,
    },
    {
        title: text('Kérdése van?', 'Any questions?', 'Imate pitanje?'),
        subtitle: text('Írjon nekünk, szívesen segítünk.', 'Write to us, we are happy to help.', 'Pišite nam, rado ćemo pomoći.'),
        button: text('Kapcsolat', 'Contact', 'Kontakt'),
        link: text('/hu/kapcsolat', '/en/contact', '/sr/kontakt'),
        // An inactive slide, it must not appear on the home page
        isActive: 0,
    },
];

const SENDERS = [
    ['Anna', 'Kovács'], ['Gábor', 'Szabó'], ['Zoltán', 'Nagy'], ['Réka', 'Horváth'], ['Judit', 'Molnár'],
    ['Marko', 'Petrović'], ['Jelena', 'Nikolić'], ['Ana', 'Marković'], ['Emily', 'Carter'], ['Lilla', 'Balogh'],
];

const CONTACT_MESSAGE_COUNT = 25;

function buildGalleries(now) {
    const random = createRandom(20261128);

    return GALLERY_NAMES.map((name, index) => {
        const galleryDate = addDays(now, -(index * 30 + random.int(1, 20)));
        const createdAt = atTime(galleryDate, random.int(9, 18), random.int(0, 59));

        return {
            slug: slugOf(name),
            row: {
                gallery_name: localized(name),
                description: localized(random.pick(GALLERY_DESCRIPTIONS)),
                slug: slugOf(name),
                gallery_date: toDateOnly(galleryDate),
                gallery_images: null,
                gallery_thumbnail: null,
                is_active: random.chance(0.9) ? 1 : 0,
                is_featured: random.chance(0.4) ? 1 : 0,
                created_at: createdAt,
                updated_at: createdAt,
            },
        };
    });
}

function buildSiteContent(now) {
    const random = createRandom(20261129);
    const createdAt = atTime(addDays(now, -60), 10, 0);

    const employees = EMPLOYEES.map((employee, index) => ({
        image: null,
        name: employee.name,
        position: localized(employee.position),
        description: localized(employee.description),
        facebook: random.chance(0.5) ? 'https://www.facebook.com/' : null,
        instagram: random.chance(0.5) ? 'https://www.instagram.com/' : null,
        tiktok: null,
        email: emailOf(employee.name, index + 1),
        phone: phoneOf(random),
        is_active: 1,
        created_at: createdAt,
        updated_at: createdAt,
    }));

    const faq = FAQ.map(item => ({
        question: localized(item.question),
        answer: localized({ hu: `<p>${item.answer.hu}</p>`, en: `<p>${item.answer.en}</p>`, sr: `<p>${item.answer.sr}</p>` }),
        is_active: 1,
        created_at: createdAt,
        updated_at: createdAt,
    }));

    const sliders = SLIDERS.map(slider => ({
        title: localized(slider.title),
        subtitle: localized(slider.subtitle),
        image: null,
        link: localized(slider.link),
        target_page: '_self',
        button_text: localized(slider.button),
        is_active: slider.isActive,
        created_at: createdAt,
        updated_at: createdAt,
    }));

    return { employees, faq, sliders };
}

function buildContactMessages(now) {
    const random = createRandom(20261130);

    return Array.from({ length: CONTACT_MESSAGE_COUNT }, (_, index) => {
        const [firstName, lastName] = random.pick(SENDERS);

        return {
            first_name: firstName,
            last_name: lastName,
            phone: phoneOf(random),
            email: emailOf(`${firstName} ${lastName}`, 100 + index),
            city: random.pick(CITIES)[0],
            client_message: random.pick(CONTACT_MESSAGES),
            date: atTime(addDays(now, -random.int(0, 200)), random.int(7, 22), random.int(0, 59)),
        };
    });
}

module.exports = { buildGalleries, buildSiteContent, buildContactMessages };
