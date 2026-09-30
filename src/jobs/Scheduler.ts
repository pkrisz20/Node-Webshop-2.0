import cron from 'node-cron';
import { ErrorReporter } from '../services/ErrorReporter';
import { Logger } from '../utils/Logger';
import { LogCleaner } from './LogCleaner';
import { SitemapGenerator } from './SitemapGenerator';

const EVERY_MONDAY_AT_MIDNIGHT = '0 0 0 * * 1';
const EVERY_DAY_AT_2_AM = '0 0 2 * * *';

export class Scheduler {
    constructor(
        private readonly logCleaner = new LogCleaner(),
        private readonly sitemapGenerator = new SitemapGenerator(),
    ) {}

    start(): void {
        cron.schedule(EVERY_MONDAY_AT_MIDNIGHT, () => this.run('Log cleaning', () => this.logCleaner.clean()));
        cron.schedule(EVERY_DAY_AT_2_AM, () => this.run('Sitemap generating', () => this.sitemapGenerator.generate()));
    }

    private async run(jobName: string, job: () => Promise<void>): Promise<void> {
        try {
            await job();
            await Logger.info(`${jobName} finished successfully`);
        }
        catch (error) {
            await ErrorReporter.report(error);
        }
    }
}
