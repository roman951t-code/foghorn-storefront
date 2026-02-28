import type { CSSProperties } from 'react';

const skeletonBlockStyle: CSSProperties = {
	background: 'rgba(148, 163, 184, 0.25)',
	borderRadius: '10px',
};

const skeletonCircleStyle: CSSProperties = {
	...skeletonBlockStyle,
	width: '40px',
	height: '40px',
	borderRadius: '9999px',
};

const skeletonLineStyle: CSSProperties = {
	...skeletonBlockStyle,
	height: '12px',
};

function SkeletonHeader() {
	return (
		<div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
			<div style={skeletonCircleStyle} />
			<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
				<div style={{ ...skeletonLineStyle, width: '100%' }} />
				<div style={{ ...skeletonLineStyle, width: '72%' }} />
			</div>
		</div>
	);
}

export function LoadingPromoSkeleton() {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minWidth: 0, height: '100%' }}>
			<SkeletonHeader />
			<div style={{ ...skeletonBlockStyle, height: '220px', width: '100%', flex: 1 }} />
		</div>
	);
}

export function LoadingSkeleton() {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minWidth: 0, height: '100%' }}>
			<SkeletonHeader />
			<div style={{ ...skeletonBlockStyle, height: '220px', width: '100%' }} />
		</div>
	);
}

export function Loading() {
	return (
		<div
			style={{
				margin: '100px auto 0',
				maxWidth: '1444px',
				paddingInline: '12px',
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: 'column',
				gap: '16px',
			}}
		>
			<LoadingSkeleton />
			<LoadingSkeleton />
		</div>
	);
}
