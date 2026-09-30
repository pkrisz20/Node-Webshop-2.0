import type { Response } from 'express';

export interface ApiPayload {
    title?: string;
    /** The text of the popup, see `ApiResponse.send()` */
    message?: string;
    [key: string]: unknown;
}

/**
 * JSON responses of the AJAX endpoints. Everything the frontend expects in every response is added here:
 * the `status` field (it is read instead of the HTTP status code) and the current CSRF token.
 */
export class ApiResponse {
    static success(res: Response, payload: ApiPayload = {}): void {
        ApiResponse.send(res, 'success', payload);
    }

    static error(res: Response, payload: ApiPayload = {}): void {
        ApiResponse.send(res, 'error', payload);
    }

    /** The most common error: an "Error" title with a translated message */
    static fail(res: Response, messageKey = 'errors.common_error', ...params: Array<string | number>): void {
        const { translate } = res.req;

        ApiResponse.error(res, {
            title: translate('errors.error'),
            message: translate(messageKey, ...params),
        });
    }

    private static send(res: Response, status: 'success' | 'error', { message, ...data }: ApiPayload): void {
        res.status(200).json({
            status,
            ...data,
            // The frontend screens read the text of the popup from different keys
            ...(message !== undefined && { message, content: message, text: message }),
            csrfToken: res.locals.csrfToken,
        });
    }
}
