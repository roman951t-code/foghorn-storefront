import { execSync } from 'node:child_process';

function run(cmd: string) {
	return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' });
}

function containsAny(haystack: string, needles: string[]) {
	const normalized = haystack.toLowerCase();
	return needles.some((n) => normalized.includes(n.toLowerCase()));
}

function main() {
	console.log('🧩 Checking Prisma migration status...');
	let statusOutput = '';
	try {
		statusOutput = run('npx prisma migrate status');
		console.log(statusOutput);
	} catch (e) {
		// prisma migrate status can exit non-zero when drift is present; still use whatever output exists
		statusOutput = (e as Error & { stdout?: string; stderr?: string })?.stdout ?? '';
		const stderr = (e as Error & { stdout?: string; stderr?: string })?.stderr ?? '';
		statusOutput += `\n${stderr}`;
		console.log(statusOutput);
	}

	const shouldReset = containsAny(statusOutput, [
		'drift detected',
		'needs to be reset',
		'missing from the local migrations directory',
		'applied to the database but missing from the local migrations directory',
		'migrations are applied to the database but missing',
	]);

	if (shouldReset) {
		console.log('♻️ Drift/missing migration detected. Resetting local dev database...');
		// Local-only: we accept data loss for stable setup.
		execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
	} else {
		console.log('✅ No drift/missing-migration signals detected. Skipping reset.');
	}

	console.log('⬆️ Applying migrations from local directory (deploy mode)...');
	execSync('npx prisma migrate deploy', { stdio: 'inherit' });

	console.log('🌱 Running Prisma seed...');
	execSync('npx prisma db seed', { stdio: 'inherit' });
}

main();
