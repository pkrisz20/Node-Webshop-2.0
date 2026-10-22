import { spawn } from 'child_process';
import type { Request, Response } from 'express';
import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';
import type { Model, ModelStatic } from 'sequelize';
import { appConfig } from '../config/app';
import { env } from '../config/env';
import { paths } from '../config/paths';
import { Article, Employee, Gallery, Product, Slider, WebshopCategory } from '../models';
import { UniqueId } from '../utils/UniqueId';
import type { ImageFolder } from '../utils/ImageUrl';
import { ImageUrl } from '../utils/ImageUrl';
import { Logger } from '../utils/Logger';

export type UploadMode = 'single' | 'multiple';

export type DeleteImageResult = 'deleted' | 'file_not_found' | 'invalid_path';

interface ImageColumn {
    model: ModelStatic<Model>;
    column: string;
}

/** Database column of the thumbnail (single) image per upload folder */
const THUMBNAIL_COLUMNS: Record<ImageFolder, ImageColumn> = {
    products: { model: Product, column: 'image_thumbnail' },
    heros: { model: Slider, column: 'image' },
    galleries: { model: Gallery, column: 'gallery_thumbnail' },
    employees: { model: Employee, column: 'image' },
    categories: { model: WebshopCategory, column: 'image' },
    blogs: { model: Article, column: 'image_thumbnail' },
};

/** Database column of the image list (multiple images, JSON array) per upload folder */
const GALLERY_COLUMNS: Partial<Record<ImageFolder, ImageColumn>> = {
    products: { model: Product, column: 'images' },
    galleries: { model: Gallery, column: 'gallery_images' },
    blogs: { model: Article, column: 'images' },
};

export class InvalidImageFormatError extends Error {
    override readonly name = 'InvalidImageFormatError';
}

export class ImageService {
    /** e.g. "jpg, jpeg, png" for the error message */
    static readonly ALLOWED_EXTENSIONS_TEXT = appConfig.uploads.allowedImageExtensions.join(', ');
    /** Matches both the file extension and the mime type (image/jpeg, image/png) */
    private static readonly ALLOWED_TYPE_PATTERN = new RegExp(appConfig.uploads.allowedImageExtensions.join('|'));

    static isUploadMode(value: unknown): value is UploadMode {
        return value === 'single' || value === 'multiple';
    }

    static supportsMode(folder: ImageFolder, mode: UploadMode): boolean {
        return mode === 'single' || GALLERY_COLUMNS[folder] !== undefined;
    }

    /** Stores the uploaded file(s) of the request in `files/<folder>` */
    async receiveUpload(req: Request, res: Response, folder: ImageFolder, mode: UploadMode): Promise<Express.Multer.File[]> {
        const uploader = multer({
            storage: multer.diskStorage({
                destination: (_req, _file, callback) => callback(null, path.join(paths.files, folder)),
                filename: (_req, file, callback) => callback(null, `${UniqueId.generate()}-${file.originalname}`),
            }),
            limits: { fileSize: appConfig.uploads.maxImageSizeInBytes },
            fileFilter: (_req, file, callback) => {
                const hasAllowedExtension = ImageService.ALLOWED_TYPE_PATTERN.test(path.extname(file.originalname).toLowerCase());
                const hasAllowedMimeType = ImageService.ALLOWED_TYPE_PATTERN.test(file.mimetype);

                if (hasAllowedExtension && hasAllowedMimeType) {
                    return callback(null, true);
                }

                return callback(new InvalidImageFormatError(`Not allowed image format: ${file.originalname}`));
            },
        });

        const handleUpload = mode === 'single' ? uploader.single('files') : uploader.any();

        await new Promise<void>((resolve, reject) => {
            handleUpload(req, res, error => error ? reject(error) : resolve());
        });

        if (mode === 'single') {
            return req.file ? [req.file] : [];
        }

        return Array.isArray(req.files) ? req.files : [];
    }

    /** Generates a .webp copy next to every uploaded image (requires the `cwebp` command line tool) */
    async generateWebpVersions(files: Express.Multer.File[]): Promise<void> {
        await Promise.all(files.map(file => this.convertToWebp(file.path)));
        await Logger.info(`WebP image generated successfully (${files.length} file).`);
    }

    async attachToRecord(folder: ImageFolder, recordId: number, files: Express.Multer.File[], mode: UploadMode): Promise<void> {
        const fileNames = files.map(file => file.filename);

        if (mode === 'single') {
            const { model, column } = THUMBNAIL_COLUMNS[folder];
            await model.update({ [column]: fileNames[0] }, { where: { id: recordId } });
            return;
        }

        // New images are placed before the already uploaded ones
        await this.updateImageList(folder, recordId, existingFileNames => [...fileNames, ...existingFileNames]);
    }

    /** Deletes the image (and its .webp version) from the disk and removes it from the database record */
    async deleteImage(folder: ImageFolder, recordId: number, imageUrl: string, mode: UploadMode): Promise<DeleteImageResult> {
        const folderPath = path.join(paths.files, folder);
        const filePath = path.resolve(paths.files, `.${imageUrl.replace(env.appUrl, '')}`);

        if (path.dirname(filePath) !== folderPath) {
            return 'invalid_path';
        }

        try {
            await fs.unlink(filePath);
        }
        catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return 'file_not_found';
            }

            throw error;
        }

        await fs.rm(ImageService.webpPathOf(filePath), { force: true });

        const fileName = path.basename(filePath);

        if (mode === 'single') {
            const { model, column } = THUMBNAIL_COLUMNS[folder];
            await model.update({ [column]: null }, { where: { id: recordId } });
        }
        else {
            await this.updateImageList(folder, recordId, existingFileNames => existingFileNames.filter(name => name !== fileName));
        }

        return 'deleted';
    }

    private async updateImageList(folder: ImageFolder, recordId: number, transform: (fileNames: string[]) => string[]): Promise<void> {
        const imageColumn = GALLERY_COLUMNS[folder];

        if (!imageColumn) {
            throw new Error(`The "${folder}" folder does not support multiple images`);
        }

        const { model, column } = imageColumn;
        const record = await model.findByPk(recordId, { attributes: ['id', column] });

        if (!record) {
            return;
        }

        const existingFileNames = ImageUrl.parseFileNames(record.get(column) as string | null);
        await model.update({ [column]: JSON.stringify(transform(existingFileNames)) }, { where: { id: recordId } });
    }

    private convertToWebp(filePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const converter = spawn('cwebp', [filePath, '-o', ImageService.webpPathOf(filePath)]);

            converter.once('error', reject);
            converter.once('close', exitCode => exitCode === 0 ? resolve() : reject(new Error(`cwebp exited with code ${exitCode}`)));
        });
    }

    private static webpPathOf(filePath: string): string {
        return filePath.substring(0, filePath.lastIndexOf('.')) + '.webp';
    }
}
