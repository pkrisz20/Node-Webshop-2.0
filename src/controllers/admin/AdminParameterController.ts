import type { Request, Response } from 'express';
import { Database } from '../../database/Database';
import { ApiResponse } from '../../http/ApiResponse';
import { ErrorPage } from '../../http/ErrorPage';
import { FormInput } from '../../http/FormInput';
import { ProductParameter, WebshopParameter } from '../../models';
import { LocalizedField } from '../../utils/LocalizedField';
import { AdminController } from './AdminController';

/** Webshop parameters (filterable product properties) */
export class AdminParameterController extends AdminController {
    readonly index = async (req: Request, res: Response): Promise<void> => {
        const parameters = await WebshopParameter.findAll({ order: [['id', 'DESC']] });

        res.render('admin/webshop-parameters/list', {
            meta: this.meta('Admin webshop params list', 'This is the webshop params list page'),
            webshopParameters: parameters.map(parameter => ({
                id: parameter.id,
                name: LocalizedField.pick(parameter.parameter_name, req.language),
                date: this.lastModified(parameter),
            })),
        });
    };

    readonly create = (_req: Request, res: Response): void => {
        res.render('admin/webshop-parameters/new', {
            meta: this.meta('Új paraméter', 'This is the webshop params upload page'),
        });
    };

    readonly store = async (req: Request, res: Response): Promise<void> => {
        const parameterName = this.parseName(req.body);

        if (!parameterName) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        const parameter = await WebshopParameter.create({ parameter_name: parameterName });

        this.respondSaved(res, `/admin/webshop-params/edit/${parameter.id}`);
    };

    readonly edit = async (req: Request, res: Response): Promise<void> => {
        const parameterId = this.parseId(req.params.parameterId);

        if (!parameterId) {
            return ErrorPage.badRequest(req, res);
        }

        const parameter = await WebshopParameter.findByPk(parameterId);

        if (!parameter) {
            return res.redirect('/admin/webshop-params/new');
        }

        res.render('admin/webshop-parameters/edit', {
            formValues: {
                ...LocalizedField.toFormValues({ parameter_name: parameter.parameter_name }),
                id: parameter.id,
            },
            meta: this.meta('Szerkesztés', 'This is the webshop params edit page'),
        });
    };

    readonly update = async (req: Request, res: Response): Promise<void> => {
        const parameterId = this.parseId(req.params.parameterId);
        const parameterName = this.parseName(req.body);
        const parameter = parameterId && parameterName ? await WebshopParameter.findByPk(parameterId) : null;

        if (!parameter || !parameterName) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        await parameter.update({ parameter_name: parameterName });

        this.respondSaved(res, `/admin/webshop-params/edit/${parameter.id}`);
    };

    /** Deletes the parameter together with its values of every product */
    readonly delete = async (req: Request, res: Response): Promise<void> => {
        const parameterId = this.parseId(req.params.parameterId);

        if (!parameterId) {
            this.respondDeleted(res, 0);
            return;
        }

        const deletedCount = await Database.sequelize.transaction(async transaction => {
            await ProductParameter.destroy({ where: { parameter_id: parameterId }, transaction });
            return WebshopParameter.destroy({ where: { id: parameterId }, transaction });
        });

        this.respondDeleted(res, deletedCount);
    };

    private parseName(body: Record<string, unknown>): string | null {
        const input = new FormInput(body);
        return input.isFilledInEveryLanguage('parameter_name') ? LocalizedField.stringify(input.localized('parameter_name')) : null;
    }
}
