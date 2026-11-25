const { emailOf, createRandom, addDays, atTime, notAfter } = require('./helpers');
const { CUSTOMERS, CITIES, STREETS, ORDER_NOTES, phoneOf } = require('./people');

/** The ids of the test orders start with this, the undo deletes the orders by it */
const ORDER_ID_PREFIX = 'seed-';

const ORDER_COUNT = 45;

/** Fresh orders are still open, the older ones are mostly done, some are canceled */
function statusOf(random, ageInDays) {
    if (ageInDays <= 3) {
        return random.pick(['new', 'new', 'in process']);
    }

    if (ageInDays <= 14) {
        return random.pick(['new', 'in process', 'in process', 'done']);
    }

    return random.pick(['done', 'done', 'done', 'done', 'canceled']);
}

/** Same rule as `Product.hasActiveDiscount()`, applied at the time of the order */
function unitPriceAt(product, orderDate) {
    const hasDiscount = product.discount_value !== null
        && (!product.discount_end_date || new Date(product.discount_end_date).getTime() > orderDate.getTime());

    return Number(hasDiscount ? product.discount_value : product.price);
}

/**
 * Orders of the last ~11 months with 1-4 product lines, so the dashboard charts and every order status have data.
 * @param products the seeded products read back from the database (id, price, discount, flags)
 */
function buildOrders(now, products) {
    const random = createRandom(20261126);
    const orderableProducts = products.filter(product => product.is_active === 1 && product.is_available === 1);

    const customers = CUSTOMERS.map(([firstName, lastName], index) => {
        const [city, postalCode] = random.pick(CITIES);

        return {
            firstName,
            lastName,
            email: emailOf(`${firstName} ${lastName}`, index + 1),
            phone: phoneOf(random),
            city,
            postalCode,
            address: `${random.pick(STREETS)} ${random.int(1, 120)}`,
        };
    });

    return Array.from({ length: ORDER_COUNT }, (_, index) => {
        const customer = random.pick(customers);
        const ageInDays = random.int(0, 330);
        const orderDate = notAfter(atTime(addDays(now, -ageInDays), random.int(7, 22), random.int(0, 59)), now);
        const status = statusOf(random, ageInDays);
        const isClosed = status === 'done' || status === 'canceled';

        const lines = random.sample(orderableProducts, random.int(1, 4)).map(product => ({
            product_id: product.id,
            quantity: random.int(1, Math.min(product.max_order_count ?? 4, 4)),
            unit_price: unitPriceAt(product, orderDate),
        }));

        return {
            order: {
                order_id: `${ORDER_ID_PREFIX}${String(index + 1).padStart(4, '0')}`,
                customer_firstname: customer.firstName,
                customer_lastname: customer.lastName,
                customer_email: customer.email,
                customer_address: customer.address,
                customer_postal_code: customer.postalCode,
                customer_city: customer.city,
                customer_phone: customer.phone,
                customer_note: random.chance(0.3) ? random.pick(ORDER_NOTES) : null,
                order_status: status,
                order_sum_price: lines.reduce((total, line) => total + line.quantity * line.unit_price, 0),
                order_date: orderDate,
                closed_order_at: isClosed ? notAfter(addDays(orderDate, random.int(1, 6)), now) : null,
            },
            lines,
        };
    });
}

module.exports = { ORDER_ID_PREFIX, buildOrders };
