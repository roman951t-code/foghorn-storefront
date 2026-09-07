'use client';

import dynamic from 'next/dynamic';

// `dynamic(..., { ssr: false })` isn't allowed directly inside a Server
// Component (page.tsx) — Turbopack hard-errors on it. This client wrapper is
// the standard workaround: the dynamic() call itself has to live in a
// Client Component. See page.tsx for why this needs to be lazy at all.
const SubscribeSectionLazy = dynamic(() => import('./SubscribeSection'), { ssr: false });

export default SubscribeSectionLazy;
