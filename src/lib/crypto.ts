import crypto from 'node:crypto';
import { env } from '@/config/env';

if (!env.ENCRYPTION_KEY) {
	throw new Error('ENCRYPTION_KEY is required');
}

const KEY = Buffer.from(env.ENCRYPTION_KEY, 'hex');

const V1_PREFIX = 'v1';
const V1_ALGORITHM = 'aes-256-gcm';
const LEGACY_ALGORITHM = 'aes-256-cbc';

export function encryptPassword(password: string): string {
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv(V1_ALGORITHM, KEY, iv);

	const ciphertext = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();

	return `${V1_PREFIX}:${iv.toString('hex')}:${ciphertext.toString('hex')}:${tag.toString('hex')}`;
}

export function decryptPassword(encrypted: string): string {
	const parts = encrypted.split(':');

	// v1:<ivHex>:<cipherHex>:<tagHex> (AES-256-GCM)
	if (parts.length === 4 && parts[0] === V1_PREFIX) {
		const [, ivHex, cipherHex, tagHex] = parts;
		const iv = Buffer.from(ivHex, 'hex');
		const data = Buffer.from(cipherHex, 'hex');
		const tag = Buffer.from(tagHex, 'hex');

		const decipher = crypto.createDecipheriv(V1_ALGORITHM, KEY, iv);
		decipher.setAuthTag(tag);
		return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
	}

	// Legacy <ivHex>:<cipherHex> (AES-256-CBC)
	if (parts.length === 2) {
		const [ivHex, cipherHex] = parts;
		const iv = Buffer.from(ivHex, 'hex');
		const decipher = crypto.createDecipheriv(LEGACY_ALGORITHM, KEY, iv);

		let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return decrypted;
	}

	throw new Error('Invalid encrypted payload format');
}
