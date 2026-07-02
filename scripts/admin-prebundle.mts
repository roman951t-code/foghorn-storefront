// Pre-bundles AdminJS user components during the Render BUILD step.
// At runtime, ADMIN_JS_SKIP_BUNDLE=true tells AdminJS to load the bundle
// from ADMIN_JS_TMP_DIR (.adminjs/) instead of re-running the bundler.
// This avoids the OOM crash on Render's 512 MB free-tier runtime.

process.env.NODE_ENV ??= 'production';

const { default: admin } = await import('../src/admin/admin.mts');
await admin.initialize();
console.log(`AdminJS bundle written to ${process.env.ADMIN_JS_TMP_DIR ?? '.adminjs'}/bundle.js`);
process.exit(0);
