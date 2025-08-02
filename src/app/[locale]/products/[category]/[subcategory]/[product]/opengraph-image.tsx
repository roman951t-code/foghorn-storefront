import { ImageResponse } from 'next/og';

export const alt = 'Продукт';
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = 'image/png';

export default function Image({
	params,
}: {
	params: { locale: string; categoryId: string; productId: string };
}) {
	const { categoryId, productId } = params;

	const title = `Категорія: ${categoryId}, Продукт: ${productId}`;

	return new ImageResponse(
		(
			<div
				style={{
					fontSize: 48,
					color: 'black',
					background: 'white',
					width: '100%',
					height: '100%',
					padding: '50px',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<h1>{title}</h1>
				<p>Наш найкращий продукт</p>
			</div>
		),
		{
			...size,
		}
	);
}
