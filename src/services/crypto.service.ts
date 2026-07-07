import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';

let derivedKey: Buffer;
if (!ENCRYPTION_KEY) {
  console.warn('CRITICAL WARNING: ENCRYPTION_KEY is not set in the environment variables! Falling back to unsafe development key.');
  derivedKey = crypto.scryptSync('default-unsafe-dev-key', 'salt', 32);
} else {
  // Hash the key using SHA256 to ensure it is exactly 32 bytes
  derivedKey = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

const ALGORITHM = 'aes-256-gcm';

export class CryptoService {
  /**
   * Encrypts plain text using AES-256-GCM.
   * Returns format: ivHex:authTagHex:encryptedHex
   */
  encrypt(text: string): string {
    if (!text) return text;
    // If it already looks encrypted, don't double-encrypt
    if (text.split(':').length === 3) {
      return text;
    }
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypts encrypted text formatted as: ivHex:authTagHex:encryptedHex
   * If decryption fails or text is not in correct format, returns raw text.
   */
  decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText;
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      // Return as-is if not in the encrypted format
      return encryptedText;
    }
    const [ivHex, authTagHex, encryptedHex] = parts;
    try {
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      // Safe fallback to avoid server crash on old data
      return encryptedText;
    }
  }
}

export const cryptoService = new CryptoService();
