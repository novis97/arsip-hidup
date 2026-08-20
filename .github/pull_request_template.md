## Apa yang berubah

## Dokumen blueprint yang terpengaruh
<!-- RULES K-10: blueprint yang tidak diperbarui berhenti dipercaya dalam dua bulan. -->
- [ ] Tidak ada perubahan perilaku yang terdokumentasi
- [ ] docs/… diperbarui di PR ini

## Checklist
- [ ] Tidak ada secret, kredensial, atau data narasumber asli
- [ ] Tidak ada query SQL yang dirangkai dengan string concatenation (RULES K-7)
- [ ] Jika menyentuh pemutar: checklist VIDEO_EMBED §10 dijalankan ulang (RULES V-14)
- [ ] Jika menambah domain pihak ketiga: CSP diperbarui dan direview
- [ ] Jika menyentuh data narasumber: `displayConsent` dihormati di semua titik render
