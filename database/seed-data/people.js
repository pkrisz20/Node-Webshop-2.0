/** Names, places and texts shared by the reviews, the orders and the contact messages. Every e-mail uses example.com */

const REVIEWER_NAMES = [
    'Kovács Anna', 'Szabó Gábor', 'Tóth Eszter', 'Nagy Zoltán', 'Horváth Réka', 'Varga Bence', 'Molnár Judit',
    'Kiss Tamás', 'Németh Dóra', 'Farkas Ádám', 'Marko Petrović', 'Jelena Nikolić', 'Stefan Jovanović',
    'Ana Marković', 'Milica Popović', 'Emily Carter',
];

const REVIEW_TEXTS = [
    'Nagyon elégedett vagyok, friss és jó minőségű.',
    'Gyors kiszállítás, minden rendben volt.',
    'Másodszor rendelek, ismét kiváló.',
    'Az ára kicsit magas, de megéri.',
    'A családnak nagyon ízlett, biztosan rendelünk még.',
    'Pontosan olyan, mint a leírásban.',
    'Kedves kiszolgálás, csak ajánlani tudom.',
    'Kicsit később érkezett, de a minőség kárpótolt.',
    'Odličan kvalitet, sve preporuke.',
    'Brza dostava, proizvod je kao na slici.',
    'Naručujem ponovo, veoma sam zadovoljna.',
    'Great quality, I will order again.',
    'Exactly as described, thank you.',
];

const CUSTOMERS = [
    ['Anna', 'Kovács'], ['Gábor', 'Szabó'], ['Eszter', 'Tóth'], ['Zoltán', 'Nagy'], ['Réka', 'Horváth'],
    ['Bence', 'Varga'], ['Judit', 'Molnár'], ['Tamás', 'Kiss'], ['Dóra', 'Németh'], ['Ádám', 'Farkas'],
    ['Marko', 'Petrović'], ['Jelena', 'Nikolić'], ['Stefan', 'Jovanović'], ['Ana', 'Marković'], ['Milica', 'Popović'],
    ['Nikola', 'Đorđević'], ['Ivana', 'Stojanović'], ['Lilla', 'Balogh'], ['Péter', 'Takács'], ['Katalin', 'Juhász'],
];

/** [city, postal code] in Vojvodina */
const CITIES = [
    ['Szabadka', '24000'], ['Zenta', '24400'], ['Topolya', '24300'], ['Magyarkanizsa', '24420'], ['Ada', '24430'],
    ['Óbecse', '21220'], ['Újvidék', '21000'], ['Temerin', '21235'], ['Csóka', '23320'], ['Mohol', '24435'],
];

const STREETS = [
    'Fő utca', 'Petőfi Sándor utca', 'Kossuth Lajos utca', 'Dózsa György utca', 'Arany János utca',
    'Corvin Mátyás utca', 'Jovana Cvijića', 'Njegoševa', 'Maksima Gorkog', 'Vuka Karadžića',
];

const ORDER_NOTES = [
    'Kérem, délután hozzák, délelőtt nem vagyok otthon.',
    'Csengessenek kétszer, a kapu mögött kutya van.',
    'Ajándékba lesz, kérem, szépen csomagolják.',
    'Molim vas da pozovete pre dostave.',
    'Hétvégén nem tudom átvenni.',
];

const CONTACT_MESSAGES = [
    'Szeretnék érdeklődni, hogy mikor lesz újra libatojás.',
    'Lehetséges nagyobb mennyiséget rendelni egy családi rendezvényre?',
    'Szállítanak Újvidékre is? Ha igen, mennyi a szállítási díj?',
    'Milyen napokon és időpontokban látogatható a farm?',
    'Pehelypaplant szeretnék rendelni egyedi méretben, megoldható?',
    'Da li imate guščiju mast na stanju?',
    'Zanima me cena za veću količinu jaja, nedeljno oko 100 komada.',
    'Kada je sledeći dan otvorenih vrata na farmi?',
    'Do you ship abroad, for example to Hungary?',
    'I would like to visit the farm with a school group of 20 children.',
];

/** A mobile number in the format of the existing data, e.g. "0641234567" */
function phoneOf(random) {
    return `06${random.int(0, 6)}${String(random.int(1000000, 9999999))}`;
}

module.exports = { REVIEWER_NAMES, REVIEW_TEXTS, CUSTOMERS, CITIES, STREETS, ORDER_NOTES, CONTACT_MESSAGES, phoneOf };
