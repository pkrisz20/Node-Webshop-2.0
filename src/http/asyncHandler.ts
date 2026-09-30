import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown;

/** Express 4 does not catch rejected promises, this forwards them to the error middleware */
export function asyncHandler(handler: AsyncRequestHandler): RequestHandler {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}
