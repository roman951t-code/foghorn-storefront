import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

// Prevent Google from indexing 404 responses as thin content. Also skips
// following links from a not-found body — those links are just the "back to
// home" affordance, which is already discoverable elsewhere.
export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

export default function NotFoundPage() {
	const t = useTranslations('pages');

	return (
		<main
			role='main'
			style={{
				minHeight: '56vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '24px',
			}}
		>
			<section
				aria-labelledby='locale-not-found-title'
				style={{
					maxWidth: '520px',
					width: '100%',
					padding: '24px',
					borderRadius: '12px',
					border: '0.5px solid rgba(148, 163, 184, 0.45)',
					background: 'rgba(148, 163, 184, 0.08)',
				}}
			>
				<h1 id='locale-not-found-title' style={{ margin: 0, fontSize: '24px' }}>
					{t('notFound.title')}
				</h1>
				<p style={{ marginTop: '12px', marginBottom: 0, lineHeight: 1.5 }}>
					<Link
						href='/'
						style={{
							textDecoration: 'underline',
							textUnderlineOffset: '3px',
						}}
					>
						{t('notFound.hint')}
					</Link>
				</p>
			</section>
		</main>
	);
}
