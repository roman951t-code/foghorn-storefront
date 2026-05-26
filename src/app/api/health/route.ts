export function GET() {
	return Response.json(
		{
			status: 'ok',
			service: 'storefront',
			timestamp: new Date().toISOString(),
		},
		{
			headers: {
				'Cache-Control': 'no-store',
			},
		},
	);
}
