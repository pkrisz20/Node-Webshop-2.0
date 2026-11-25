import type { Request, Response } from 'express';
import { env } from '../config/env';
import { ApiResponse } from '../http/ApiResponse';
import { MetaBuilder } from '../http/MetaBuilder';
import { ContactMessage } from '../models';
import { Logger } from '../services/Logger';
import { PublicController } from './PublicController';

export class ContactController extends PublicController {
    readonly show = (req: Request, res: Response): void => {
        res.render('pages/contact', {
            meta: MetaBuilder.page(req.language, {
                title: req.translate('nav.contact'),
                description: req.translate('meta.contact_description'),
                path: req.translate('slugs.contact'),
            }),
        });
    };

    // TODO: e-mail notification to the admin (see the git history of controllers/ContactController.js)
    readonly store = async (req: Request, res: Response): Promise<void> => {
        const { firstName, lastName, email, phone, city, comment } = req.body;

        const message = await ContactMessage.create({
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            city,
            client_message: comment,
            date: new Date(),
        });

        // Only the id: the personal data of the sender stays in the message
        await Logger.info('Contact message received', `Message #${message.id}`);

        ApiResponse.success(res, {
            title: req.translate('general.process_success'),
            message: req.translate('general.contact_email_success_message'),
            redirect_url: `${env.appUrl}/${req.language}/${req.translate('slugs.contact')}`,
        });
    };
}
