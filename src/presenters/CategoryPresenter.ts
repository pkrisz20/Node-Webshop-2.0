import type { WebshopCategory } from '../models';
import { ImageUrl } from '../utils/ImageUrl';
import { Presenter } from './Presenter';

export class CategoryPresenter extends Presenter {
    /** Category link of the header menu */
    toMenuItem(category: WebshopCategory) {
        return {
            id: category.id,
            name: this.localized(category.name),
            category_image: ImageUrl.of(category.image, 'categories'),
            category_slug: this.localized(category.slug),
        };
    }
}
