import type { RequestHandler } from 'express';
import type { Schema } from 'yup';
import { ApiResponse } from '../http/ApiResponse';

export class ValidationMiddleware {
    /** Validates the request body with a yup schema, invalid data is answered with a JSON error */
    static body(schema: Schema): RequestHandler {
        return (req, res, next) => {
            schema.validate(req.body)
                .then(() => next())
                .catch(() => ApiResponse.fail(res, 'errors.wrong_data'));
        };
    }
}
