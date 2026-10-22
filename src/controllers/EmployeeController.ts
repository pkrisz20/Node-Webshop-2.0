import type { Request, Response } from 'express';
import { MetaBuilder } from '../http/MetaBuilder';
import { Employee } from '../models';
import { EmployeePresenter } from '../presenters/EmployeePresenter';
import type { SiteConfig } from '../services/SiteConfigService';
import { LocalizedField } from '../utils/LocalizedField';
import { PublicController } from './PublicController';

/** "About us" page with the employees */
export class EmployeeController extends PublicController {
    readonly index = async (req: Request, res: Response): Promise<void> => {
        const { language } = req;
        const siteConfig: SiteConfig = res.locals.DB_CONFIG ?? {};
        const employees = await Employee.findAll({ where: { is_active: 1 } });
        const employeePresenter = new EmployeePresenter(language);

        res.render('pages/about', {
            employees: employees.map(employee => employeePresenter.toCard(employee)),
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
}
