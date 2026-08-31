import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const optionalNonEmptyString = z
  .string()
  .transform((value) => (value === '' ? undefined : value))
  .optional();

const optionalNonEmptyStringArray = z
  .array(z.string())
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional();

const optionalNonEmptyObjectArray = z
  .array(z.record(z.string(), z.unknown()))
  .transform((value) => (value.length === 0 ? undefined : value))
  .optional();

const editorial = defineCollection({
  loader: glob({
    base: './src/content',
    pattern: [
      'tentang/**/*.md',
      'berpartisipasi/**/*.md',
      'berita/**/*.md',
      'cerita/**/*.md',
      'koleksi/**/*.md',
      'kontak/**/*.md',
      'belajar/**/*.md',
      'rekomendasi-karya/**/*.md',
    ],
    generateId: ({ entry }) => entry.replaceAll('\\', '/'),
  }),
  schema: z
    .object({
      jenis: z.string(),
      tipe_konten: z.enum([
        'halaman_tentang',
        'halaman_berpartisipasi',
        'berita',
        'cerita',
        'koleksi',
        'halaman_koleksi',
        'halaman_kontak',
        'halaman_belajar',
        'halaman_rekomendasi_karya',
      ]),
      judul: z.string(),
      slug: z.string(),
      meta_title: z.string(),
      meta_description: z.string(),
      lapis_arsip: optionalNonEmptyString,
      tema: optionalNonEmptyStringArray,
      lokasi: optionalNonEmptyString,
      tahun_konteks: optionalNonEmptyString,
      narasumber: optionalNonEmptyObjectArray,
      consent_note: optionalNonEmptyString,
      status_konten: optionalNonEmptyString,
      keywords: optionalNonEmptyStringArray,
      ringkasan_geo: optionalNonEmptyString,
      jumlah_kata: z.number().optional(),
    })
    .passthrough(),
});

export const collections = { editorial };
