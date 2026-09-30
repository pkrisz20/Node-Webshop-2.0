import type { NextFunction, Request, Response } from 'express';
import { ErrorPage } from '../http/ErrorPage';

export class AuthMiddleware {
    static requireAdmin(req: Request, res: Response, next: NextFunction): void {
        if (req.session.authenticated !== true) {
            return ErrorPage.unauthorized(req, res);
        }

        next();
    }
}
