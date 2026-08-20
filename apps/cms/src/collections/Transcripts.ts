import type { CollectionConfig } from 'payload';
import { isStaff, publishedOnly } from '../access/roles';

/** SCHEMA §4. Aset SEO/GEO terbesar situs ini. */
export const Transcripts: CollectionConfig = {
  slug: 'transcripts',
  admin: { group: 'Arsip', useAsTitle: 'id' },
  access: { read: publishedOnly, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: 'archiveItem', type: 'relationship', relationTo: 'archive-items', required: true },
    { name: 'language', type: 'select', options: ['id', 'jv', 'en'], defaultValue: 'id' },
    { name: 'format', type: 'select', options: ['plain', 'timecoded', 'vtt'], defaultValue: 'timecoded' },
    { name: 'body', type: 'textarea', required: true },
    { name: 'segments', type: 'json' },
    { name: 'isVerified', type: 'checkbox', defaultValue: false,
      admin: { description: 'Status ini DITAMPILKAN ke pembaca. Transkrip ASR yang tampak otoritatif lebih berbahaya daripada tidak ada transkrip (RULES C-4).' } },
    { name: 'visibility', type: 'select', options: ['public', 'restricted'], defaultValue: 'public',
      admin: { description: 'Transkrip boleh publik meski videonya terbatas — penemuan maksimal, paparan minimal.' } },
  ],
};
