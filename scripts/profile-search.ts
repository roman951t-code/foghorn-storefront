import { performance } from 'node:perf_hooks';
import { getProductsBySearchQuery } from '@/actions/products/getProductsBySearchQuery';
import { prisma } from '@/lib/prisma';

const [queryArg, iterationsArg] = process.argv.slice(2);
const query = (queryArg ?? '').toString();
const iterations = Math.max(1, Number.parseInt(iterationsArg ?? '3', 10));

async function main() {
	const timings: number[] = [];

	for (let i = 0; i < iterations; i += 1) {
		const start = performance.now();
		await getProductsBySearchQuery(query, 20, 0);
		timings.push(performance.now() - start);
	}

	const avg = timings.reduce((sum, t) => sum + t, 0) / timings.length;
	const min = Math.min(...timings);
	const max = Math.max(...timings);

	console.log(
		`Profiled ${iterations} search runs for "${query || '<empty>'}" -> avg ${avg.toFixed(
			2
		)}ms (min ${min.toFixed(2)}ms, max ${max.toFixed(2)}ms)`
	);
}

main()
	.catch((err) => {
		console.error('Profiling failed', err);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
