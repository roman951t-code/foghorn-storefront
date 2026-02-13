import 'dotenv/config';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const SECRET = process.env.CACHE_REVALIDATE_SECRET;

const usage = () => {
	console.error(
		'Usage: tsx scripts/revalidate-window-boundaries.ts [--lookback=180] [--limit=500] [--dry-run]'
	);
};

const parseArgs = () => {
	let lookbackSeconds: number | null = null;
	let limit: number | null = null;
	let dryRun = false;

	for (const arg of process.argv.slice(2)) {
		if (arg === '--dry-run') {
			dryRun = true;
			continue;
		}
		if (arg.startsWith('--lookback=')) {
			const value = Number.parseInt(arg.slice('--lookback='.length), 10);
			if (!Number.isFinite(value) || value <= 0) {
				usage();
				process.exit(1);
			}
			lookbackSeconds = value;
			continue;
		}
		if (arg.startsWith('--limit=')) {
			const value = Number.parseInt(arg.slice('--limit='.length), 10);
			if (!Number.isFinite(value) || value <= 0) {
				usage();
				process.exit(1);
			}
			limit = value;
			continue;
		}
		usage();
		process.exit(1);
	}

	return { lookbackSeconds, limit, dryRun };
};

const main = async () => {
	if (!SECRET) {
		console.error('Missing CACHE_REVALIDATE_SECRET in environment');
		process.exit(1);
	}

	const args = parseArgs();
	const url = new URL('/api/cache/revalidate/windows', APP_URL);
	if (args.lookbackSeconds != null) {
		url.searchParams.set('lookbackSeconds', String(args.lookbackSeconds));
	}
	if (args.limit != null) {
		url.searchParams.set('limit', String(args.limit));
	}
	if (args.dryRun) {
		url.searchParams.set('dryRun', 'true');
	}

	const response = await fetch(url, {
		method: 'POST',
		headers: { 'x-revalidate-secret': SECRET },
	});

	const body = await response.text();
	if (!response.ok) {
		console.error(`Window revalidation failed: ${response.status}`);
		console.error(body);
		process.exit(1);
	}

	console.log(body);
};

main().catch((error) => {
	console.error('Window revalidation script failed', error);
	process.exit(1);
});
