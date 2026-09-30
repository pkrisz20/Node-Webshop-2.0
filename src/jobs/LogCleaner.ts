import fs from 'fs/promises';
import path from 'path';
import { paths } from '../config/paths';
import type { LogFile } from '../utils/Logger';

const ROTATED_LOG_FILES: LogFile[] = ['requests.log', 'errors.log'];

export class LogCleaner {
    async clean(): Promise<void> {
        await Promise.all(ROTATED_LOG_FILES.map(fileName => fs.rm(path.join(paths.logs, fileName), { force: true })));
    }
}
