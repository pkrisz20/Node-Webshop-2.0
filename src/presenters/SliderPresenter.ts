import type { Slider } from '../models';
import { ImageUrl } from '../utils/ImageUrl';
import { Presenter } from './Presenter';

/** Hero slides of the home page */
export class SliderPresenter extends Presenter {
    toHero(slider: Slider) {
        return {
            id: slider.id,
            text: this.localized(slider.title),
            subText: this.localized(slider.subtitle),
            image: ImageUrl.of(slider.image, 'heros'),
            link: this.localized(slider.link),
            button: this.localized(slider.button_text),
            targetPage: slider.target_page ?? '_blank',
        };
    }
}
