import { timingSafeEqual } from 'crypto';
import type { Request, Response } from 'express';
import { env } from '../../config/env';
import { ApiResponse } from '../../http/ApiResponse';
import { CsrfMiddleware } from '../../middleware/CsrfMiddleware';
import { Logger } from '../../services/Logger';
import { AdminController } from './AdminController';

/** The title of the successful logins, the migration of the old `logins` table uses it too */
const LOGIN_LOG_TITLE = 'Admin login';
const FAILED_LOGIN_LOG_TITLE = 'Failed admin login';

/** The submitted username and password are never logged (a password typed into the username field would end up in the log) */
export class AuthController extends AdminController {
    readonly login = async (req: Request, res: Response): Promise<void> => {
        const { admin_username: username, admin_password: password } = req.body;

        if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
            await Logger.warning(FAILED_LOGIN_LOG_TITLE, 'Missing username or password');
            return ApiResponse.fail(res, 'errors.unprocessable_data');
        }

        if (!this.credentialMatches(username, env.admin.username) || !this.credentialMatches(password, env.admin.password)) {
            await Logger.warning(FAILED_LOGIN_LOG_TITLE, 'Wrong username or password');
            return ApiResponse.fail(res, 'errors.wrong_data');
        }

        await Logger.info(LOGIN_LOG_TITLE, 'Successful admin login');

        // A new session id and CSRF token after the login prevent session fixation
        await this.regenerateSession(req);
        req.session.authenticated = true;
        CsrfMiddleware.renewToken(req, res);

        ApiResponse.success(res, {
            title: 'Sikeres bejelentkezés',
            message: 'Csak egy pillanat és átirányítjuk!',
            redirect_url: `${env.appUrl}/admin/dashboard`,
        });
    };

    readonly logout = async (req: Request, res: Response): Promise<void> => {
        req.session.authenticated = false;
        await Logger.info('Admin logout');

        ApiResponse.success(res, {
            title: 'Sikeresen kijelentkezett!',
            message: 'Hamarosan átirányítjuk!',
            redirect_url: `${env.appUrl}/admin`,
        });
    };

    /** Constant-time comparison, so the response time does not leak how much of the credential matched */
    private credentialMatches(submitted: string, expected: string): boolean {
        const submittedBuffer = Buffer.from(submitted);
        const expectedBuffer = Buffer.from(expected);

        return expected.length > 0
            && submittedBuffer.length === expectedBuffer.length
            && timingSafeEqual(submittedBuffer, expectedBuffer);
    }

    /** New session id, only the language of the visitor is kept */
    private regenerateSession(req: Request): Promise<void> {
        const { lang } = req.session;

        return new Promise((resolve, reject) => {
            req.session.regenerate(error => {
                if (error) {
                    return reject(error);
                }

                req.session.lang = lang;
                resolve();
            });
        });
    }
}
