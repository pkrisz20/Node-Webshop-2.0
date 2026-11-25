const { localized, slugOf, emailOf, createRandom, addDays, atTime, toDateOnly, notAfter } = require('./helpers');
const { REVIEWER_NAMES } = require('./people');

const title = (hu, en, sr) => ({ hu, en, sr });

/** Articles dated in the past */
const ARTICLE_TITLES = [
    title('Így neveljük a libáinkat', 'How we raise our geese', 'Kako uzgajamo naše guske'),
    title('A libatojás titkai', 'The secrets of goose eggs', 'Tajne guščijih jaja'),
    title('Tavaszi kikelés a farmon', 'Spring hatching on the farm', 'Prolećno izleganje na farmi'),
    title('Miért fontos a szabad tartás', 'Why free range matters', 'Zašto je slobodan uzgoj važan'),
    title('Házi kolbász lépésről lépésre', 'Homemade sausage step by step', 'Domaća kobasica korak po korak'),
    title('Pehelypárna vagy szintetikus', 'Down pillow or synthetic', 'Jastuk od paperja ili sintetički'),
    title('Látogatás a szabadkai piacon', 'A visit to the Subotica market', 'Poseta subotičkoj pijaci'),
    title('A kacsák téli gondozása', 'Winter care for ducks', 'Zimska nega pataka'),
    title('A takarmány, amit mi is használunk', 'The feed we use ourselves', 'Hrana koju i mi koristimo'),
    title('Libamáj receptek ünnepekre', 'Goose liver recipes for the holidays', 'Recepti od guščije džigerice za praznike'),
    title('Egy nap a farmon', 'A day on the farm', 'Jedan dan na farmi'),
    title('Hogyan tároljuk a tojást', 'How to store eggs', 'Kako čuvati jaja'),
    title('Elkészült az új istálló', 'Our new barn is ready', 'Završena je nova štala'),
    title('A fürjtojás jótékony hatásai', 'Health benefits of quail eggs', 'Zdravstvene prednosti prepeličjih jaja'),
    title('Kézműves termékeink készítői', 'The makers of our handmade products', 'Ljudi koji prave naše rukotvorine'),
    title('Nyári hőség és az állatok', 'Summer heat and the animals', 'Letnja vrućina i životinje'),
    title('Bemutatkozik új csapattagunk', 'Meet our new team member', 'Upoznajte novog člana tima'),
    title('Tolltépés régen és ma', 'Plucking feathers then and now', 'Čerupanje perja nekad i sad'),
    title('Füstölés hagyományos módon', 'Smoking the traditional way', 'Dimljenje na tradicionalan način'),
    title('Válaszok a leggyakoribb kérdéseitekre', 'Answers to your most common questions', 'Odgovori na vaša najčešća pitanja'),
];

/** Events: articles dated in the future */
const EVENT_TITLES = [
    title('Nyílt nap a farmon', 'Open day on the farm', 'Dan otvorenih vrata na farmi'),
    title('Libanap és kóstoló', 'Goose day and tasting', 'Dan guske i degustacija'),
    title('Karácsonyi vásár a tanyán', 'Christmas fair on the farm', 'Božićni vašar na farmi'),
    title('Kézműves foglalkozás gyerekeknek', 'Craft workshop for children', 'Kreativna radionica za decu'),
];

const AUTHORS = ['Kovács Péter', 'Szabó Eszter', 'Milan Stojanović', 'Farma Gusaka'];

const ARTICLE_SHORTS = [
    { hu: 'Rövid betekintés a tanya mindennapjaiba és abba, amit az évek során megtanultunk.', en: 'A short look into the everyday life of the farm and what we have learned over the years.', sr: 'Kratak pogled u svakodnevni život farme i ono što smo naučili tokom godina.' },
    { hu: 'Gyakorlati tanácsok, amelyeket otthon is könnyen kipróbálhat.', en: 'Practical tips that you can easily try at home.', sr: 'Praktični saveti koje lako možete isprobati i kod kuće.' },
    { hu: 'Hírek a farmról: újdonságok, fejlesztések és tervek.', en: 'News from the farm: novelties, improvements and plans.', sr: 'Vesti sa farme: novosti, unapređenja i planovi.' },
];

const EVENT_SHORTS = [
    { hu: 'Várunk mindenkit szeretettel, a részvétel ingyenes.', en: 'Everyone is welcome, participation is free.', sr: 'Svi su dobrodošli, učešće je besplatno.' },
    { hu: 'A helyek száma korlátozott, kérjük, jelentkezzen előre.', en: 'Places are limited, please register in advance.', sr: 'Broj mesta je ograničen, molimo prijavite se unapred.' },
];

const PARAGRAPHS = [
    { hu: 'A tanyán minden nap korán kezdődik: az állatok etetése, a tojások összegyűjtése és az ólak takarítása után jöhet csak a reggeli.', en: 'Every day on the farm starts early: feeding the animals, collecting the eggs and cleaning the coops all come before breakfast.', sr: 'Svaki dan na farmi počinje rano: hranjenje životinja, sakupljanje jaja i čišćenje kokošinjaca dolaze pre doručka.' },
    { hu: 'Állataink nagy, füves legelőn mozoghatnak szabadon, ami nemcsak nekik jó, hanem a termékek minőségén is meglátszik.', en: 'Our animals roam freely on a large grassy pasture, which is good for them and also shows in the quality of the products.', sr: 'Naše životinje se slobodno kreću po velikom travnatom pašnjaku, što je dobro za njih, a vidi se i na kvalitetu proizvoda.' },
    { hu: 'A takarmányt nagyrészt magunk termeljük, így pontosan tudjuk, mit esznek az állataink.', en: 'We grow most of the feed ourselves, so we know exactly what our animals eat.', sr: 'Veći deo hrane sami proizvodimo, tako da tačno znamo šta naše životinje jedu.' },
    { hu: 'Sok látogató kérdezi, hogyan lehet otthon is megőrizni a termékek frissességét. Néhány egyszerű tanáccsal ez könnyen sikerül.', en: 'Many visitors ask how to keep the products fresh at home. With a few simple tips it is easy.', sr: 'Mnogi posetioci pitaju kako da kod kuće sačuvaju svežinu proizvoda. Uz nekoliko jednostavnih saveta to je lako.' },
    { hu: 'Köszönjük mindenkinek, aki az elmúlt hónapokban meglátogatott minket vagy rendelt tőlünk. Ez ad erőt a folytatáshoz.', en: 'Thank you to everyone who visited us or ordered from us in the past months. It gives us the strength to carry on.', sr: 'Hvala svima koji su nas posetili ili naručili od nas proteklih meseci. To nam daje snagu da nastavimo.' },
    { hu: 'A következő hetekben további újdonságokkal készülünk, érdemes figyelni az oldalunkat.', en: 'We are preparing more news for the coming weeks, so keep an eye on our page.', sr: 'Za naredne nedelje spremamo još noviteta, pratite našu stranicu.' },
];

const COMMENT_TEXTS = [
    'Nagyon érdekes cikk, köszönöm!',
    'Mi is így csináljuk otthon, bevált módszer.',
    'Mikor lesz a következő nyílt nap?',
    'Szuper képek és hasznos tanácsok.',
    'Odličan tekst, hvala na savetima!',
    'Jedva čekam sledeći događaj.',
    'Very interesting, thanks for sharing.',
];

function descriptionOf(random) {
    const paragraphs = random.sample(PARAGRAPHS, random.int(2, 4));
    const html = language => paragraphs.map(paragraph => `<p>${paragraph[language]}</p>`).join('');
    return localized({ hu: html('hu'), en: html('en'), sr: html('sr') });
}

function commentsOf(random, articleDate, now) {
    // An event can not be commented before it happens
    if (articleDate.getTime() > now.getTime()) {
        return [];
    }

    return Array.from({ length: random.int(0, 4) }, () => {
        const name = random.pick(REVIEWER_NAMES);

        return {
            name,
            email: emailOf(name, random.int(1, 99)),
            comment: random.pick(COMMENT_TEXTS),
            is_active: random.chance(0.8) ? 1 : 0,
            date: notAfter(atTime(addDays(articleDate, random.int(0, 20)), random.int(7, 22), random.int(0, 59)), now),
        };
    });
}

function articleOf(random, titles, date, shorts, now) {
    const createdAt = notAfter(atTime(addDays(date, -random.int(0, 5)), random.int(8, 18), random.int(0, 59)), now);
    const commentsAllowed = random.chance(0.75);

    return {
        slug: slugOf(titles),
        row: {
            title: localized(titles),
            slug: slugOf(titles),
            date: toDateOnly(date),
            images: null,
            image_thumbnail: null,
            author: random.pick(AUTHORS),
            short_description: localized(random.pick(shorts)),
            description: descriptionOf(random),
            is_active: random.chance(0.9) ? 1 : 0,
            is_featured: random.chance(0.3) ? 1 : 0,
            is_important: random.chance(0.15) ? 1 : 0,
            comments_allowed: commentsAllowed ? 1 : 0,
            created_at: createdAt,
            updated_at: createdAt,
        },
        comments: commentsAllowed ? commentsOf(random, date, now) : [],
    };
}

/** 20 articles spread over the last year (several in the last 3 months) and 4 upcoming events */
function buildBlog(now) {
    const random = createRandom(20261127);

    const articles = ARTICLE_TITLES.map((titles, index) => (
        articleOf(random, titles, addDays(now, -(index * 17 + random.int(1, 10))), ARTICLE_SHORTS, now)
    ));

    const events = EVENT_TITLES.map((titles, index) => (
        articleOf(random, titles, addDays(now, index * 12 + random.int(3, 10)), EVENT_SHORTS, now)
    ));

    return [...articles, ...events];
}

module.exports = { buildBlog };
