import dns from 'node:dns/promises';
import net from 'node:net';

export type ServerFetchSafetyResult =
	| { ok: true }
	| {
			ok: false;
			reason:
				| 'invalid-protocol'
				| 'blocked-hostname'
				| 'blocked-address'
				| 'dns-resolution-failed';
	  };

const LOCALHOST_HOSTNAMES = new Set(['localhost']);

const parseIpv4Address = (value: string): number[] | null => {
	const parts = value.split('.');
	if (parts.length !== 4) return null;
	const parsed = parts.map((part) => Number(part));
	if (
		parsed.some(
			(part, index) =>
				!Number.isInteger(part) ||
				part < 0 ||
				part > 255 ||
				!String(parts[index]).match(/^\d{1,3}$/)
		)
	) {
		return null;
	}
	return parsed;
};

const normalizeIpv6Address = (value: string) =>
	value
		.trim()
		.toLowerCase()
		.replace(/^\[|\]$/g, '')
		.split('%')[0];

export const isBlockedServerFetchAddress = (address: string): boolean => {
	const normalized = address.trim().toLowerCase();
	const mappedIpv4 = normalized.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
	const ipv4 = parseIpv4Address(mappedIpv4?.[1] ?? normalized);

	if (ipv4) {
		const [a, b] = ipv4;
		return (
			a === 0 ||
			a === 10 ||
			a === 127 ||
			(a === 100 && b >= 64 && b <= 127) ||
			(a === 169 && b === 254) ||
			(a === 172 && b >= 16 && b <= 31) ||
			(a === 192 && b === 168) ||
			(a === 198 && (b === 18 || b === 19)) ||
			a >= 224
		);
	}

	const ipv6 = normalizeIpv6Address(normalized);
	return (
		ipv6 === '::' ||
		ipv6 === '::1' ||
		ipv6.startsWith('fe80:') ||
		ipv6.startsWith('fc') ||
		ipv6.startsWith('fd')
	);
};

export const isBlockedServerFetchHostname = (hostname: string): boolean => {
	const normalized = hostname.trim().toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
	if (!normalized) return true;
	if (LOCALHOST_HOSTNAMES.has(normalized) || normalized.endsWith('.localhost')) return true;
	if (net.isIP(normalized)) return isBlockedServerFetchAddress(normalized);
	return false;
};

export const verifyServerFetchUrl = async (
	url: URL,
	options: { allowPrivateAddress?: boolean } = {}
): Promise<ServerFetchSafetyResult> => {
	if (url.protocol !== 'http:' && url.protocol !== 'https:') {
		return { ok: false, reason: 'invalid-protocol' };
	}

	if (options.allowPrivateAddress) {
		return { ok: true };
	}

	if (isBlockedServerFetchHostname(url.hostname)) {
		return { ok: false, reason: 'blocked-hostname' };
	}

	if (net.isIP(url.hostname)) {
		return { ok: true };
	}

	try {
		const records = await dns.lookup(url.hostname, { all: true, verbatim: true });
		if (records.length === 0) {
			return { ok: false, reason: 'dns-resolution-failed' };
		}

		if (records.some((record) => isBlockedServerFetchAddress(record.address))) {
			return { ok: false, reason: 'blocked-address' };
		}

		return { ok: true };
	} catch {
		return { ok: false, reason: 'dns-resolution-failed' };
	}
};
