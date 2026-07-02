// Pre-bundles AdminJS user components during the Render BUILD step.
// At runtime, ADMIN_JS_SKIP_BUNDLE=true tells AdminJS to load the bundle
// from ADMIN_JS_TMP_DIR (.adminjs/) instead of re-running the bundler.
// This avoids the OOM crash on Render's 512 MB free-tier runtime.

const env = process.env as Record<string, string | undefined>;
env.NODE_ENV ??= 'production';

// ADMIN_JS_SKIP_BUNDLE=true is required at runtime (skip re-bundling on
// the 512 MB dyno) but it's typically set as a service-wide env var, so
// it also leaks into the build step. Unsetting it here guarantees the
// bundler actually runs regardless of Render's env-var configuration.
delete env.ADMIN_JS_SKIP_BUNDLE;

// CRITICAL: the output dir must NOT contain any segment starting with a
// dot. AdminJS serves components.bundle.js via Express res.sendFile, which
// delegates to the `send` library with its default dotfiles:'ignore' —
// that returns a hard 404 for ANY path containing a dot-segment (checked
// per-segment on the resolved absolute path). AdminJS's own default
// `.adminjs` therefore 404s in production. A dot-free directory fixes it.
// Runtime must set the SAME value before importing AdminJS so the router's
// COMPONENTS_OUTPUT_PATH points here too.
env.ADMIN_JS_TMP_DIR = 'adminjs-bundle';

// Bundling only compiles React components — no DB connection is opened.
// A stub DATABASE_URL lets prisma.mts's import-time guard pass even when
// the real value isn't wired into the build environment.
env.DATABASE_URL ??= 'postgres://prebundle:prebundle@127.0.0.1:5432/prebundle';

const { default: admin } = await import('../src/admin/admin.mts');
await admin.initialize();

const { statSync, existsSync } = await import('node:fs');
const { resolve } = await import('node:path');
const bundlePath = resolve(process.env.ADMIN_JS_TMP_DIR ?? '.adminjs', 'bundle.js');
if (!existsSync(bundlePath)) {
	console.error(`[admin:bundle] FAILED — expected ${bundlePath} to exist after initialize()`);
	process.exit(1);
}
const { size } = statSync(bundlePath);
if (size < 100_000) {
	console.error(`[admin:bundle] FAILED — ${bundlePath} is suspiciously small (${size} bytes); bundler likely aborted`);
	process.exit(1);
}
console.log(`[admin:bundle] OK — ${bundlePath} (${(size / 1024).toFixed(0)} KB)`);
process.exit(0);
