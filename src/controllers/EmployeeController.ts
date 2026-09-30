import type { Request, Response } from 'express';
import { MetaBuilder } from '../http/MetaBuilder';
import type { Language } from '../locales';
import { Employee } from '../models';
import type { SiteConfig } from '../services/SiteConfigService';
import { ImageUrl } from '../utils/ImageUrl';
import { LocalizedField } from '../utils/LocalizedField';
import { Controller } from './Controller';

/** "About us" page with the employees */
export class EmployeeController extends Controller {
    readonly index = async (req: Request, res: Response): Promise<void> => {
        const { language } = req;
        const siteConfig: SiteConfig = res.locals.DB_CONFIG ?? {};
        const employees = await Employee.findAll({ where: { is_active: 1 } });

        res.render('pages/about', {
            employees: employees.map(employee => this.toEmployeeCard(employee, language)),
            pageData: {
                shortDesc: LocalizedField.pick(siteConfig.about_us_short, language),
                longDesc: LocalizedField.pick(siteConfig.about_us_long, language),
            },
            meta: MetaBuilder.page(language, {
                title: req.translate('nav.about'),
                description: req.translate('meta.about_us_description'),
                path: req.translate('slugs.about_us'),
            }),
        });
    };

    private toEmployeeCard(employee: Employee, language: Language) {
        return {
            name: employee.name,
            desc: LocalizedField.pick(employee.description, language),
            image: ImageUrl.of(employee.image, 'employees'),
            position: LocalizedField.pick(employee.position, language),
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
