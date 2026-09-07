import 'server-only';

// Must match the derivation in proxy.ts exactly, so the nonce Next.js reads
// from the request `content-security-policy` header (set by middleware) is the
// same value we hand to <Script nonce={...}> and <ChakraUIProvider nonce={...}>
// on the render side. Any drift here would re-introduce the "nonce doesn't
// match" console errors this helper is meant to eliminate.
//
// Exposing the nonce as a plain sync function (rather than reading
// x-csp-nonce from headers()) is what lets layouts and pages stay
// prerenderable — headers() would opt them into dynamic rendering.
export function getCspNonce(): string | undefined {
	const deploymentId = process.env.VERCEL_GIT_COMMIT_SHA;
	if (!deploymentId) return undefined;
	return btoa(deploymentId).replace(/[^A-Za-z0-9+/=]/g, '').slice(0, 32);
}
