import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import session from 'express-session';
import { appConfig } from './config/app';
import { corsOptions } from './config/cors';
import { env } from './config/env';
import { paths } from './config/paths';
import { sessionOptions } from './config/session';
import { Database } from './database/Database';
import { RequestContext } from './http/RequestContext';
import { Scheduler } from './jobs/Scheduler';
import { CsrfMiddleware } from './middleware/CsrfMiddleware';
import { ErrorMiddleware } from './middleware/ErrorMiddleware';
import { LocaleMiddleware } from './middleware/LocaleMiddleware';
import { ViewLocalsMiddleware } from './middleware/ViewLocalsMiddleware';
import { LayoutViewEngine } from './rendering/LayoutViewEngine';
import { AdminRoutes } from './routes/AdminRoutes';
import { AjaxRoutes } from './routes/AjaxRoutes';
import { PageRoutes } from './routes/PageRoutes';
import { Logger } from './services/Logger';

export class App {
    private readonly server: Express = express();

    constructor(private readonly scheduler = new Scheduler()) {
        this.configureViews();
        this.registerMiddleware();
        this.registerRoutes();
        this.registerErrorHandlers();
    }

    async start(): Promise<void> {
        this.server.listen(env.port, () => console.log(`Server is running on port ${env.port}`));

        try {
            await Database.connect();
        }
        catch (error) {
            // Without database the entry goes into logs/fallback.log and the console
            await Logger.error('Database connection failed', (error as Error).message);
        }

        // After the connection attempt, because the startup jobs need the database
        this.scheduler.start();
    }

    private configureViews(): void {
        if (env.isProduction) {
            this.server.set('trust proxy', 1);
        }

        // EJS with Blade-like layouts: extend(), section(), push(), yieldContent(), stack()
        this.server.engine('ejs', new LayoutViewEngine().render);
        this.server.set('view engine', 'ejs');
        this.server.set('views', paths.views);

        ViewLocalsMiddleware.registerGlobals(this.server);
    }

    /** The order matters: the language and the CSRF token need the session, the CSRF check needs the parsed body */
    private registerMiddleware(): void {
        this.server.use(express.static(paths.files));
        this.server.use(express.static(paths.public));

        // Every log entry written while serving a (non static file) request gets its IP address, user agent and URL
        this.server.use(RequestContext.track);

        this.server.use(cookieParser());
        this.server.use(session(sessionOptions));
        this.server.use(LocaleMiddleware.fromSession);

        // `extended: false` keeps the "name[en]" form fields as flat keys, the admin forms rely on it
        this.server.use(express.json({ limit: appConfig.security.requestBodyLimit }));
        this.server.use(express.urlencoded({ extended: false, limit: appConfig.security.requestBodyLimit }));

        this.server.use(cors(corsOptions));
        this.server.use(CsrfMiddleware.protect);
        this.server.use(ViewLocalsMiddleware.share);
    }

    private registerRoutes(): void {
        this.server.use('/ajax', new AjaxRoutes().build());
        this.server.use('/admin', new AdminRoutes().build());

        this.server.get('/', LocaleMiddleware.redirectToLanguage);
        this.server.use('/:lang', LocaleMiddleware.fromUrl);
        this.server.use('/', new PageRoutes().build());
    }

    private registerErrorHandlers(): void {
        this.server.use(ErrorMiddleware.notFound);
        this.server.use(ErrorMiddleware.handle);
    }
}
