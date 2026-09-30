import rateLimit from 'express-rate-limit';
import { Duration } from '../utils/Duration';
import { appConfig } from './app';

export const loginRateLimit = rateLimit({
    windowMs: Duration.hoursInMilliseconds(1),
    max: appConfig.security.loginAttemptsPerHour,
});
