import { Logger } from './Logger';

export class ErrorReporter {
    /** Logs the error with its stack trace (and the request it happened in, see Logger) */
    static async report(error: unknown): Promise<void> {
        const { name, message, stack } = ErrorReporter.normalize(error);

        await Logger.error(name, stack || `${name}: ${message}`);
    }

    private static normalize(error: unknown): { name: string; message: string; stack: string } {
        if (error instanceof Error) {
            return { name: error.name, message: error.message, stack: error.stack ?? '' };
        }

        return { name: 'UnknownError', message: String(error), stack: '' };
    }
}
