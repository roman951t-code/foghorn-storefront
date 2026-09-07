import { prisma } from '../prisma.mts';

export async function archiveProductAndZeroStock(productId: string) {
	return prisma.$transaction(async (tx) => {
		await tx.productVariant.updateMany({
			where: { productId },
			data: { stock: 0 },
		});

		await tx.product.update({
			where: { id: productId },
			data: {
				status: 'ARCHIVED',
				stock: 0,
				inStock: false,
			},
		});
	});
}

