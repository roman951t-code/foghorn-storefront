'use client';

import Error from 'next/error';

export default function NotFound() {
	return (
		<html lang='en'>
			<body>
				<Error statusCode={404} title='Сторінку не знайдено' />
			</body>
		</html>
	);
}
