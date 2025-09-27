import * as crypto from 'crypto';

export default function shaHash(data:string, salt:string) : string {
    return crypto.createHmac('sha256', salt).update(data).digest('hex');
}
