import type { Request, Response } from 'express';
import multer from 'multer';
import { ApiResponse } from '../../http/ApiResponse';
import { ImageService, InvalidImageFormatError, type UploadMode } from '../../services/ImageService';
import { ErrorReporter } from '../../services/ErrorReporter';
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

        if (!ImageUrl.isImageFolder(folder) || !recordId || typeof fileSource !== 'string' || !this.isUploadMode(mode)) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        const result = await this.imageService.deleteImage(folder, recordId, fileSource, mode);

        if (result !== 'deleted') {
            return ApiResponse.fail(res, 'errors.file_does_not_exist');
        }

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

            ApiResponse.success(res);
        }
        catch (error) {
            await this.handleUploadError(error, req, res);
        }
    }

    private async handleUploadError(error: unknown, req: Request, res: Response): Promise<void> {
        await ErrorReporter.report(error, req);

        if (error instanceof InvalidImageFormatError) {
            return ApiResponse.error(res, {
                title: req.translate('errors.wrong_image_format'),
                message: req.translate('errors.enabled_image_format', ImageService.ALLOWED_EXTENSIONS),
            });
        }

        // A multer error means a failed upload (e.g. a too large file), anything else happened at the WebP conversion
        const isUploadError = error instanceof multer.MulterError;
        ApiResponse.fail(res, isUploadError ? 'errors.common_error' : 'errors.can_not_generate_webp');
    }

    private isUploadMode(value: unknown): value is UploadMode {
        return value === 'single' || value === 'multiple';
    }
}
