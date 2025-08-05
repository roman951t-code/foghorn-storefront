import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const query = searchParams.get('q');

	if (!query || query.length < 2) {
		return NextResponse.json([]);
	}

	const products = await prisma.product.findMany({
		where: {
			name: {
				contains: query,
				mode: 'insensitive',
			},
		},
		orderBy: [{ inStock: 'desc' }, { name: 'asc' }],
		select: {
			name: true,
			slug: true,
			inStock: true,
		},
		take: 10,
	});

	const result = products.map((product) => ({
		label: product.name,
		value: product.slug,
	}));

	return NextResponse.json(result);
}
