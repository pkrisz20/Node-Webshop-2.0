import type { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { ApiResponse } from '../../http/ApiResponse';
import { ErrorReporter } from '../../services/ErrorReporter';
import { ImageService, InvalidImageFormatError, type UploadMode } from '../../services/ImageService';
import { Logger } from '../../services/Logger';
import { ImageUrl } from '../../utils/ImageUrl';
import { AdminController } from './AdminController';

/** Image uploads of the admin forms, the `:folder` route parameter is also the name of the database table */
export class ImageController extends AdminController {
    constructor(private readonly imageService = new ImageService()) {
        super();
    }

    readonly uploadSingle = (req: Request, res: Response): Promise<void> => this.upload(req, res, 'single');

    readonly uploadMultiple = (req: Request, res: Response): Promise<void> => this.upload(req, res, 'multiple');

    readonly delete = async (req: Request, res: Response): Promise<void> => {
        const { folder } = req.params;
        const { databaseId, fileSource, fileType } = req.body;
        const recordId = this.parseId(databaseId);
        const mode: unknown = fileType;

        if (!ImageUrl.isImageFolder(folder) || !recordId || typeof fileSource !== 'string' || !ImageService.isUploadMode(mode)) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        const result = await this.imageService.deleteImage(folder, recordId, fileSource, mode);

        if (result !== 'deleted') {
            return ApiResponse.fail(res, 'errors.file_does_not_exist');
        }

        await Logger.info('Admin image deleted', `${folder} #${recordId}: ${path.basename(fileSource)}`);
        ApiResponse.success(res);
    };

    private async upload(req: Request, res: Response, mode: UploadMode): Promise<void> {
        const { folder } = req.params;

        if (!ImageUrl.isImageFolder(folder) || !ImageService.supportsMode(folder, mode)) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        try {
            const files = await this.imageService.receiveUpload(req, res, folder, mode);
            const recordId = this.parseId(req.body.databaseId);

            if (files.length === 0 || !recordId) {
                return ApiResponse.fail(res, 'errors.no_selected_file');
            }

            await this.imageService.generateWebpVersions(files);
            await this.imageService.attachToRecord(folder, recordId, files, mode);

            const fileNames = files.map(file => file.filename).join(', ');
            await Logger.info('Admin images uploaded', `${folder} #${recordId}, ${files.length} file(s) with WebP version: ${fileNames}`);
            ApiResponse.success(res);
        }
        catch (error) {
            await this.handleUploadError(error, req, res);
        }
    }

    /** A rejected file (not allowed format, too large) is a warning, a failed WebP conversion is an error */
    private async handleUploadError(error: unknown, req: Request, res: Response): Promise<void> {
        if (error instanceof InvalidImageFormatError) {
            await Logger.warning('Rejected image upload', error.message);

            return ApiResponse.error(res, {
                title: req.translate('errors.wrong_image_format'),
                message: req.translate('errors.enabled_image_format', ImageService.ALLOWED_EXTENSIONS_TEXT),
            });
        }

        if (error instanceof multer.MulterError) {
            await Logger.warning('Rejected image upload', `${error.code}: ${error.message}`);
            return ApiResponse.fail(res, 'errors.common_error');
        }

        await ErrorReporter.report(error);
        ApiResponse.fail(res, 'errors.can_not_generate_webp');
    }
}
