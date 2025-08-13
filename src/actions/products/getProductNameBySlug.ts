import { prisma } from '@/lib/prisma';

export async function getProductNameBySlug(slug: string) {
	const product = await prisma.product.findUnique({
		where: { slug },
		select: { name: true },
	});
	return product;
}
