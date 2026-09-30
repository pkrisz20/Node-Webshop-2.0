import type { CorsOptions } from 'cors';
import { env } from './env';

const allowedOrigins = [env.appUrl];

if (env.isDebug) {
    allowedOrigins.push('http://127.0.0.1:3000', 'http://localhost:3000');
}

export const corsOptions: CorsOptions = {
    credentials: true,
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
