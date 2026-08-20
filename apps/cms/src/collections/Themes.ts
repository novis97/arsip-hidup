import type { CollectionConfig } from 'payload';
import { isStaff, publishedOnly } from '../access/roles';

/** Struktur field lengkap ada di docs/SCHEMA.md. Stub ini sengaja minimal —
 *  diisi pada Fase 2 sesuai ROADMAP, agar Fase 1 fokus ke jalur arsip + pemutar. */
export const Themes: CollectionConfig = {
  slug: 'themes',
  admin: { group: 'Arsip' },
  versions: { drafts: true },
  access: { read: publishedOnly, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    // TODO(Fase 2): lengkapi sesuai docs/SCHEMA.md
  ],
};
