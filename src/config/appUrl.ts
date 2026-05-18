const LOCAL_APP_URL = 'http://localhost:3000';

const normalizeOptionalString = (value: string | undefined | null) => {
	if (typeof value !== 'string') return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
};

export const normalizeAppUrl = (raw: string | undefined | null): string | null => {
	const normalized = normalizeOptionalString(raw);
	if (!normalized) return null;
	try {
		const parsed = new URL(normalized);
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
		return parsed.origin;
	} catch {
		return null;
	}
};

export const normalizeHost = (raw: string | undefined | null): string | null => {
	const normalized = normalizeOptionalString(raw);
	if (!normalized) return null;
	try {
		const parsed = normalized.includes('://') ? new URL(normalized) : new URL(`https://${normalized}`);
		return parsed.host.toLowerCase();
	} catch {
		return null;
	}
};

const toHttpsOriginFromHost = (raw: string | undefined | null) => {
	const host = normalizeHost(raw);
	return host ? normalizeAppUrl(`https://${host}`) : null;
};

const resolvePublicVercelDeploymentOrigin = (env: Record<string, string | undefined>) => {
	const vercelEnv = normalizeOptionalString(env.NEXT_PUBLIC_VERCEL_ENV)?.toLowerCase();
	const previewOrigin =
		toHttpsOriginFromHost(env.NEXT_PUBLIC_VERCEL_BRANCH_URL) ??
		toHttpsOriginFromHost(env.NEXT_PUBLIC_VERCEL_URL);
	const productionOrigin =
		toHttpsOriginFromHost(env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) ??
		toHttpsOriginFromHost(env.NEXT_PUBLIC_VERCEL_URL);

	if (vercelEnv === 'preview') return previewOrigin ?? productionOrigin;
	if (vercelEnv === 'production') return productionOrigin;
	return previewOrigin ?? productionOrigin;
};

const resolveServerVercelDeploymentOrigin = (env: Record<string, string | undefined>) => {
	const vercelEnv =
		normalizeOptionalString(env.VERCEL_ENV)?.toLowerCase() ??
		normalizeOptionalString(env.NEXT_PUBLIC_VERCEL_ENV)?.toLowerCase();
	const previewOrigin =
		toHttpsOriginFromHost(env.VERCEL_BRANCH_URL) ??
		toHttpsOriginFromHost(env.VERCEL_URL) ??
		resolvePublicVercelDeploymentOrigin(env);
	const productionOrigin =
		toHttpsOriginFromHost(env.VERCEL_PROJECT_PRODUCTION_URL) ??
		toHttpsOriginFromHost(env.VERCEL_URL) ??
		resolvePublicVercelDeploymentOrigin(env);

	if (vercelEnv === 'preview') return previewOrigin ?? productionOrigin;
	if (vercelEnv === 'production') return productionOrigin;
	return previewOrigin ?? productionOrigin;
};

export const resolveAppUrlFromEnv = ({
	env,
	publicOnly = false,
}: {
	env: Record<string, string | undefined>;
	publicOnly?: boolean;
}) =>
	normalizeAppUrl(env.NEXT_PUBLIC_APP_URL) ??
	(publicOnly
		? resolvePublicVercelDeploymentOrigin(env)
		: resolveServerVercelDeploymentOrigin(env)) ??
	LOCAL_APP_URL;

export const resolveAllowedAppHosts = ({
	env,
}: {
	env: Record<string, string | undefined>;
}) => {
	const hosts = new Set<string>();
	const addHost = (value: string | undefined | null) => {
		const host = normalizeHost(value);
		if (host) hosts.add(host);
	};

	if (env.NODE_ENV !== 'production') {
		hosts.add('localhost:3000');
		hosts.add('127.0.0.1:3000');
	}

	addHost(resolveAppUrlFromEnv({ env }));
	addHost(env.NEXT_PUBLIC_APP_URL);
	addHost(env.NEXT_PUBLIC_VERCEL_URL);
	addHost(env.NEXT_PUBLIC_VERCEL_BRANCH_URL);
	addHost(env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL);
	addHost(env.VERCEL_URL);
	addHost(env.VERCEL_BRANCH_URL);
	addHost(env.VERCEL_PROJECT_PRODUCTION_URL);

	for (const rawHost of (env.ALLOWED_APP_HOSTS ?? '').split(',')) {
		addHost(rawHost);
	}

	return Array.from(hosts);
};

export const DEFAULT_LOCAL_APP_URL = LOCAL_APP_URL;
