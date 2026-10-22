import type { Request } from 'express';
import type { Language } from '../locales';
import { CartService } from '../services/CartService';
import type { CartItem } from '../types/cart';
import type { PriceFormat } from '../utils/PriceFormat';
import { TextFormatter } from '../utils/TextFormatter';
import { Presenter } from './Presenter';

type DisplayedCartItem = Omit<CartItem, 'price'> & { price: number | string };

export interface CartView {
    items: DisplayedCartItem[];
    totalCount: number;
    totalPrice: string;
}

/** Mini cart data and the HTML of the mini cart returned by the "add to cart" AJAX call */
export class CartPresenter extends Presenter {
    private readonly currency: string;

    constructor(language: Language, private readonly priceFormat: PriceFormat) {
        super(language);
        // The currency comes from the admin settings, so it is escaped like any other input
        this.currency = TextFormatter.escapeHtml(priceFormat.currency);
    }

    /**
     * Cart data of the header mini cart.
     * The order page formats the item prices in the template, so it needs the raw numbers.
     */
    toView(session: Request['session'], { formatItemPrices = true } = {}): CartView {
        const items = CartService.items(session);

        return {
            items: formatItemPrices ? items.map(item => ({ ...item, price: this.priceFormat.formatAmount(item.price) })) : items,
            totalCount: session.totalCount ?? items.length,
            totalPrice: this.priceFormat.formatAmount(session.totalPrice ?? CartService.totalPrice(items)),
        };
    }

    /** List items appended to an already visible mini cart */
    renderItems(items: DisplayedCartItem[]): string {
        return items.map(item => this.renderItem(item)).join('');
    }

    /** The whole mini cart, rendered when the first product is added to an empty cart */
    renderCart(cart: CartView): string {
        return `
            <strong class="cart-counter">${this.translate('orders.cart_count')}: <span class="js-cart-counter">${cart.totalCount}</span></strong>
            <div class="cart-container">
                <div class="cart-container-top">
                    <a href="/${this.language}/${this.translate('slugs.cart')}" aria-label="Navigation link to the orders page" class="cart-container-top_ordering">${this.translate('orders.order')}</a>
                    <strong class="cart-container-top_total">${this.translate('orders.total_price')}: <span class="js-total-price">${cart.totalPrice}</span><small>${this.currency}</small></strong>
                </div>

                <ul class="cart-container-list js-cart-list">${this.renderItems(cart.items)}</ul>
            </div>`;
    }

    private renderItem(item: DisplayedCartItem): string {
        const productUrl = `/${this.language}/${this.translate('slugs.product')}/${item.slug}/${item.productId}`;

        return `
            <li class="cart-container-list-item js-cart-item">
                <div class="cart-product">
                    <div class="cart-product-image">
                        <picture>
                            <source srcset="${item.image ?? ''}">
                            <img
                                class="cart-product-img"
                                alt="${item.productName}"
                                loading="lazy"
                                src="images/no-picture.jpg"
                                onerror="this.onerror = null;this.parentNode.children[0].srcset = this.src;"
                            />
                        </picture>
                    </div>

                    <div class="cart-product-desc">
                        <strong class="cart-product-desc_name">${item.productName}</strong>

                        <div class="quantities">
                            <div class="quantities-container js-quantities">
                                <button type="button" class="quantities-btn js-quantity-btn minus"><i class="fas fa-minus"></i></button>
                                <input class="quantities-input js-product-quantity" data-id="${item.productId}" type="number" value="${item.quantity}" min="1" max="${item.maxQuantity ?? ''}" />
                                <button type="button" class="quantities-btn js-quantity-btn plus"><i class="fas fa-plus"></i></button>
                            </div>

                            <small class="quantities-price"><i class="fas fa-times"></i> <span>${item.price} ${this.currency}</span></small>
                        </div>

                        <div class="functions">
                            <a href="${productUrl}" class="functions_details" aria-label="Link to product details"><i class="fas fa-info-circle"></i></a>
                            <button type="button" value="${this.translate('general.remove')}" data-id="${item.productId}" class="functions_remove js-remove-cart"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                </div>
            </li>`;
    }
}
