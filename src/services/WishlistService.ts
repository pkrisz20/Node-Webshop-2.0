import type { Request } from 'express';
import { Op } from 'sequelize';
import { Product } from '../models';

type Session = Request['session'];

export class WishlistService {
    static productIds(session: Session): number[] {
        return Array.isArray(session.wishlist) ? session.wishlist : [];
    }

    /** Removes the products from the wishlist which became inactive in the meantime */
    async removeInactiveProducts(session: Session): Promise<number[]> {
        const productIds = WishlistService.productIds(session);

        if (productIds.length === 0) {
            return [];
        }

        const activeProducts = await Product.findAll({
            attributes: ['id'],
            where: { id: { [Op.in]: productIds }, is_active: 1 },
        });

        session.wishlist = activeProducts.map(product => product.id);

        return session.wishlist;
    }

    /** @returns false when the product does not exist or it is inactive */
    async add(session: Session, productId: number): Promise<boolean> {
        const product = await Product.findOne({ attributes: ['id'], where: { id: productId, is_active: 1 } });

        if (!product) {
            return false;
        }

        const productIds = WishlistService.productIds(session);
        session.wishlist = productIds.includes(product.id) ? productIds : [...productIds, product.id];

        return true;
    }

    /** @returns false when the product was not in the wishlist */
    remove(session: Session, productId: number): boolean {
        const productIds = WishlistService.productIds(session);

        if (!productIds.includes(productId)) {
            return false;
        }

        session.wishlist = productIds.filter(id => id !== productId);

        return true;
    }
}
