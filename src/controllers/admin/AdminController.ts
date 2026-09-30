import type { Request, Response } from 'express';
import { appConfig } from '../../config/app';
import { ApiResponse } from '../../http/ApiResponse';
import { MetaBuilder, type AdminMeta } from '../../http/MetaBuilder';
import { DateFormatter } from '../../utils/DateFormatter';
import { NumberParser } from '../../utils/NumberParser';
import { Pagination } from '../../utils/Pagination';

interface Timestamped {
    created_at: Date | null;
    updated_at: Date | null;
}

/**
 * Base class of the admin controllers.
 * The admin language is set on the request by the admin routes (`req.language`, `req.translate()`).
 */
export abstract class AdminController {
    protected meta(title: string, description = ''): AdminMeta {
        return MetaBuilder.admin(title, description);
    }

    protected pagination(req: Request): Pagination | null {
        return Pagination.fromQuery(req.query, appConfig.pagination.adminPerPage);
    }

    protected parseId(value: unknown): number | null {
        return NumberParser.positiveInteger(value);
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

    /** The admin forms navigate to the returned URL after a successful save */
    protected respondSaved(res: Response, redirectUrl: string): void {
        ApiResponse.success(res, { redirect_url: redirectUrl });
    }

    protected respondDeleted(res: Response, deletedCount: number): void {
        if (deletedCount > 0) {
            return ApiResponse.success(res);
        }

        ApiResponse.fail(res);
    }
}
