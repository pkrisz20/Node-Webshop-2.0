import { env } from '../config/env';

/** Upload folders inside the `files` directory, each one belongs to a database table */
export const IMAGE_FOLDERS = ['products', 'blogs', 'galleries', 'heros', 'categories', 'employees'] as const;

export type ImageFolder = typeof IMAGE_FOLDERS[number];

export class ImageUrl {
    static isImageFolder(value: unknown): value is ImageFolder {
        return IMAGE_FOLDERS.includes(value as ImageFolder);
    }

    static of(fileName: string | null | undefined, folder: ImageFolder): string | null {
        return fileName ? `${env.appUrl}/${folder}/${fileName}` : null;
    }

    /** Converts a JSON array column of file names into absolute URLs */
    static listOf(fileNamesJson: string | null | undefined, folder: ImageFolder): string[] {
        return ImageUrl.parseFileNames(fileNamesJson).map(fileName => `${env.appUrl}/${folder}/${fileName}`);
    }

    static parseFileNames(fileNamesJson: string | null | undefined): string[] {
        if (!fileNamesJson) {
            return [];
        }

        try {
            const fileNames: unknown = JSON.parse(fileNamesJson);
            return Array.isArray(fileNames) ? fileNames.filter((name): name is string => typeof name === 'string') : [];
        }
        catch {
            return [];
        }
    }
}
