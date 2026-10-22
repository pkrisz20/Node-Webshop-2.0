import type { Employee } from '../models';
import { ImageUrl } from '../utils/ImageUrl';
import { Presenter } from './Presenter';

/** Employee cards of the "About us" page */
export class EmployeePresenter extends Presenter {
    toCard(employee: Employee) {
        return {
            name: employee.name,
            desc: this.localized(employee.description),
            image: ImageUrl.of(employee.image, 'employees'),
            position: this.localized(employee.position),
            contact: {
                facebook: employee.facebook,
                tiktok: employee.tiktok,
                instagram: employee.instagram,
                email: employee.email,
                phone: employee.phone,
            },
        };
    }
}
