import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Output statis. Situs publik tidak pernah memanggil VPS saat runtime —
// itu yang membuatnya tetap hidup kalau VPS berhenti dibayar (ARCHITECTURE §2.1).
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://arsiphidup.id',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/terlibat/akses-arsip/status'),
      i18n: { defaultLocale: 'id', locales: { id: 'id-ID', en: 'en-US' } },
    }),
  ],
  i18n: {
    defaultLocale: 'id',
    locales: ['id', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
