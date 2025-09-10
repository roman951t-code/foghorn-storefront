const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export function encryptPassword(password: string): string {
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

	let encrypted = cipher.update(password, 'utf8', 'hex');
	encrypted += cipher.final('hex');

	return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptPassword(encrypted: string): string {
	const [ivHex, data] = encrypted.split(':');
	const iv = Buffer.from(ivHex, 'hex');

	const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

	let decrypted = decipher.update(data, 'hex', 'utf8');
	decrypted += decipher.final('utf8');

	return decrypted;
}
