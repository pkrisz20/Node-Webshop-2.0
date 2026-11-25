import fs from 'fs/promises';
import moment from 'moment';
import path from 'path';
import type { CreationAttributes } from 'sequelize';
import { paths } from '../config/paths';
import { RequestContext } from '../http/RequestContext';
import { Log, type LogType } from '../models';

/** Entries which could not be saved into the database (e.g. while it is not available) */
const FALLBACK_FILE = 'fallback.log';

/**
 * A longer value is cut, so an entry can always be saved (the database runs in strict mode).
 * The TEXT columns hold 65 535 bytes, that is at least 16 000 characters with 4 byte characters.
 */
const MAX_LENGTHS = {
    title: 1500,
    description: 16000,
    method: 16,
    url: 2000,
    ipAddress: 45,
    userAgent: 2000,
} as const;

type LogEntry = CreationAttributes<Log>;

/**
 * Writes the log entries into the `logs` table.
 * An entry written while serving a request gets the method, URL, IP address and user agent of the request.
 * Logging must never break the request: the methods never throw, a failed entry goes into `logs/fallback.log`.
 */
export class Logger {
    static info(title: string, description: string | null = null): Promise<void> {
        return Logger.write('info', title, description);
    }

    static warning(title: string, description: string | null = null): Promise<void> {
        return Logger.write('warning', title, description);
    }

    static error(title: string, description: string | null = null): Promise<void> {
        return Logger.write('error', title, description);
    }

    private static async write(type: LogType, title: string, description: string | null): Promise<void> {
        const request = RequestContext.current();
        const entry: LogEntry = {
            log_type: type,
            log_name: Logger.limit(title, MAX_LENGTHS.title),
            log_description: Logger.limit(description, MAX_LENGTHS.description),
            request_method: Logger.limit(request?.method, MAX_LENGTHS.method),
            request_url: Logger.limit(request?.url, MAX_LENGTHS.url),
            ip_address: Logger.limit(request?.ipAddress, MAX_LENGTHS.ipAddress),
            user_agent: Logger.limit(request?.userAgent, MAX_LENGTHS.userAgent),
            log_date: new Date(),
        };

        try {
            await Log.create(entry);
        }
        catch (error) {
            await Logger.writeFallback(entry, error);
        }
    }

    private static async writeFallback(entry: LogEntry, databaseError: unknown): Promise<void> {
        const lines = [
            `Date: ${moment(entry.log_date).format('YYYY.MM.DD HH:mm:ss')}`,
            `Type: ${entry.log_type}`,
            `Title: ${entry.log_name}`,
            entry.log_description,
            entry.request_url ? `Request: ${entry.request_method} ${entry.request_url} (${entry.ip_address}, ${entry.user_agent})` : null,
            `Not saved into the database: ${(databaseError as Error).message}`,
            '-------------------------',
        ];
        const text = `${lines.filter(line => line).join('\n')}\n`;

        console.error(text);

        try {
            await fs.mkdir(paths.logs, { recursive: true });
            await fs.appendFile(path.join(paths.logs, FALLBACK_FILE), text);
        }
        catch (fileError) {
            console.error((fileError as Error).message);
        }
    }

    private static limit(value: string | null | undefined, maxLength: number): string | null {
        if (!value) {
            return null;
        }

        return value.length > maxLength ? value.slice(0, maxLength) : value;
    }
}
