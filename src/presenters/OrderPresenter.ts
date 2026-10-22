import type { Language } from '../locales';
import type { Order } from '../models';
import { DateFormatter } from '../utils/DateFormatter';
import type { PriceFormat } from '../utils/PriceFormat';
import { TextFormatter } from '../utils/TextFormatter';
import { Presenter } from './Presenter';

const NO_NOTE_BADGE = "<span class='badge text-uppercase fw-medium bg-danger'>Nincs megjegyzés</span>";

/** Order data of the admin pages */
export class OrderPresenter extends Presenter {
    constructor(language: Language, private readonly priceFormat: PriceFormat) {
        super(language);
    }

    toListRow(order: Order) {
        return {
            id: order.order_id,
            can_edit_status: order.isStatusEditable(),
            selectableStatuses: order.getSelectableStatuses(),
            firstname: order.customer_firstname,
            lastname: order.customer_lastname,
            city: order.customer_city,
            phone: order.customer_phone,
            statusData: order.getStatusBadge(),
            sumPrice: this.priceFormat.formatAmount(order.order_sum_price),
            orderDate: DateFormatter.toAdminShortDateTime(order.order_date),
        };
    }

    /**
     * Popup content of the order details, every customer input (and the currency of the admin settings) is escaped.
     * The order lines store no unit price, so the current (discounted) price of the product is shown.
     */
    renderDetailsHtml(order: Order): string {
        const escape = (value: string | null | undefined) => TextFormatter.escapeHtml(value ?? '');
        const currency = escape(this.priceFormat.currency);
        const note = order.customer_note ? escape(order.customer_note) : NO_NOTE_BADGE;

        const productLines = (order.details ?? []).map(detail => {
            const { product } = detail;
            const unitPrice = product ? this.priceFormat.formatAmount(product.getEffectivePrice()) : '';

            return `<p class='fs-6 mb-0'>${detail.quantity} x ${this.localized(product?.name)} (${unitPrice} ${currency} / db)</p>`;
        }).join('');

        return `
            <div class='d-flex flex-column'>
                <div class='text-start mb-2'>
                    <strong class='text-uppercase fs-5 bg-warning px-1'>Megrendelő adatai</strong>
                    <p class='fs-6 mb-0'><b>Teljes név:</b> ${escape(order.customerFullName)}</p>
                    <p class='fs-6 mb-0'><b>Település:</b> ${escape(order.customer_city)}</p>
                    <p class='fs-6 mb-0'><b>E-mail:</b> ${escape(order.customer_email)}</p>
                    <p class='fs-6 mb-0'><b>Szállítási cím:</b> ${escape(order.customer_address)}</p>
                    <p class='fs-6 mb-0'><b>Irányítószám:</b> ${escape(order.customer_postal_code)}</p>
                    <p class='fs-6 mb-0'><b>Hozzáfűzött megjegyzés:</b> ${note}</p>
                </div>
                <div class='text-start'>
                    <strong class='text-uppercase fs-5 bg-warning px-1'>Rendelt termékek</strong>
                    ${productLines}
                    <div class='fs-6 mt-2 bg-danger link-light p-2 d-inline-block'>Fizetendő összeg: <b>${this.priceFormat.formatAmount(order.order_sum_price)} ${currency}</b></div>
                </div>
            </div>
        `;
    }
}
