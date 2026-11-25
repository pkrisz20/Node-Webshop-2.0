import rateLimit, { type RateLimitInfo } from 'express-rate-limit';
import { Logger } from '../services/Logger';
import { Duration } from '../utils/Duration';
import { appConfig } from './app';

export const loginRateLimit = rateLimit({
    windowMs: Duration.hoursInMilliseconds(1),
    limit: appConfig.security.loginAttemptsPerHour,
    handler: (req, res, _next, options) => {
        // The limiter stores the counters on the request (`rateLimit` is the default property name)
        const { used, limit } = (req as typeof req & { rateLimit: RateLimitInfo }).rateLimit;

        // Only the first rejected attempt of the time window is logged, so an attack can not flood the log
        if (used === limit + 1) {
            void Logger.warning('Too many admin login attempts', `More than ${limit} attempts within an hour, the next ones are rejected`);
        }

        res.status(options.statusCode).send(options.message);
    },
});
