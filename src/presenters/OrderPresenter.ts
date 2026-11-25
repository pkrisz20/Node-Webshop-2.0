import type { Language } from '../locales';
import type { Order, OrderDetail } from '../models';
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

    /** Popup content of the order details, every customer and admin input (product names, currency) is escaped */
    renderDetailsHtml(order: Order): string {
        const escape = TextFormatter.escapeHtml;
        const currency = escape(this.priceFormat.currency);
        const note = order.customer_note ? escape(order.customer_note) : NO_NOTE_BADGE;

        const productLines = (order.details ?? []).map(detail => (
            `<p class='fs-6 mb-0'>${detail.quantity} x ${escape(this.localized(detail.product?.name))} (${this.unitPriceText(detail, currency)})</p>`
        )).join('');

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

    /**
     * The unit price saved with the order. The lines of the old orders have no saved price,
     * the current price of the product is shown for them, marked as such.
     */
    private unitPriceText(detail: OrderDetail, currency: string): string {
        if (detail.unit_price !== null) {
            return `${this.priceFormat.formatAmount(detail.unit_price)} ${currency} / db`;
        }

        if (!detail.product) {
            return 'ismeretlen ár';
        }

        return `${this.priceFormat.formatAmount(detail.product.getEffectivePrice())} ${currency} / db, jelenlegi ár`;
    }
}
