/**
 * Seed FIKTIF. RULES O-5 / SCHEMA §18:
 * dilarang memakai nama, foto, atau cerita narasumber asli di staging.
 */
import { getPayload } from "payload";
import config from "../../payload.config";

const run = async () => {
  const payload = await getPayload({ config });

  const koleksiAda = await payload.find({
    collection: "collections",
    where: { slug: { equals: "seed-batik-tulis-pekalongan" } },
    limit: 1,
  });
  const koleksi = koleksiAda.docs[0] ?? await payload.create({
    collection: "collections",
    data: {
      title: "[SEED] Batik Tulis Pekalongan",
      slug: "seed-batik-tulis-pekalongan",
      descriptionShort:
        "Dokumentasi sejarah lisan pembatik tulis di Pekalongan, Jawa Tengah, mencakup pewarna alam, dampak banjir rob, dan regenerasi pembatik.",
      region: "Pekalongan, Jawa Tengah",
      periodStart: 1950,
      periodEnd: 2026,
      status: "active",
      funder: [],
      _status: "published",
    },
  });

  const narasumberAda = await payload.find({
    collection: "narasumber",
    where: { slug: { equals: "seed-ratmi" } },
    limit: 1,
  });
  const n = narasumberAda.docs[0] ?? await payload.create({
    collection: "narasumber",
    data: {
      displayName: "[SEED] Ratmi",
      slug: "seed-ratmi",
      honorific: "Ibu",
      birthYear: 1951,
      displayConsent: "full_name",
      roleTags: ["pembatik"],
      _status: "published",
    },
  });

  const arsipAda = await payload.find({
    collection: "archive-items",
    where: { slug: { equals: "seed-ratmi-01" } },
    limit: 1,
  });
  const arsip = arsipAda.docs[0] ?? await payload.create({
    collection: "archive-items",
    data: {
      archiveNumber: "AHI/BTP/2026/001",
      title: "[SEED] Ratmi — mencanting sejak umur sembilan tahun",
      slug: "seed-ratmi-01",
      collection: koleksi.id,
      summary:
        "Wawancara sejarah lisan dengan seorang pembatik tulis Pekalongan tentang pewarna alam dan perubahan ritme kerja akibat banjir rob.",
      videoSource: "youtube",
      youtubeId: "aaaaaaaaaaa",
      thumbnailUrl: "https://cdn.arsiphidup.id/thumbs/seed-ratmi-01-1280.webp",
      durationSeconds: 862,
      recordedAt: "2026-03-12",
      recordedPlace: "Kauman, Pekalongan",
      language: ["id", "jv"],
      accessTier: "public",
      rightsStatement: "InC-EDU",
      license: "CC BY-NC-ND 4.0",
      consentRef: "SEED-000",
      consentVerified: true,
      withdrawalRequested: false,
      contributors: [{ narasumber: n.id, role: "narasumber" }],
      _status: "published",
    },
  });

  const transkripAda = await payload.find({
    collection: "transcripts",
    where: { archiveItem: { equals: arsip.id } },
    limit: 1,
  });
  if (transkripAda.totalDocs === 0) {
    await payload.create({
      collection: "transcripts",
      data: {
        archiveItem: arsip.id,
        language: "id",
        format: "plain",
        body: "[SEED] Wawancara fiktif. Pagi hari di ruang kerja biasanya dimulai dengan memeriksa kain mori, menyiapkan malam, lalu memanaskan canting perlahan. [SEED] Ratmi mengatakan ujung canting harus dijaga tetap bersih supaya garisnya tidak putus-putus. Kalau malam terlalu panas, katanya, kain bisa belepotan dan pola yang sudah digambar menjadi sulit diikuti.\n\nIa belajar memegang canting sejak kecil dengan melihat orang-orang yang lebih tua bekerja di rumah. Mula-mula tangannya hanya diperbolehkan mengisi bidang lebar, belum membuat garis utama. Setelah gerakannya luwih mantep, barulah ia mencoba bagian yang membutuhkan tarikan panjang dan titik-titik kecil.\n\nUntuk warna, keluarga mereka memakai campuran fiktif dari kulit kayu, daun, dan bahan pengunci warna yang disiapkan dalam ember terpisah. Setiap pencelupan harus diberi jeda agar warna meresap dan tidak cepat pudar. Menurutnya, pekerjaan ini tidak bisa kesusu karena perubahan warna baru terlihat setelah kain diangkat, diangin-anginkan, lalu dicelup kembali.\n\nRitme kerja juga mengikuti keadaan kampung pesisir Pekalongan. Ketika udara lembap atau air mulai naik di selokan, kain dipindahkan ke tempat yang lebih tinggi dan tungku dijauhkan dari lantai. Para pembatik saling memberi kabar jika rob datang lebih cepat, terutama kepada tetangga yang masih menjemur kain di halaman.\n\nDi akhir percakapan, ia berharap anak muda tetap mengenal proses panjang di balik selembar batik tulis. Tidak semua orang harus menjadi pembatik, ujarnya, tetapi mereka perlu ngerti bahwa tiap garis menyimpan waktu, ketelitian, dan kerja banyak tangan.",
        isVerified: true,
        visibility: "public",
      },
    });
  }

  const narasumberInisialAda = await payload.find({
    collection: "narasumber",
    where: { slug: { equals: "seed-sari-ningsih" } },
    limit: 1,
  });
  const narasumberInisial = narasumberInisialAda.docs[0] ?? await payload.create({
    collection: "narasumber",
    data: {
      displayName: "[SEED] Sari Ningsih",
      slug: "seed-sari-ningsih",
      initials: "S.N.",
      honorific: "Ibu",
      birthYear: 1962,
      displayConsent: "initials",
      roleTags: ["pembatik"],
      _status: "published",
    },
  });

  const arsipInisialAda = await payload.find({
    collection: "archive-items",
    where: { archiveNumber: { equals: "AHI/BTP/2026/002" } },
    limit: 1,
  });
  const arsipInisial = arsipInisialAda.docs[0]
    ? await payload.update({
        collection: "archive-items",
        id: arsipInisialAda.docs[0].id,
        data: {
          slug: "seed-resep-warna-keluarga-01",
          thumbnailUrl: "https://cdn.arsiphidup.id/thumbs/seed-resep-warna-keluarga-01-1280.webp",
        },
      })
    : await payload.create({
    collection: "archive-items",
    data: {
      archiveNumber: "AHI/BTP/2026/002",
      title: "[SEED] Sari Ningsih — merawat resep warna keluarga",
      slug: "seed-resep-warna-keluarga-01",
      collection: koleksi.id,
      summary:
        "Wawancara fiktif dengan [SEED] Sari Ningsih tentang pencatatan resep warna dan pembagian pengetahuan antargenerasi.",
      videoSource: "none",
      thumbnailUrl: "https://cdn.arsiphidup.id/thumbs/seed-resep-warna-keluarga-01-1280.webp",
      durationSeconds: 735,
      recordedAt: "2026-04-08",
      recordedPlace: "Kergon, Pekalongan",
      language: ["id"],
      accessTier: "public",
      rightsStatement: "InC-EDU",
      license: "CC BY-NC-ND 4.0",
      consentRef: "SEED-001",
      consentVerified: true,
      withdrawalRequested: false,
      contributors: [{ narasumber: narasumberInisial.id, role: "narasumber" }],
      _status: "published",
    },
  });

  const transkripInisialAda = await payload.find({
    collection: "transcripts",
    where: { archiveItem: { equals: arsipInisial.id } },
    limit: 1,
  });
  if (transkripInisialAda.totalDocs === 0) {
    await payload.create({
      collection: "transcripts",
      data: {
        archiveItem: arsipInisial.id,
        language: "id",
        format: "plain",
        body: "[SEED] Wawancara fiktif. Di meja kecil dekat tempat pencelupan, [SEED] Sari Ningsih menyimpan catatan campuran warna dalam buku bersampul cokelat. Takaran tidak hanya ditulis sebagai angka, tetapi juga disertai warna air, lama perebusan, dan keadaan cuaca saat kain dicelup. Menurutnya, catatan semacam itu membantu keluarga mengulang warna tanpa menganggap hasil alam selalu seragam.\n\nBahan pewarna fiktif dikumpulkan sedikit demi sedikit dari pasar dan kebun sekitar. Ada kulit kayu untuk warna hangat, daun untuk rona yang lebih sejuk, serta larutan pengunci yang digunakan setelah beberapa kali pencelupan. [SEED] Sari Ningsih selalu mengingatkan, ojo kesusu, sebab satu tahap yang dipercepat dapat membuat warna belang atau mudah luntur.\n\nPengetahuan tersebut dahulu lebih sering disampaikan sambil bekerja daripada melalui buku. Anak-anak memperhatikan perubahan warna di dalam panci, menghafal bau rebusan, lalu mencoba pada potongan kain kecil. Kini catatan tertulis dipakai sebagai pengingat, sementara keputusan terakhir tetap dibuat dengan melihat dan meraba kain secara langsung.\n\nKehidupan di pesisir ikut menentukan jadwal kerja. Saat angin basah bertiup dan rob diperkirakan masuk, buku resep, bahan kering, dan kain yang belum selesai dipindahkan ke rak atas. Pekerjaan pencelupan kadang dihentikan, lalu para tetangga membantu membersihkan ruang kerja setelah air surut.\n\nMenjelang akhir wawancara, [SEED] Sari Ningsih mengatakan resep keluarga bukan rahasia yang harus dibawa pergi sendirian. Ia ingin generasi berikutnya memahami dasar-dasarnya, kemudian berani mencoba dengan tanggung jawab. Sing penting ngerti proses, katanya, supaya perubahan tidak memutus ingatan tentang cara orang-orang sebelumnya bekerja.",
        isVerified: true,
        visibility: "public",
      },
    });
  }

  const narasumberAnonimAda = await payload.find({
    collection: "narasumber",
    where: { slug: { equals: "seed-laras-wening" } },
    limit: 1,
  });
  const narasumberAnonim = narasumberAnonimAda.docs[0] ?? await payload.create({
    collection: "narasumber",
    data: {
      displayName: "[SEED] Laras Wening",
      slug: "seed-laras-wening",
      honorific: "Ibu",
      birthYear: 1958,
      displayConsent: "anonymous",
      roleTags: ["pembatik"],
      _status: "published",
    },
  });

  const arsipAnonimAda = await payload.find({
    collection: "archive-items",
    where: { archiveNumber: { equals: "AHI/BTP/2026/003" } },
    limit: 1,
  });
  const arsipAnonim = arsipAnonimAda.docs[0]
    ? await payload.update({
        collection: "archive-items",
        id: arsipAnonimAda.docs[0].id,
        data: {
          slug: "seed-musim-rob-01",
          thumbnailUrl: "https://cdn.arsiphidup.id/thumbs/seed-musim-rob-01-1280.webp",
        },
      })
    : await payload.create({
    collection: "archive-items",
    data: {
      archiveNumber: "AHI/BTP/2026/003",
      title: "[SEED] Laras Wening — bekerja bersama menghadapi musim rob",
      slug: "seed-musim-rob-01",
      collection: koleksi.id,
      summary:
        "Wawancara fiktif dengan [SEED] Laras Wening mengenai kerja bersama para pembatik saat musim rob.",
      description: {
        root: {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Wawancara fiktif ini menguraikan cara para pembatik di kawasan pesisir Pekalongan menata ulang ruang kerja ketika air rob memasuki kampung. Bahan pewarna, kain, canting, dan buku catatan dipindahkan ke tempat tinggi, sementara pekerjaan yang membutuhkan api dihentikan sampai keadaan aman.",
                  version: 1,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              version: 1,
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Percakapan juga menggambarkan kerja bersama setelah air surut: membersihkan lantai, memeriksa kain yang terkena lembap, berbagi tempat jemur, dan menyusun kembali jadwal produksi. Pengalaman menghadapi rob menjadi bagian dari pengetahuan kerja sehari-hari, berdampingan dengan keterampilan mencanting dan mengolah warna alam.",
                  version: 1,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          version: 1,
        },
      },
      videoSource: "none",
      thumbnailUrl: "https://cdn.arsiphidup.id/thumbs/seed-musim-rob-01-1280.webp",
      durationSeconds: 648,
      recordedAt: "2026-05-17",
      recordedPlace: "Pasirsari, Pekalongan",
      language: ["id", "jv"],
      accessTier: "public",
      rightsStatement: "InC-EDU",
      license: "CC BY-NC-ND 4.0",
      consentRef: "SEED-002",
      consentVerified: true,
      withdrawalRequested: false,
      contributors: [{ narasumber: narasumberAnonim.id, role: "narasumber" }],
      _status: "published",
    },
  });

  const transkripAnonimAda = await payload.find({
    collection: "transcripts",
    where: { archiveItem: { equals: arsipAnonim.id } },
    limit: 1,
  });
  if (transkripAnonimAda.totalDocs === 0) {
    await payload.create({
      collection: "transcripts",
      data: {
        archiveItem: arsipAnonim.id,
        language: "id",
        format: "plain",
        body: "[SEED] Wawancara fiktif. Ketika air rob mulai terlihat di ujung gang, [SEED] Laras Wening biasanya memeriksa rak kain dan memindahkan peralatan ke tempat yang lebih tinggi. Warga sudah mengenali tanda-tandanya dari arah angin, bau air, dan kabar yang diteruskan dari rumah ke rumah. Sing penting kabeh slamet, katanya, sebelum memikirkan pekerjaan yang tertunda.\n\nRuang kerja batik berada menyatu dengan kehidupan rumah tangga, sehingga satu genangan dapat mengganggu banyak kegiatan sekaligus. Kompor untuk memanaskan malam dimatikan, kain mori digulung, dan bahan pewarna ditutup rapat. Anak-anak membantu membawa barang ringan, sedangkan orang dewasa mengangkat meja serta panci ke bagian rumah yang lebih aman.\n\nSetelah air surut, pekerjaan tidak langsung kembali normal. Lantai harus dibilas, canting diperiksa agar tidak berkarat, dan kain yang lembap dibentangkan satu per satu. [SEED] Laras Wening menceritakan bahwa para pembatik sering berbagi tempat jemur dengan tetangga yang halamannya masih tergenang. Bantuan kecil seperti itu membuat pesanan dapat dilanjutkan tanpa membebani satu keluarga saja.\n\nMusim rob juga mengubah cara mereka merencanakan pencelupan warna alam. Rebusan yang membutuhkan waktu lama dibuat ketika cuaca diperkirakan tenang, sementara bahan kering disimpan dalam wadah tertutup. Jika air datang di luar perkiraan, proses dihentikan dan catatan tahap terakhir ditempel pada kain supaya pekerjaan tidak keliru saat dimulai kembali.\n\nMenurut [SEED] Laras Wening, pengalaman pesisir mengajarkan bahwa keterampilan membatik bukan hanya soal membuat motif. Ada pengetahuan membaca cuaca, menjaga alat, dan bekerja bareng ketika keadaan sulit. Ia berharap cerita itu diingat sebagai bagian dari kehidupan pembatik Pekalongan, bukan sekadar kisah tentang bencana yang datang berulang.",
        isVerified: true,
        visibility: "public",
      },
    });
  }

  console.log("Seed selesai. Semua data fiktif.");
  process.exit(0);
};
run();
