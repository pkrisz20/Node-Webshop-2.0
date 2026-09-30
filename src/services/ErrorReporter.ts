import type { Request } from 'express';
import { ErrorLog } from '../models';
import { Logger } from '../utils/Logger';

export class ErrorReporter {
    /** Writes the error into the log file and the `errors_log` table */
    static async report(error: unknown, req?: Request): Promise<void> {
        const { name, message, stack } = ErrorReporter.normalize(error);
        const origin = req ? `${req.method} ${req.originalUrl}` : 'background job';

        await Logger.error(`${name}: ${message}\nOrigin: ${origin}\n${stack}\n${Logger.SEPARATOR}`);

        try {
            await ErrorLog.create({
                log_name: name,
                log_description: `${message}\nOrigin: ${origin}`,
                log_date: new Date(),
            });
        }
        catch (databaseError) {
            await Logger.error(`The error could not be saved into the database: ${(databaseError as Error).message}\n${Logger.SEPARATOR}`);
        }
    }

    private static normalize(error: unknown): { name: string; message: string; stack: string } {
        if (error instanceof Error) {
            return { name: error.name, message: error.message, stack: error.stack ?? '' };
        }

        return { name: 'UnknownError', message: String(error), stack: '' };
    }
}
