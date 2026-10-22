import { randomBytes } from 'crypto';

export class UniqueId {
    /** Short random identifier, used for order ids and uploaded file names */
    static generate(): string {
        return randomBytes(6).toString('hex') + Date.now().toString(36);
    }
}
