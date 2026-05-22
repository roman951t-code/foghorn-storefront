import { createHash, timingSafeEqual } from 'node:crypto';

const sha256 = (value: string) => createHash('sha256').update(value, 'utf8').digest();

export const timingSafeSecretEquals = (left: string, right: string) =>
	timingSafeEqual(sha256(left), sha256(right));

export const includesTimingSafeSecret = (
	expectedSecrets: readonly string[],
	providedSecret: string,
) => {
	let matched = false;
	for (const expectedSecret of expectedSecrets) {
		matched = timingSafeSecretEquals(expectedSecret, providedSecret) || matched;
	}
	return matched;
};
