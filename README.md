# POS Toko Buah

Aplikasi Point of Sale (POS) untuk toko buah dibangun dengan **Next.js 16**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, dan **PostgreSQL**.

Fitur utama:

- Kasir/POS penjualan buah.
- Pengelolaan data buah, supplier, dan stok berbasis batch.
- Masa simpan setiap stok buah dengan notifikasi buah yang mendekati/melewati masa simpan.
- Konsep FEFO (First Expired, First Out) untuk pemilihan batch saat penjualan.
- Pengelolaan transaksi dan laporan pen/labana.
- Manajemen akun pengguna dengan role Admin dan Kasir.

---

## Prerequisites

- Node.js 20+ (dengan npm atau pnpm)
- PostgreSQL (lokal atau layanan cloud seperti Supabase / Neon)

---

## Instalasi

1. Clone repository:

```bash
git clone https://github.com/your-org/pos-toko-buah-next-js.git
cd pos-toko-buah-next-js
```

2. Salin `.env.example` menjadi `.env` dan isi nilai yang sesuai:

```bash
cp .env.example .env
```

Edit `.env` sesuai kebutuhan lingkungan Anda, minimal:

- `DATABASE_URL` — k PostgreSQL yang valid.
- `JWT_SECRET` — rahasia untuk menandatangani session JWT. Generate dengan `openssl rand -base64 48`.

3. Install dependensi:

```bash
npm install
```

4. Siapkan database dan jalankan migration:

```bash
npx prisma migrate dev
npx prisma generate
```

5. Isi data awal (seed) untuk development:

```bash
npx prisma db seed
```

6. Jalankan server development:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## Konfigurasi Environment

Lihat `.env.example` untuk daftar variabel lingkungan yang didukung.

| Variabel | Keterangan |
| --- | --- |
| `DATABASE_URL` | K PostgreSQL (Prisma). Wajib. |
| `JWT_SECRET` | Rahasia JWT untuk session. Wajib di produksi. |
| `NODE_ENV` | Diatur otomatis oleh Next.js. |
| `NEXT_PUBLIC_APP_URL` | URL aplikasi untuk redirect. |

---

## Struktur Proyek

```
src/
  app/                  # Next.js App Router
    (auth)/             # Halaman tanpa layout (login)
    (dashboard)/        # Route group dengan layout utama
      dashboard/ kasir/ buah/ supplier/ stok/ transaksi/ laporan/
  components/           # Komponen reusable
  lib/                  # db.ts, auth.ts, validations/, utils/
  server/               # actions/ services/
prisma/                # schema.prisma, seed.ts
```

---

## Menu Utama

### Dashboard
Ringkasan penjualan hari ini, transaksi, laba, stok, dan notifikasi masa simpan.

### Operasional Toko
1. User Account
2. Data Buah
3. Data Supplier
4. Data Stok
5. Kasir Apps
6. Data Transaksi

### Laporan
- Laporan Penjualan.
- Laporan Laba Rugi.

---

## Pengembangan

- **Lint**: `npm run lint`
- **Test**: `npm run test`
- **Build**: `npm run build`

---

## Keamanan

- Password di-hash dengan bcrypt.
- Session JWT ditandatangani dengan HS256 dan disimpan dalam cookie httpOnly.
- Validasi input di server menggunakan Zod.
- Authorization diperiksa di server, bukan hanya di frontend.
- Jangan commit `.env`. `.env.example` sudah disediakan.

---

## License
Lihat `LICENSE` untuk detail lisensi.