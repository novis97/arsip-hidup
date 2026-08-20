/** Publish memicu build statis Cloudflare Pages. Jeda 1–3 menit (ARCHITECTURE §2.2). */
export const triggerDeploy = async ({ doc, operation }: any) => {
  const hook = process.env.DEPLOY_HOOK_URL;
  if (!hook || operation === 'read') return doc;
  if (doc?._status !== 'published' && !doc?.withdrawalRequested) return doc;
  try {
    await fetch(hook, { method: 'POST' });
  } catch (e) {
    console.error('[deploy] build hook gagal dipanggil:', e);
  }
  return doc;
};
