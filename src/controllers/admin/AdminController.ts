import type { Request, Response } from 'express';
import { appConfig } from '../../config/app';
import { ApiResponse } from '../../http/ApiResponse';
import { MetaBuilder, type AdminMeta } from '../../http/MetaBuilder';
import { Logger } from '../../services/Logger';
import { DateFormatter } from '../../utils/DateFormatter';
import { Pagination } from '../../utils/Pagination';
import { Controller } from '../Controller';

interface Timestamped {
    created_at: Date | null;
    updated_at: Date | null;
}

/**
 * Base class of the admin controllers.
 * The admin language is set on the request by the admin routes (`req.language`, `req.translate()`).
 */
export abstract class AdminController extends Controller {
    protected meta(title: string, description = ''): AdminMeta {
        return MetaBuilder.admin(title, description);
    }

    protected pagination(req: Request): Pagination | null {
        return Pagination.fromQuery(req.query, appConfig.pagination.adminPerPage);
    }

    /** Green check or red cross icon of the admin lists */
    protected activityIcon(isActive: unknown): string {
        return isActive
            ? '<i class="fas fa-check-circle link-success fs-5"></i>'
            : '<i class="fas fa-times-circle link-danger fs-5"></i>';
    }

    /** Formatted date of the last modification (or the creation) of a record */
    protected lastModified(record: Timestamped): string {
        return DateFormatter.toAdminDateTime(record.updated_at ?? record.created_at);
    }

    /**
     * The admin forms navigate to the returned URL after a successful save.
     * The save is logged, the URL of the request tells which form was saved, the redirect URL tells the saved record.
     */
    protected respondSaved(res: Response, redirectUrl: string): void {
        const action = res.req.originalUrl.includes('/new/') ? 'created' : 'updated';

        void Logger.info(`Admin record ${action}`, redirectUrl);
        ApiResponse.success(res, { redirect_url: redirectUrl });
    }

    /** The deletion is logged, the URL of the request tells the deleted record */
    protected respondDeleted(res: Response, deletedCount: number): void {
        if (deletedCount > 0) {
            void Logger.info('Admin record deleted', `${deletedCount} record(s)`);
            return ApiResponse.success(res);
        }

        ApiResponse.fail(res);
    }
}
