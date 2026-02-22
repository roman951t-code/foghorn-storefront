import { LoadingSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
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
