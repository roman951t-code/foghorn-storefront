'use client';

import dynamic from 'next/dynamic';

// Single shared lazy wrapper around Auth (Login/Signup forms, react-hook-form
// + zod schemas) — sidebar/index.tsx, UserActions.tsx, and FeedbackModal.tsx
// all import *this* instead of each calling their own `dynamic(() =>
// import('./Auth'))`. Three independent dynamic() calls to the same module
// produced three near-duplicate chunks (confirmed via build output: three
// ~386KB chunks with identical content), and — since sidebar/index.tsx and
// UserActions.tsx are both part of the persistent header layout mounted on
// every page — Turbopack still preloaded one of those duplicates on every
// page load, largely defeating the point. Routing every usage through one
// dynamic() call site removes that ambiguity: there's only one chunk to
// consider, and it isn't part of any eagerly-rendered tree.
const DynamicAuth = dynamic(() => import('./Auth'), { ssr: false });

export default DynamicAuth;
