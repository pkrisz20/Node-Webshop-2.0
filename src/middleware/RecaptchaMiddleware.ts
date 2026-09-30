import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import requestIp from 'request-ip';
import { appConfig } from '../config/app';
import { env } from '../config/env';
import { ApiResponse } from '../http/ApiResponse';

interface RecaptchaVerification {
    success: boolean;
    score?: number;
}

/** Google reCAPTCHA v3 check of the form submissions (currently not attached to any route) */
export class RecaptchaMiddleware {
    private static readonly VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

    static async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
        const token: unknown = req.body?.recaptcha;

        if (typeof token !== 'string' || token.length === 0) {
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        try {
            const { data } = await axios.post<RecaptchaVerification>(RecaptchaMiddleware.VERIFY_URL, null, {
                params: {
                    secret: env.recaptchaSecretKey,
                    response: token,
                    remoteip: requestIp.getClientIp(req) ?? undefined,
                },
            });

            if (data.success && (data.score ?? 0) > appConfig.security.recaptchaMinScore) {
                return next();
            }

            ApiResponse.fail(res, 'errors.no_permission');
        }
        catch {
            ApiResponse.error(res, {
                title: req.translate('errors.server_error'),
                message: req.translate('errors.common_error'),
            });
        }
    }
}
