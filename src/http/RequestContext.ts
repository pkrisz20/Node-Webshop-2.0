import { AsyncLocalStorage } from 'async_hooks';
import type { NextFunction, Request, Response } from 'express';
import requestIp from 'request-ip';

export interface RequestDetails {
    method: string;
    url: string;
    ipAddress: string | null;
    userAgent: string | null;
}

/**
 * The details of the request being served, readable from any code it calls (even without the `req` object),
 * e.g. the `Logger` saves them with every log entry.
 * Outside of a request (background jobs) there is no current request.
 */
export class RequestContext {
    private static readonly storage = new AsyncLocalStorage<RequestDetails>();

    /** Middleware: the rest of the request runs in the context of the request */
    static track(req: Request, _res: Response, next: NextFunction): void {
        RequestContext.storage.run(RequestContext.describe(req), next);
    }

    static current(): RequestDetails | null {
        return RequestContext.storage.getStore() ?? null;
    }

    static describe(req: Request): RequestDetails {
        return {
            method: req.method,
            url: req.originalUrl,
            ipAddress: requestIp.getClientIp(req),
            userAgent: req.get('user-agent') ?? null,
        };
    }
}
