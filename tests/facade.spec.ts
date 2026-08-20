import { test, expect } from '@playwright/test';

/**
 * Gate CI. DEVOPS §4 — regresi jenis ini mustahil terdeteksi lewat review mata
 * dan pasti terjadi kalau tidak diotomatiskan.
 */
const DOMAIN_GOOGLE = /youtube\.com|ytimg\.com|googlevideo\.com|doubleclick\.net|google-analytics\.com|gstatic\.com/;
const HALAMAN = '/koleksi/batik-tulis-pekalongan/seed-ratmi-01';

test('nol request ke domain Google sebelum klik Play (RULES V-4)', async ({ page }) => {
  const terlarang: string[] = [];
  page.on('request', (r) => { if (DOMAIN_GOOGLE.test(r.url())) terlarang.push(r.url()); });

  await page.goto(HALAMAN, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  expect(terlarang, `Façade bocor. Request ke Google sebelum Play:\n${terlarang.join('\n')}`).toEqual([]);
});

test('thumbnail dilayani dari CDN sendiri, bukan ytimg (RULES V-5)', async ({ page }) => {
  await page.goto(HALAMAN);
  const src = await page.locator('.arsip-player__frame img').first().getAttribute('src');
  expect(src).not.toMatch(/ytimg\.com/);
  expect(src).toMatch(/cdn\.arsiphidup\.id|^\//);
});

test('iframe memakai youtube-nocookie dan sandbox tanpa allow-popups (RULES V-6)', async ({ page }) => {
  await page.goto(HALAMAN);
  await page.locator('.arsip-player__play').click();
  const iframe = page.locator('.arsip-player__iframe-host iframe');
  await expect(iframe).toHaveAttribute('src', /youtube-nocookie\.com/);
  const sandbox = await iframe.getAttribute('sandbox');
  expect(sandbox).not.toContain('allow-popups');
  expect(sandbox).not.toContain('allow-top-navigation');
});

test('transkrip ada di HTML awal, bukan disuntik JavaScript (GEO §1)', async ({ request }) => {
  const html = await (await request.get(HALAMAN)).text();
  expect(html).toContain('id="transkrip"');
  expect(html).toMatch(/Transkrip lengkap wawancara/);
});

test('panel fallback muncul bila YouTube diblokir (RULES V-11)', async ({ page, context }) => {
  await context.route(/youtube\.com|youtube-nocookie\.com/, (r) => r.abort());
  await page.goto(HALAMAN);
  await page.locator('.arsip-player__play').click();
  await expect(page.locator('[data-fallback]')).toBeVisible({ timeout: 8000 });
});
