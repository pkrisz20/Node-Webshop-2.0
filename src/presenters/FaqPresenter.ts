import type { FAQ } from '../models';
import { Presenter } from './Presenter';

export class FaqPresenter extends Presenter {
    toQuestion(faq: FAQ) {
        return {
            question: this.localized(faq.question),
            answer: this.localized(faq.answer),
        };
    }
}
