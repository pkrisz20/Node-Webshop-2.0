import type { Gallery } from '../models';
import { DateFormatter } from '../utils/DateFormatter';
import { ImageUrl } from '../utils/ImageUrl';
import { Presenter } from './Presenter';

export class GalleryPresenter extends Presenter {
    toCard(gallery: Gallery) {
        return {
            id: gallery.id,
            name: this.localized(gallery.gallery_name),
            slug: this.localized(gallery.slug),
            thumbnailImage: ImageUrl.of(gallery.gallery_thumbnail, 'galleries'),
            date: DateFormatter.formatByLanguage(gallery.gallery_date, this.language).toLowerCase(),
        };
    }

    /** Featured gallery block of the home page */
    toFeatured(gallery: Gallery) {
        return {
            id: gallery.id,
            name: this.localized(gallery.gallery_name),
            slug: this.localized(gallery.slug),
            source: ImageUrl.of(gallery.gallery_thumbnail, 'galleries'),
        };
    }

    /** Related galleries of the details page, the slug already contains the id */
    toRelated(gallery: Gallery) {
        return {
            name: this.localized(gallery.gallery_name),
            slug: `${this.localized(gallery.slug)}/${gallery.id}`,
            thumbnailImage: ImageUrl.of(gallery.gallery_thumbnail, 'galleries'),
            date: DateFormatter.formatByLanguage(gallery.gallery_date, this.language),
        };
    }

    toDetails(gallery: Gallery) {
        return {
            id: gallery.id,
            slug: this.localized(gallery.slug),
            thumbImage: ImageUrl.of(gallery.gallery_thumbnail, 'galleries'),
            galleryName: this.localized(gallery.gallery_name),
            description: this.localized(gallery.description),
            galleryImages: ImageUrl.listOf(gallery.gallery_images, 'galleries'),
            date: DateFormatter.formatByLanguage(gallery.gallery_date, this.language),
        };
    }
}
