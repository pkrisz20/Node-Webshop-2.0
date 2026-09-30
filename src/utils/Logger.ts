import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import moment from 'moment';
import { paths } from '../config/paths';

export type LogFile = 'errors.log' | 'messages.log' | 'requests.log';

export class Logger {
    static readonly SEPARATOR = '-------------------------';

    static error(message: string): Promise<void> {
        return Logger.write(message, 'errors.log');
    }

    static info(message: string): Promise<void> {
        return Logger.write(message, 'messages.log');
    }

    /** Appends an entry to the log file, logging must never break the request, so errors are only printed */
    static async write(message: string, fileName: LogFile): Promise<void> {
        const entry = `Date: \t${moment().format('YYYY.MM.DD\tHH:mm:ss')}\nHash: \t${randomUUID()}\n${message}\n`;

        try {
            await fs.mkdir(paths.logs, { recursive: true });
            await fs.appendFile(path.join(paths.logs, fileName), entry);
        }
        catch (error) {
            console.error((error as Error).message);
        }
    }
}
