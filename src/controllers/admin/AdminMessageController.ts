import type { Request, Response } from 'express';
import { ApiResponse } from '../../http/ApiResponse';
import { ErrorPage } from '../../http/ErrorPage';
import { ContactMessage } from '../../models';
import { DateFormatter } from '../../utils/DateFormatter';
import { TextFormatter } from '../../utils/TextFormatter';
import { AdminController } from './AdminController';

/** Messages sent from the contact form */
export class AdminMessageController extends AdminController {
    readonly index = async (req: Request, res: Response): Promise<void> => {
        const pagination = this.pagination(req);

        if (!pagination) {
            return ErrorPage.badRequest(req, res);
        }

        const { rows: messages, count } = await ContactMessage.findAndCountAll({
            attributes: ['id', 'first_name', 'last_name', 'phone', 'city', 'date'],
            order: [['id', 'DESC']],
            limit: pagination.limit,
            offset: pagination.offset,
        });

        res.render('admin/messages/list', {
            meta: this.meta('Admin messages list page', 'This is the messages list page'),
            pageCount: pagination.pageCount(count),
            currentPage: pagination.currentPage,
            paginationLink: 'messages',
            incomingMessages: messages.map(message => ({
                contactId: message.id,
                firstName: message.first_name,
                lastName: message.last_name,
                phone: message.phone,
                city: message.city,
                date: DateFormatter.toAdminDateTime(message.date),
            })),
        });
    };

    readonly details = async (req: Request, res: Response): Promise<void> => {
        const messageId = this.parseId(req.params.messageId);
        const message = messageId ? await ContactMessage.findByPk(messageId, { attributes: ['client_message'] }) : null;

        if (!message) {
            return ApiResponse.fail(res, 'errors.common_error');
        }

        ApiResponse.success(res, {
            htmlResponse: `
                <div class='d-flex flex-column'>
                    <div class='text-start mb-2'>
                        <p class='fs-6 mb-0'><b>Üzenet:</b> ${TextFormatter.escapeHtml(message.client_message)}</p>
                    </div>
                </div>
            `,
        });
    };

    readonly delete = async (req: Request, res: Response): Promise<void> => {
        const messageId = this.parseId(req.params.messageId);
        const deletedCount = messageId ? await ContactMessage.destroy({ where: { id: messageId } }) : 0;

        this.respondDeleted(res, deletedCount);
    };
}
