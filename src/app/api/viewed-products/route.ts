import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getRecentlyViewedProducts } from '@/actions/products/getRecentlyViewedProducts';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const limitParam = url.searchParams.get('limit');
		const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

		const session = await auth.api.getSession({ headers: await headers() });
		const userId = session?.user?.id;

		if (!userId) {
			return NextResponse.json({ products: [] }, { status: 200 });
		}

		const products = await getRecentlyViewedProducts(userId, limit);
		return NextResponse.json({ products }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ products: [] }, { status: 500 });
	}
}
