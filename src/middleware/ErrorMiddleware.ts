import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { ApiResponse } from '../http/ApiResponse';
import { ErrorPage } from '../http/ErrorPage';
import { ErrorReporter } from '../services/ErrorReporter';
import { Logger } from '../services/Logger';
import { Translator } from '../utils/Translator';
import { InvalidCsrfTokenError } from './CsrfMiddleware';

type ErrorPageRenderer = (req: Request, res: Response) => void;

export class ErrorMiddleware {
    static notFound(req: Request, res: Response): void {
        ErrorPage.notFound(req, res);
    }

    /** Central error handler, Express recognizes it by the four parameters */
    static handle(error: unknown, req: Request, res: Response, next: NextFunction): void {
        if (res.headersSent) {
            return next(error);
        }

        if (error instanceof InvalidCsrfTokenError) {
            void Logger.warning('Rejected request', error.message);
            return ErrorMiddleware.respond(req, res, 'errors.forbidden', 'errors.no_permission', ErrorPage.forbidden);
        }

        void ErrorReporter.report(error);
        ErrorMiddleware.respond(req, res, 'errors.server_error', 'errors.common_error', ErrorPage.serverError);
    }

    /** AJAX calls get a JSON error, which the frontend can show in a popup, the pages get an error page */
    private static respond(req: Request, res: Response, titleKey: string, messageKey: string, renderErrorPage: ErrorPageRenderer): void {
        if (!ErrorMiddleware.expectsJson(req)) {
            return renderErrorPage(req, res);
        }

        // The error can happen before the locale middleware ran (e.g. a session store error)
        const language = req.language ?? env.languages.fallback;

        ApiResponse.error(res, {
            title: Translator.translate(titleKey, language),
            message: Translator.translate(messageKey, language),
        });
    }

    private static expectsJson(req: Request): boolean {
        return req.xhr || req.originalUrl.startsWith('/ajax') || req.accepts(['html', 'json']) === 'json';
    }
}
