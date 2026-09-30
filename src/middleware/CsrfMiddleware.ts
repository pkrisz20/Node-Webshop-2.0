import { randomBytes, timingSafeEqual } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

export class InvalidCsrfTokenError extends Error {
    override readonly name = 'InvalidCsrfTokenError';
}

/**
 * CSRF protection with the synchronizer token pattern: one random token per session, stored on the server side.
 * The frontend reads the token from the `csrf-token` meta tag and sends it back in the `X-CSRF-TOKEN` header
 * (the `_csrf` body field is accepted too, but never the query string, because URLs end up in logs).
 */
export class CsrfMiddleware {
    private static readonly HEADER_NAME = 'x-csrf-token';
    private static readonly BODY_FIELD = '_csrf';
    private static readonly SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

    /** Shares the token with the templates and the JSON responses, then validates every state-changing request */
    static protect(req: Request, res: Response, next: NextFunction): void {
        req.session.csrfToken ??= CsrfMiddleware.generateToken();
        res.locals.csrfToken = req.session.csrfToken;

        if (CsrfMiddleware.SAFE_METHODS.has(req.method)) {
            return next();
        }

        CsrfMiddleware.verify(req, res, next);
    }

    /** Explicit check for the GET endpoints which change data (e.g. the delete links of the admin) */
    static verify(req: Request, _res: Response, next: NextFunction): void {
        if (!CsrfMiddleware.hasValidToken(req)) {
            return next(new InvalidCsrfTokenError('Missing or invalid CSRF token'));
        }

        next();
    }

    /** Issues a new token, e.g. after the session was regenerated at login */
    static renewToken(req: Request, res: Response): void {
        req.session.csrfToken = CsrfMiddleware.generateToken();
        res.locals.csrfToken = req.session.csrfToken;
    }

    private static hasValidToken(req: Request): boolean {
        const expectedToken = req.session.csrfToken;
        const submittedToken: unknown = req.get(CsrfMiddleware.HEADER_NAME) ?? req.body?.[CsrfMiddleware.BODY_FIELD];

        if (!expectedToken || typeof submittedToken !== 'string') {
            return false;
        }

        const expected = Buffer.from(expectedToken);
        const submitted = Buffer.from(submittedToken);

        // Constant-time comparison, so the response time does not leak the matching characters
        return expected.length === submitted.length && timingSafeEqual(expected, submitted);
    }

    private static generateToken(): string {
        return randomBytes(32).toString('base64url');
    }
}
