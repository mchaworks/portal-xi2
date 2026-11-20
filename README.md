<div align="center">

<img src="icons/piwo.png" alt="Piwo" width="120" />

# XI.2 Creative Lab

**Belajar bareng, tumbuh solid, dan penuh cerita seru.**

Portal resmi kelas XI.2 — jadwal, piket, sorotan, tugas, dan satu maskot kodok hijau bernama Piwo.

[![Website](https://img.shields.io/badge/Live-xi2labz.dpdns.org-2e7d5b?style=for-the-badge&logo=googlechrome&logoColor=white)](https://xi2labz.dpdns.org)
[![Admin](https://img.shields.io/badge/Panel-Admin-1f4d3a?style=for-the-badge&logo=shield&logoColor=white)](https://xi2labz.dpdns.org/admin)

![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white)
![Android](https://img.shields.io/badge/Admin_APK-3DDC84?style=flat-square&logo=android&logoColor=white)

[**Buka Web**](https://xi2labz.dpdns.org) · [**Panel Admin**](https://xi2labz.dpdns.org/admin)

</div>

---

## Apa ini?

Satu tempat buat semua urusan kelas. Siswa tinggal buka satu link, nggak perlu lagi scroll grup chat buat nyari jadwal atau tugas. Wali kelas dan pengurus mengelola semuanya lewat panel admin, tanpa sentuh kode.

## Fitur

### Untuk siswa
| | Fitur | Keterangan |
|---|---|---|
| 🏠 | **Beranda** | Hero, statistik kelas, dan kartu Instagram kelas |
| 📅 | **Jadwal & Piket** | Jadwal pelajaran per hari plus regu piket |
| ✨ | **Sorotan** | Pengumuman dan kegiatan kelas, bisa disematkan (pin) |
| ✅ | **Tugas** | Daftar tugas beserta deadline dan lampiran |
| 👥 | **Anggota** | Daftar pengurus, koordinator, dan anggota kelas |
| 📸 | **Momen Kelas** | Kirim foto lewat halaman `kamera`, tampil setelah disetujui admin |
| 💌 | **NGL** | Kirim pesan anonim ke teman sekelas, dimoderasi admin |
| 🐸 | **Piwo AI** | Maskot kelas: chatbot, hewan peliharaan virtual, dan mini game |
| 🌙 | **Mode gelap** | Ganti tema kapan saja |
| 📱 | **PWA** | Bisa di-install ke layar utama dan tetap cepat berkat service worker |

### Untuk admin
- Kelola sorotan, tugas, jadwal, piket, anggota, momen, dan pesan NGL
- **Teks hero Beranda bisa diedit langsung** (lihat bagian bawah)
- Sinkronisasi kartu Instagram kelas
- **Mode pemeliharaan** dengan satu centang, lengkap dengan pesan untuk pengunjung
- Upload foto utama Beranda
- Tersedia juga sebagai **aplikasi Android** (`android-admin/`), dibuild otomatis lewat GitHub Actions

## Tech stack

| Bagian | Teknologi |
|---|---|
| Frontend | HTML, Vanilla JS, Tailwind CSS (CDN), Material Symbols |
| Backend | [Supabase](https://supabase.com): Postgres, Auth, Storage, Edge Functions |
| Keamanan | Row Level Security di semua tabel, admin dicek lewat `is_admin()` |
| Offline & cache | Service worker (`sw.js`) dengan strategi cache per jenis aset |
| Admin mobile | Android WebView, dibuild dengan Gradle di GitHub Actions |

Tanpa build step. Cukup file statis yang bisa di-host di mana saja.

## Struktur proyek

```
portal-xi2/
├── index.html            # Halaman utama
├── admin/                # Panel admin
├── kamera/               # Upload momen kelas
├── ngl/                  # Pesan anonim
├── piwo/                 # Maskot, chatbot, pet, dan mini game
├── android-admin/        # Aplikasi Android panel admin
├── icons/                # Ikon PWA dan logo
├── config.js             # Konfigurasi Supabase (hanya anon key)
├── theme.css / theme.js  # Tema dan mode gelap
├── sw.js                 # Service worker
└── .github/workflows/    # Build APK otomatis
```

## Menjalankan

```bash
git clone https://github.com/<username>/portal-xi2.git
cd portal-xi2

# pilih salah satu
python3 -m http.server 8080
npx serve .
```

Buka `http://localhost:8080`.

### Konfigurasi Supabase

Edit `config.js`:

```js
window.XIA_CONFIG = {
  SUPABASE_URL: "https://<project-ref>.supabase.co",
  SUPABASE_ANON_KEY: "<anon / publishable key>",
  STORAGE_BUCKET: "class-media"
};
```

> ⚠️ Cuma pakai **anon / publishable key**. Jangan pernah menaruh `service_role` key di repo.

Tabel utama: `announcements`, `assignments`, `schedule_items`, `piket`, `members`, `class_moments`, `ngl_messages`, `site_settings`, `admin_users`, plus tabel Piwo (`piwo_pets`, `piwo_scores`).

## Teks hero Beranda (bisa diedit dari admin)

Teks besar di atas Beranda dibaca dari tabel `site_settings`.
Edit lewat **Admin → Pengaturan → Teks hero Beranda**, lalu klik *Simpan pengaturan*.

| Key | Fungsi | Default |
|---|---|---|
| `hero_badge` | Label kecil di atas judul | Ruang Kolaborasi & Kreasi Digital • {class_name} |
| `hero_title_1` | Judul baris 1 | Belajar bareng, |
| `hero_title_highlight` | Judul yang disorot (hijau) | tumbuh solid, |
| `hero_title_2` | Judul baris 2 | dan \| penuh cerita seru. |
| `hero_description` | Paragraf deskripsi | Portal resmi {class_name}. Cek jadwal... |
| `hero_btn_primary` | Teks tombol utama | Jelajahi Momen Kelas |
| `hero_btn_secondary` | Teks tombol kedua | Tanya Piwo |

- Kolom dikosongkan = pakai teks bawaan (`HERO_DEFAULTS` di `index.html`).
- `{class_name}` otomatis diganti nama kelas, dan di deskripsi tampil tebal.
- `|` = pindah baris (hanya terlihat di layar lebar).
- Teks dirender sebagai teks biasa, bukan HTML.

### Menambah teks lain yang bisa diedit

1. Beri `id` pada elemen di `index.html`.
2. Tambah key dan default di `HERO_DEFAULTS`, lalu isi di `applyHeroCopy()`.
3. Tambah input di tab Pengaturan `admin/index.html`, baca di `loadSettings()`, simpan di `settings-form.onsubmit`.

## Deploy

Situs ini statis, jadi bisa di-host di GitHub Pages, Netlify, Cloudflare Pages, dan sejenisnya. Domain kustom diatur lewat file `CNAME`.

Setelah deploy, pengguna lama mungkin perlu refresh sekali karena service worker menyimpan cache.

## Tim

| Peran | Nama |
|---|---|
| Developer | MchaWorks (Affan) |
| Tester | Raditt |
| Wali kelas | Maam Febtwenesty, S.Pd. |

---

<div align="center">

Dibuat dengan 💚 oleh **XI.2 Creative Lab** · SMA Negeri 10 Palembang

</div>
