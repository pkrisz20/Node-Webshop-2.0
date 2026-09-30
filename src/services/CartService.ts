import type { Request } from 'express';
import { Op } from 'sequelize';
import type { Language } from '../locales';
import { Product } from '../models';
import type { CartItem } from '../types/cart';
import { ImageUrl } from '../utils/ImageUrl';
import { LocalizedField } from '../utils/LocalizedField';

type Session = Request['session'];

export type AddToCartResult = 'added' | 'already_in_cart' | 'not_orderable' | 'not_found';

export interface CartUpdateResult {
    quantity: number;
    maxQuantity: number | null;
    wasLimited: boolean;
    linePrice: number;
    totalPrice: number;
}

export class CartService {
    static items(session: Session): CartItem[] {
        return session.cart ?? [];
    }

    static productIds(session: Session): number[] {
        return CartService.items(session).map(item => item.productId);
    }

    static totalPrice(items: CartItem[]): number {
        return items.reduce((total, item) => total + item.quantity * item.price, 0);
    }

    /**
     * Reloads the names, prices and availability of the cart products from the database
     * and drops the products which can not be ordered anymore.
     * @returns true when any product was removed from the cart
     */
    async refresh(session: Session, language: Language): Promise<boolean> {
        const items = CartService.items(session);

        if (items.length === 0) {
            this.save(session, []);
            return false;
        }

        const products = await Product.findAll({ where: { id: { [Op.in]: CartService.productIds(session) } } });
        const productsById = new Map(products.map(product => [product.id, product]));

        const orderableItems = items.flatMap(item => {
            const product = productsById.get(item.productId);
            return product?.isOrderable() ? [this.toCartItem(product, item.quantity, language)] : [];
        });

        this.save(session, orderableItems);

        return orderableItems.length !== items.length;
    }

    async add(session: Session, productId: number, quantity: number, language: Language): Promise<AddToCartResult> {
        const items = CartService.items(session);

        if (items.some(item => item.productId === productId)) {
            return 'already_in_cart';
        }

        const product = await Product.findByPk(productId);

        if (!product) {
            return 'not_found';
        }

        if (!product.isOrderable() || !CartService.isAllowedQuantity(quantity, product.max_order_count)) {
            return 'not_orderable';
        }

        this.save(session, [...items, this.toCartItem(product, quantity, language)]);

        return 'added';
    }

    /** Sets the quantity of a cart product, limited to the maximum orderable quantity */
    update(session: Session, productId: number, requestedQuantity: number): CartUpdateResult | null {
        const items = CartService.items(session);
        const item = items.find(cartItem => cartItem.productId === productId);

        if (!item) {
            return null;
        }

        const { maxQuantity } = item;
        const wasLimited = maxQuantity !== null && requestedQuantity > maxQuantity;
        item.quantity = wasLimited ? maxQuantity : requestedQuantity;

        this.save(session, items);

        return {
            quantity: item.quantity,
            maxQuantity,
            wasLimited,
            linePrice: item.quantity * item.price,
            totalPrice: session.totalPrice ?? 0,
        };
    }

    remove(session: Session, productId: number): boolean {
        const items = CartService.items(session);
        const remainingItems = items.filter(item => item.productId !== productId);

        if (remainingItems.length === items.length) {
            return false;
        }

        this.save(session, remainingItems);

        return true;
    }

    clear(session: Session): void {
        this.save(session, []);
    }

    private static isAllowedQuantity(quantity: number, maxQuantity: number | null): boolean {
        return quantity > 0 && (maxQuantity === null || quantity <= maxQuantity);
    }

    private toCartItem(product: Product, quantity: number, language: Language): CartItem {
        return {
            productId: product.id,
            productName: LocalizedField.pick(product.name, language),
            slug: LocalizedField.pick(product.slug, language),
            maxQuantity: product.max_order_count,
            quantity,
            price: Math.trunc(product.getEffectivePrice()),
            image: ImageUrl.of(product.image_thumbnail, 'products'),
            is_available: product.is_available,
            is_active: product.is_active,
        };
    }

    private save(session: Session, items: CartItem[]): void {
        session.cart = items;
        session.totalPrice = CartService.totalPrice(items);
        session.totalCount = items.length;
    }
}
