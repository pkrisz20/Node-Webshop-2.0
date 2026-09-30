/** A product line stored in the session cart */
export interface CartItem {
    productId: number;
    productName: string | null;
    slug: string | null;
    /** null means there is no limit */
    maxQuantity: number | null;
    quantity: number;
    price: number;
    image: string | null;
    is_available: number;
    is_active: number;
}
