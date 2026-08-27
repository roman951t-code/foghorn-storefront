import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/constants/site';
import { getTranslations } from 'next-intl/server';
import { resolveAppLocale } from '@/constants/locales';

export const size = {
	width: 1200,
	height: 630,
};

export const contentType = 'image/png';

export default async function OpenGraphImage({ params }: { params: { locale: string } }) {
	const { locale } = await params;
	const resolvedLocale = resolveAppLocale(locale);
	const pagesT = await getTranslations({ locale: resolvedLocale, namespace: 'pages' });

	const title = pagesT('metadata.main.title');
	const description = pagesT('metadata.main.description');

	return new ImageResponse(
		<div
			style={{
				height: '100%',
				width: '100%',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
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
					<span>{SITE_NAME}</span>
				</div>

				<div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '900px' }}>
					<h1
						style={{
							margin: 0,
							fontSize: '68px',
							lineHeight: 1.05,
							letterSpacing: '-0.02em',
							fontWeight: 800,
							textShadow: '0 10px 30px rgba(0,0,0,0.35)',
						}}
					>
						{title}
					</h1>
					<p
						style={{
							margin: 0,
							fontSize: '28px',
							lineHeight: 1.4,
							color: '#cbd5e1',
							maxWidth: '820px',
						}}
					>
						{description}
					</p>
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
					<span style={{ fontWeight: 700, color: '#e2e8f0' }}>{resolvedLocale.toUpperCase()}</span>
				</div>
			</div>
		</div>,
		{
			...size,
			// No DB dependency (title/description are bundled translations, only
			// change on deploy) and only 2 locale variants — long, CDN-cacheable.
			headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800' },
		},
	);
}
