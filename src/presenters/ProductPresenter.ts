import type { Language } from '../locales';
import type { Product, ProductParameter } from '../models';
import { DateFormatter } from '../utils/DateFormatter';
import { Formatter } from '../utils/Formatter';
import { ImageUrl } from '../utils/ImageUrl';
import { LocalizedField } from '../utils/LocalizedField';
import type { PriceFormat } from '../utils/PriceFormat';

export interface ProductCard {
    id: number;
    name: string | null;
    slug: string | null;
    short: string | null;
    image: string | null;
    price: string;
    isOnDiscount: boolean;
    discount: string | null;
    discountEndDate: string | null;
    isAvailable: boolean;
    isPostable: boolean;
    isNew: boolean;
    maxQuantity: number | null;
    already_in_cart: boolean;
    saved_in_wishlist: boolean;
}

export interface ProductRating {
    average: number;
    count: number;
}

export interface ProductPresenterOptions {
    language: Language;
    priceFormat: PriceFormat;
    /** Products already in the visitor's cart / wishlist */
    cartProductIds?: number[];
    wishlistProductIds?: number[];
}

export class ProductPresenter {
    private readonly language: Language;
    private readonly priceFormat: PriceFormat;
    private readonly cartProductIds: number[];
    private readonly wishlistProductIds: number[];

    constructor({ language, priceFormat, cartProductIds = [], wishlistProductIds = [] }: ProductPresenterOptions) {
        this.language = language;
        this.priceFormat = priceFormat;
        this.cartProductIds = cartProductIds;
        this.wishlistProductIds = wishlistProductIds;
    }

    toCard(product: Product): ProductCard {
        return {
            id: product.id,
            name: this.localized(product.name),
            slug: this.localized(product.slug),
            short: Formatter.limitText(this.localized(product.short_description)),
            image: ImageUrl.of(product.image_thumbnail, 'products'),
            price: this.priceFormat.number(product.price),
            isOnDiscount: Boolean(product.discount_value),
            discount: product.discount_value != null ? this.priceFormat.number(product.discount_value) : null,
            discountEndDate: DateFormatter.toDateString(product.discount_end_date),
            isAvailable: Boolean(product.is_available),
            isPostable: Boolean(product.is_delivered),
            isNew: Boolean(product.is_new),
            maxQuantity: product.max_order_count ?? null,
            already_in_cart: this.cartProductIds.includes(product.id),
            saved_in_wishlist: this.wishlistProductIds.includes(product.id),
        };
    }

    /** Search results show the category name as well */
    toSearchResult(product: Product) {
        return {
            ...this.toCard(product),
            category: this.localized(product.category?.name),
        };
    }

    toDetails(product: Product, parameterValues: ProductParameter[], rating: ProductRating) {
        const discount = product.discount_value;

        return {
            id: product.id,
            slug: this.localized(product.slug),
            categoryID: product.category_id,
            category_name: this.localized(product.category?.name),
            categorySlug: this.localized(product.category?.slug),
            name: this.localized(product.name),
            short: this.localized(product.short_description),
            description: this.localized(product.description),
            thumbnailImage: ImageUrl.of(product.image_thumbnail, 'products'),
            images: ImageUrl.listOf(product.images, 'products'),
            price: this.priceFormat.number(product.price),
            isOnDiscount: Boolean(discount),
            discountEndDate: DateFormatter.toDateString(product.discount_end_date),
            discount: discount != null ? this.priceFormat.number(discount) : null,
            savings: discount != null ? this.priceFormat.number(product.price - discount) : null,
            averageRating: Math.ceil(rating.average),
            allRatingsCount: rating.count,
            isAvailable: Boolean(product.is_available),
            isPostable: Boolean(product.is_delivered),
            maxQuantity: product.max_order_count ?? null,
            isAllowed: Boolean(product.comments_allowed),
            saved_in_wishlist: this.wishlistProductIds.includes(product.id),
            productParams: parameterValues.map(parameterValue => ({
                name: this.localized(parameterValue.parameter?.parameter_name),
                value: this.localized(parameterValue.parameter_value),
            })),
        };
    }

    private localized(json: string | null | undefined): string | null {
        return LocalizedField.pick(json, this.language);
    }
}
