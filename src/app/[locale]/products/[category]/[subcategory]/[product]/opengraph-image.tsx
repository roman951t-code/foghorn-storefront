import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/constants/site';
import { getProductBySlugCached } from '@/actions/products/getProductBySlug';
import { resolveAppLocale } from '@/constants/locales';

export const alt = 'Product';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// The old version hard-coded Ukrainian text and referenced params that don't
// exist on this route (`categoryId`/`productId` instead of `product`), so every
// product share was serving the generic locale-root fallback OG image. This
// pulls the real product data through the same cached loader the page uses,
// so social crawlers see title + price per product.
export default async function ProductOgImage({
	params,
}: {
	params: Promise<{ locale: string; category: string; subcategory: string; product: string }>;
}) {
	const { product, locale } = await params;
	const resolvedLocale = resolveAppLocale(locale);
	const productData = await getProductBySlugCached(product, resolvedLocale);

	const title = productData?.name ?? 'Product';
	const priceValue =
		productData?.discountPrice ?? productData?.basePrice ?? null;
	const priceLabel =
		priceValue != null ? `$${Number(priceValue).toFixed(2)}` : null;
	const brandName = productData?.brand?.name ?? SITE_NAME;
	const subcategoryName = productData?.subcategoryName ?? '';

	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					background: 'radial-gradient(circle at 15% 20%, #1b2d4f 0, #0b1023 42%, #050814 100%)',
					color: '#e2e8f0',
					fontFamily: 'Inter, "Noto Sans", "Segoe UI", sans-serif',
					padding: '64px',
				}}
			>
				<div
					style={{
						width: '100%',
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
						borderWidth: '0.5px',
						borderStyle: 'solid',
						borderColor: 'rgba(255,255,255,0.12)',
						borderRadius: '32px',
						padding: '48px',
						background:
							'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%)',
						boxShadow: '0 25px 70px rgba(0,0,0,0.45)',
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '12px',
							padding: '10px 16px',
							borderRadius: '9999px',
							background: 'rgba(255,255,255,0.08)',
							fontSize: '18px',
							fontWeight: 700,
							letterSpacing: '0.05em',
							textTransform: 'uppercase',
							alignSelf: 'flex-start',
						}}
					>
						<span
							style={{
								width: '12px',
								height: '12px',
								borderRadius: '50%',
								background: '#22c55e',
								boxShadow: '0 0 0 8px rgba(34,197,94,0.22)',
							}}
						/>
						<span>{brandName}</span>
						{subcategoryName ? (
							<>
								<span style={{ opacity: 0.4 }}>•</span>
								<span style={{ fontWeight: 500, letterSpacing: '0.02em', textTransform: 'none' }}>
									{subcategoryName}
								</span>
							</>
						) : null}
					</div>

					<div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
						<h1
							style={{
								margin: 0,
								fontSize: '72px',
								lineHeight: 1.05,
								letterSpacing: '-0.02em',
								fontWeight: 800,
								maxWidth: '1000px',
								textShadow: '0 10px 30px rgba(0,0,0,0.35)',
							}}
						>
							{title}
						</h1>
						{priceLabel ? (
							<div
								style={{
									display: 'flex',
									alignItems: 'baseline',
									gap: '16px',
									fontSize: '48px',
									fontWeight: 700,
									color: '#22c55e',
								}}
							>
								{priceLabel}
							</div>
						) : null}
					</div>

					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							gap: '16px',
							fontSize: '20px',
							color: '#94a3b8',
						}}
					>
						<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
							<div
								style={{
									width: '36px',
									height: '36px',
									borderRadius: '12px',
									background: '#22c55e',
								}}
							/>
							<span>Quality products • Fast delivery • Secure checkout</span>
						</div>
						<span style={{ fontWeight: 700, color: '#e2e8f0' }}>
							{resolvedLocale.toUpperCase()}
						</span>
					</div>
				</div>
			</div>
		),
		{
			...size,
			// This route regenerates the PNG on every request regardless of
			// getProductBySlugCached's own cache (that only covers the DB fetch,
			// not the Satori/Resvg render below it) — an explicit Cache-Control
			// is what actually keeps repeat crawler hits off the render path.
			// Matches getProductBySlugCached's own cacheLife('hours').
			headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' },
		},
	);
}
