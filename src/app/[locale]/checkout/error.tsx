'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

type ErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function CheckoutError({ error, reset }: ErrorProps) {
	const t = useTranslations('errors');

	return (
		<section
			aria-labelledby='checkout-error-title'
			style={{
				border: '0.5px solid rgba(148, 163, 184, 0.45)',
				borderRadius: '12px',
				background: 'rgba(148, 163, 184, 0.08)',
				padding: '24px',
				maxWidth: '520px',
			}}
		>
			<h2 id='checkout-error-title' style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
				{t('checkoutUnavailableTitle')}
			</h2>
			<p style={{ marginTop: '12px', marginBottom: 0, lineHeight: 1.55 }}>
				{t('checkoutUnavailableDesc')}
			</p>
			{error?.digest ? (
				<p style={{ marginTop: '10px', marginBottom: 0, opacity: 0.75, fontSize: '16px' }}>
					{t('ref', { value: error.digest })}
				</p>
			) : null}
			<div style={{ display: 'flex', gap: '12px', marginTop: '16px', alignItems: 'center' }}>
				<button
					type='button'
					onClick={reset}
					style={{
						border: 'none',
						borderRadius: '10px',
						padding: '10px 14px',
						fontWeight: 600,
						cursor: 'pointer',
						background: '#3182ce',
						color: '#fff',
					}}
				>
					{t('actions.tryAgain')}
				</button>
				<Link
					href='/'
					style={{
						display: 'inline-block',
						border: '1px solid rgba(148, 163, 184, 0.55)',
						borderRadius: '10px',
						padding: '9px 13px',
						fontWeight: 600,
						textDecoration: 'none',
					}}
				>
					{t('actions.goHome')}
				</Link>
			</div>
		</section>
	);
}
