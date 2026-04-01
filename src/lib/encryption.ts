
// Edge-compatible AES-256-CBC encryption using the Web Crypto API.
// Output format: hexIV:hexEncryptedData — identical to the previous Node.js
// crypto implementation so existing tokens in the DB decrypt correctly.

const ALGORITHM = 'AES-CBC';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';

function toHex(buf: ArrayBuffer | Uint8Array): string {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
    const buf = new ArrayBuffer(hex.length / 2);
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

async function getKey(): Promise<CryptoKey> {
    // Match Node.js Buffer.from(string) behaviour: UTF-8 bytes, first 32 bytes
    const raw = new TextEncoder().encode(ENCRYPTION_KEY);
    const keyBytes = raw.slice(0, 32);
    return crypto.subtle.importKey('raw', keyBytes, { name: ALGORITHM }, false, ['encrypt', 'decrypt']);
}

export async function encrypt(text: string): Promise<string> {
    const iv = new Uint8Array(16);
    crypto.getRandomValues(iv);
    const key = await getKey();
    const encoded = new TextEncoder().encode(text);
    const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encoded);
    return toHex(iv) + ':' + toHex(encrypted);
}

export async function decrypt(text: string): Promise<string> {
    const colonIdx = text.indexOf(':');
    const iv = fromHex(text.substring(0, colonIdx));
    const encrypted = fromHex(text.substring(colonIdx + 1));
    const key = await getKey();
    const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, encrypted);
    return new TextDecoder().decode(decrypted);
}
