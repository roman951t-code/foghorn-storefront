'use client';

import { TypeAnimation } from 'react-type-animation';

const PHRASE_DISPLAY_MS = 2200;

export default function PromoStripeAnimatedText({ phrases }: { phrases: string[] }) {
	const sequence = phrases.flatMap((phrase) => [phrase, PHRASE_DISPLAY_MS]);

	return (
		<TypeAnimation
			sequence={sequence}
			wrapper='span'
			speed={55}
			deletionSpeed={65}
			repeat={Infinity}
			cursor
			style={{ display: 'inline-block' }}
		/>
	);
}
