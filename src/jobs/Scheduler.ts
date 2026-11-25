import cron from 'node-cron';
import { ErrorReporter } from '../services/ErrorReporter';
import { Logger } from '../services/Logger';
import { LogCleaner } from './LogCleaner';
import { SitemapGenerator } from './SitemapGenerator';

const EVERY_MONDAY_AT_MIDNIGHT = '0 0 0 * * 1';
const EVERY_DAY_AT_2_AM = '0 0 2 * * *';

/** A job may return a summary, it is saved with the "finished" log entry */
type Job = () => Promise<string | void>;

export class Scheduler {
    constructor(
        private readonly logCleaner = new LogCleaner(),
        private readonly sitemapGenerator = new SitemapGenerator(),
    ) {}

    /**
     * The jobs run only while the server is running, a missed time is not made up for.
     * So the sitemap is generated at startup too, when it is missing or not from today (e.g. after a deploy).
     */
    start(): void {
        cron.schedule(EVERY_MONDAY_AT_MIDNIGHT, () => this.run('Log cleaning', () => this.cleanLogs()));
        cron.schedule(EVERY_DAY_AT_2_AM, () => this.run('Sitemap generating', () => this.sitemapGenerator.generate()));

        void this.generateOutdatedSitemap();
    }

    private async generateOutdatedSitemap(): Promise<void> {
        if (await this.sitemapGenerator.isUpToDate()) {
            return;
        }

        await this.run('Sitemap generating at startup', () => this.sitemapGenerator.generate());
    }

    private async cleanLogs(): Promise<string> {
        const deletedCounts = await this.logCleaner.clean();
        const summary = Object.entries(deletedCounts).map(([type, count]) => `${type}: ${count}`).join(', ');

        return `Deleted entries: ${summary}`;
    }

    private async run(jobName: string, job: Job): Promise<void> {
        try {
            const summary = await job();
            await Logger.info(`${jobName} finished successfully`, summary || null);
        }
        catch (error) {
            await ErrorReporter.report(error);
        }
    }
}
