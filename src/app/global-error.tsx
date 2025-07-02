'use client';
import { useEffect } from 'react';

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error('Global error boundary caught:', error);
	}, [error]);

	return (
		<html>
			<body>
				<h2>⚠️ Something went wrong</h2>
				<p>{error.message}</p>
				<button onClick={() => reset()} style={{ marginTop: '16px' }}>
					🔁 Try again
				</button>
			</body>
		</html>
	);
}
