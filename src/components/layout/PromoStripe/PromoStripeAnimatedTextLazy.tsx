'use client';

import dynamic from 'next/dynamic';

// `dynamic(..., { ssr: false })` isn't allowed directly inside a Server
// Component (index.tsx, which needs to stay server-side to fetch
// translations via getTranslations) — Turbopack hard-errors on it. This
// client wrapper is the standard workaround: the dynamic() call itself has
// to live in a Client Component. Same pattern as SubscribeSectionLazy.tsx.
const PromoStripeAnimatedTextLazy = dynamic(() => import('./PromoStripeAnimatedText'), {
	ssr: false,
	loading: () => null,
});

export default PromoStripeAnimatedTextLazy;
