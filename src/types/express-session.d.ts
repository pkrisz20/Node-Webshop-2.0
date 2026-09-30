import 'express-session';
import type { Language } from '../locales';
import type { CartItem } from './cart';

declare module 'express-session' {
    interface SessionData {
        lang: Language;
        authenticated: boolean;
        csrfToken: string;
        cart: CartItem[];
        totalPrice: number;
        totalCount: number;
        wishlist: number[];
    }
}
