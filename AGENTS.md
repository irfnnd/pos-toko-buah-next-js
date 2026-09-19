# NextAdmin Pro — AI Agent Rules

> Next.js admin dashboard template · Tailwind CSS · React Aria · Recharts · TanStack Table

## Project structure

```
src/
  app/
    (with-layouts)/   # route groups sharing a layout
      (dashboard)/ (forms)/ (pages)/ (support)/   # grouped routes
      calendar/ charts/ tables/ ui-elements/        # top-level feature routes
      manage-team/ profile/ task/                   # misc top-level routes
    (without-layouts)/                              # routes without the shell
    css/                                             # global + calendar overrides
    globals.css  layout.tsx  providers.tsx
  components/
    tailgrids/core/                                  # design-system primitives (Button, Card, …)
    common/                                          # shared app chrome (sidebar, header, previews)
  services/api/                                      # one folder per feature (ai,    analytics, crm, …)
  hooks/                                             # cross-cutting client hooks
  utils/                                             # cn, formatters, icon map
  types/                                             # ambient module declarations
```

Drill into a specific folder to discover its files — naming is kebab-case for files, PascalCase for component exports.

## Next.js

This version has breaking changes — APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Conventions

- App Router with route groups under `src/app/(with-layouts)/` — groups: `(dashboard)`, `(forms)`, `(pages)`, `(support)`, plus top-level feature dirs (`calendar`, `charts`, `tables`, etc.).
- Prefer Client Components but keep `layout.tsx` SSR; add `"use client"` when necessary.
- File naming: kebab-case for files, PascalCase for component exports.

## Styling rules

- Use **Tailwind CSS** with the project's **semantic tokens** (`text-text-*`, `bg-card-*`, `border-*`, etc.).
- Never hardcode hex colors — always reference tokens from `src/app/globals.css`.
- Do NOT create new CSS utility classes.
- FullCalendar overrides belong in `src/app/css/calendars.css`.

## Component rules

- **Modular sub-components**: Never place all code into a single monolithic file. Split complex UI into focused, single-responsibility sub-components in separate files (e.g. `header.tsx`, `filter-bar.tsx`, `card-item.tsx`).
- **Follow React composition best practices**:
    - **Single Responsibility**: Keep sub-components focused on one concern—separate container/state logic from presentational rendering.
    - **Composition over prop drilling**: Prefer passing `children` or using compound component patterns over passing deeply nested props through intermediate layers.
    - **Avoid inline render helpers**: Extract repeated or section-level JSX into dedicated sub-component files rather than helper functions like `renderHeader()` inside `index.tsx`.
    - **Typed prop contracts**: Define explicit, strongly typed interfaces for each sub-component in `types.ts` or co-located with the sub-component.
- Prefer primitives from `src/components/tailgrids/core/` (Button, Card, Badge, Select, Tabs, Dialog, etc.) over raw HTML or third-party equivalents.
- Use `react-aria` skill for accessible component architecture when building interactive primitives.
- Icons: use `@tailgrids/icons` for standard controls. For feature-local icons, place them in `icons.tsx`. Never generate SVG icons — use letter placeholders if no icon is available.
- Add `"use client"` directive when the component uses hooks, event handlers, or browser APIs.

## Data fetching & state

- Always use `api-integration` skill for API integration.
- Client-side state: use React context or URL search params. Don't introduce new state libraries.

## Forms, charts, tables

- React Aria-backed primitives with composed label/error; Sonner `toast.*` for feedback (`Toaster` is mounted globally).
- Recharts are Client Components — wrap in Cards with `ChartContainer` and an explicit height; custom tooltips in `custom-tooltip.tsx`; unique gradient IDs per chart.
- TanStack Table for sorting/filtering/pagination; keep types, columns, mappings, and skeletons in separate feature files; render cells via `flexRender`; Badges for statuses.

## Don'ts

- Don't install new packages without asking the user.
- Don't overwrite primitives in `src/components/tailgrids/core/` without asking.
- Don't create new CSS utility classes — use existing tokens.
- Don't place pages outside the `(with-layouts)` route group unless intentional.

# AGENTS.md — POS Toko Buah

## 1. Tujuan Proyek

Membangun aplikasi Point of Sales (POS) untuk toko buah menggunakan Next.js yang mencakup:

- Kasir/POS penjualan buah.
- Pengelolaan data buah.
- Pengelolaan supplier.
- Pengelolaan stok berdasarkan batch masuk.
- Masa simpan setiap stok buah.
- Notifikasi buah yang mendekati masa simpan dan buah yang sudah melewati masa simpan.
- Pengelolaan transaksi.
- Laporan penjualan.
- Laporan laba rugi.
- Manajemen akun pengguna dengan role Admin dan Kasir.

Aplikasi harus memiliki UI modern, bersih, responsif, dan alur kerja sederhana untuk operasional toko.

---

## 2. Stack Teknologi

Gunakan:

- Next.js terbaru dengan App Router.
- TypeScript.
- Tailwind CSS.
- shadcn/ui untuk komponen UI.
- Lucide React untuk ikon.
- Prisma ORM.
- PostgreSQL.
- Zod untuk validasi schema.
- React Hook Form untuk form.
- Recharts untuk grafik/dashboard.
- date-fns untuk pengolahan tanggal.
- Auth.js/NextAuth untuk autentikasi jika diperlukan.

Hindari penggunaan library tambahan jika fitur yang sama sudah dapat dibuat menggunakan kemampuan bawaan Next.js atau library yang sudah tersedia.

---

## 3. Struktur Aplikasi

Gunakan struktur berbasis fitur, bukan menaruh semua kode dalam satu file.

Contoh:

```text
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── kasir/
│   │   ├── buah/
│   │   ├── supplier/
│   │   ├── stok/
│   │   ├── transaksi/
│   │   └── laporan/
│   │       ├── penjualan/
│   │       └── laba-rugi/
│   └── api/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   ├── kasir/
│   ├── buah/
│   ├── stok/
│   └── laporan/
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── validations/
│   └── utils/
├── server/
│   ├── actions/
│   └── services/
└── prisma/
    └── schema.prisma
```

Struktur boleh disesuaikan jika ada alasan teknis yang jelas.

---

## 4. Menu Utama

Sidebar mengikuti konsep UI pada referensi POS:

### Dashboard
Menampilkan ringkasan:

- Penjualan hari ini.
- Jumlah transaksi hari ini.
- Laba hari ini.
- Total stok buah.
- Buah mendekati masa simpan.
- Buah melewati masa simpan.
- Grafik penjualan.
- Produk buah yang paling banyak terjual.

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

Laporan dapat memiliki filter:

- Hari ini.
- 7 hari terakhir.
- Bulan ini.
- Rentang tanggal.

---

## 5. Data Buah

Tidak perlu membuat kategori buah jika tidak dibutuhkan.

Field minimal:

- ID.
- Kode buah.
- Nama buah.
- Satuan.
- Harga beli default.
- Harga jual.
- Stok saat ini.
- Minimum stok.
- Masa simpan default.
- Status aktif/nonaktif.
- Foto buah opsional.
- Created at.
- Updated at.

Satuan dapat berupa:

- Kg.
- Gram.
- Buah.
- Ikat.
- Satuan lain jika diperlukan.

Harga dan stok harus menggunakan tipe numerik yang aman untuk perhitungan.

---

## 6. Stok Berbasis Batch

Ini adalah fitur penting.

Jangan hanya menyimpan tanggal kedaluwarsa pada tabel buah.

Setiap stok masuk harus menjadi batch stok tersendiri karena setiap pembelian buah dapat memiliki tanggal masuk dan masa simpan berbeda.

Contoh:

```text
Apel Fuji
Batch A:
- Masuk: 1 September
- Jumlah: 20 Kg
- Masa simpan: 14 hari
- Batas simpan: 15 September

Batch B:
- Masuk: 5 September
- Jumlah: 15 Kg
- Masa simpan: 14 hari
- Batas simpan: 19 September
```

Dengan demikian sistem dapat mengetahui batch mana yang lebih dahulu harus dijual.

Gunakan konsep FEFO (First Expired, First Out) untuk menentukan batch yang digunakan saat penjualan.

---

## 7. Data Stok Masuk

Form stok masuk minimal memiliki:

- Nomor stok masuk.
- Supplier.
- Tanggal masuk.
- Buah.
- Jumlah.
- Satuan.
- Harga beli per satuan.
- Total harga beli.
- Masa simpan.
- Tanggal batas masa simpan.
- Catatan.

Tanggal batas masa simpan dihitung otomatis:

```text
tanggal_masuk + masa_simpan
```

User tetap dapat melihat dan mengoreksi tanggal batas jika diperlukan sesuai aturan bisnis toko.

Ketika stok masuk disimpan:

1. Buat record transaksi stok masuk.
2. Buat batch stok.
3. Tambahkan stok tersedia.
4. Simpan harga beli batch.
5. Hitung tanggal batas masa simpan.
6. Perbarui ringkasan stok buah.

---

## 8. Notifikasi Buah Busuk / Masa Simpan

Fitur utama tambahan proyek.

Setiap batch memiliki:

- tanggal masuk
- masa simpan
- tanggal batas masa simpan
- jumlah stok tersisa
- status masa simpan

Status:

```text
AMAN
SEGERA_BATAS
MELEWATI_BATAS
HABIS
```

Gunakan configurable warning period, misalnya:

```text
warningDays = 3
```

Aturan:

### Aman

```text
tanggal_sekarang < tanggal_batas - warningDays
```

### Segera batas

```text
tanggal_batas - warningDays <= tanggal_sekarang < tanggal_batas
```

### Melewati batas

```text
tanggal_sekarang >= tanggal_batas
```

Jangan langsung menghapus stok yang melewati masa simpan.

Stok tetap tercatat sebagai stok rusak/busuk sampai dilakukan proses stok keluar karena busuk/rusak.

---

## 9. Notification Center

Buat notification bell di navbar seperti referensi.

Notifikasi minimal:

- "Apel Fuji akan melewati masa simpan dalam 2 hari."
- "Mangga batch MB-001 telah melewati masa simpan."
- "Stok Jeruk tinggal 5 Kg."
- "Terdapat 3 batch buah yang perlu diperiksa."

Tambahkan:

- jumlah badge notifikasi belum dibaca.
- daftar notifikasi.
- tandai sudah dibaca.
- tandai semua sudah dibaca.
- link menuju halaman stok terkait.

Notifikasi masa simpan sebaiknya dihitung berdasarkan data batch sehingga tidak bergantung pada cron untuk sekadar menentukan status.

Jika membutuhkan notifikasi persisten, gunakan scheduled job/cron yang aman dan idempotent.

---

## 10. Stok Keluar

Stok keluar digunakan untuk:

- Penjualan.
- Buah busuk.
- Buah rusak.
- Koreksi stok.
- Keperluan lain yang sah.

Untuk stok keluar karena busuk/rusak:

- Pilih batch.
- Masukkan jumlah.
- Pilih alasan.
- Simpan catatan.
- Kurangi stok batch.
- Catat pergerakan stok.

Jangan menganggap buah melewati masa simpan otomatis berarti stok sudah hilang.

---

## 11. Kasir / POS

Halaman kasir harus mengikuti konsep pada referensi:

### Layout

- Sidebar kiri.
- Header/navbar.
- Area produk di sebelah kiri.
- Keranjang belanja di sebelah kanan.
- Search produk.
- Card produk.
- Tombol Tambah.
- Total transaksi.
- Input uang bayar.
- Tombol nominal cepat.
- Kembalian.
- Tombol pembayaran.

Pada desktop gunakan layout:

```text
┌────────────────────────────────────────────────────┐
│ Header                                             │
├──────────────┬──────────────────────┬──────────────┤
│ Sidebar      │ Produk               │ Keranjang    │
│              │                      │              │
│              │ Card Card Card Card  │ Item         │
│              │ Card Card Card Card  │ Item         │
│              │ Card Card Card Card  │ Total        │
│              │                      │ Pembayaran   │
└──────────────┴──────────────────────┴──────────────┘
```

Pada mobile, keranjang dapat menjadi drawer/sheet.

---

## 12. Produk di Kasir

Card produk menampilkan:

- Kode.
- Nama buah.
- Foto/icon.
- Harga jual.
- Status ketersediaan.
- Tombol Tambah.

Produk yang:

- stok habis → tidak dapat ditambahkan.
- seluruh batch sudah melewati masa simpan → jangan dijual.
- memiliki batch yang akan segera melewati masa simpan → tetap dapat dijual selama belum melewati batas, dengan FEFO.

Jangan menggunakan stok total saja ketika menentukan batch penjualan.

---

## 13. Keranjang

Setiap item keranjang memiliki:

- Nama buah.
- Batch yang dipilih sistem.
- Harga jual.
- Jumlah.
- Subtotal.
- Tombol tambah.
- Tombol kurang.
- Tombol hapus.

Sistem harus menggunakan FEFO saat mengurangi stok.

Jika satu produk membutuhkan beberapa batch karena jumlah yang dijual melebihi stok batch pertama, sistem dapat mengambil stok dari batch berikutnya berdasarkan tanggal batas masa simpan.

---

## 14. Pembayaran

Minimal:

- Total transaksi.
- Uang bayar.
- Kembalian.
- Metode pembayaran.

Metode pembayaran:

- Tunai.
- QRIS.
- Transfer.
- Lainnya.

Untuk pembayaran tunai:

```text
kembalian = uang_bayar - total
```

Validasi:

```text
uang_bayar >= total
```

Jika kurang, transaksi tidak boleh diselesaikan.

---

## 15. Transaksi

Setiap transaksi memiliki:

- Nomor transaksi.
- Tanggal/waktu.
- Kasir.
- Total.
- Uang bayar.
- Kembalian.
- Metode pembayaran.
- Status.

Detail transaksi:

- Produk.
- Batch.
- Jumlah.
- Harga jual.
- Harga beli batch.
- Subtotal.
- Modal.
- Laba.

Simpan harga beli pada detail transaksi agar laporan laba historis tidak berubah ketika harga beli produk berubah di kemudian hari.

---

## 16. Perhitungan Laba

Untuk setiap item:

```text
modal = jumlah × harga_beli_batch
pendapatan = jumlah × harga_jual
laba = pendapatan - modal
```

Untuk transaksi:

```text
total_laba = Σ laba_item
```

Jangan menghitung laba historis hanya dari harga beli default pada tabel buah.

Gunakan harga beli dari batch yang benar-benar digunakan saat transaksi.

---

## 17. Laporan Penjualan

Laporan penjualan menampilkan:

- Nomor transaksi.
- Tanggal.
- Kasir.
- Jumlah item.
- Total penjualan.
- Metode pembayaran.

Detail laporan dapat menampilkan:

- Produk.
- Jumlah.
- Harga jual.
- Harga beli.
- Modal.
- Laba.

Jadi laporan penjualan dapat sekaligus memperlihatkan laba dari transaksi tanpa harus membuat halaman baru untuk setiap transaksi.

---

## 18. Laporan Laba Rugi

Tampilkan:

- Total pendapatan penjualan.
- Total modal/HPP.
- Laba kotor.
- Pengeluaran operasional jika fitur pengeluaran digunakan.
- Laba bersih.

Rumus:

```text
laba kotor = total penjualan - total HPP

laba bersih = laba kotor - total pengeluaran
```

Jika fitur pengeluaran belum dibuat, jangan mengklaim laba bersih sebagai laba bersih sebenarnya. Gunakan istilah yang sesuai seperti "Laba Kotor".

---

## 19. User dan Role

Minimal dua role:

### Admin

Dapat:

- Mengakses dashboard.
- Mengelola user.
- Mengelola data buah.
- Mengelola supplier.
- Mengelola stok.
- Mengakses kasir.
- Melihat transaksi.
- Melihat laporan.

### Kasir

Dapat:

- Mengakses dashboard terbatas.
- Mengakses kasir.
- Melihat transaksi.
- Melihat stok yang relevan.
- Melihat informasi produk.

Kasir tidak boleh menghapus atau mengubah data master penting tanpa hak akses.

Gunakan server-side authorization. Jangan hanya menyembunyikan menu melalui frontend.

---

## 20. Dashboard

Dashboard menampilkan kartu:

```text
Penjualan Hari Ini
Rp xxx.xxx

Transaksi Hari Ini
xx transaksi

Laba Hari Ini
Rp xxx.xxx

Total Stok
xxx Kg
```

Tambahkan widget:

- Buah mendekati masa simpan.
- Buah melewati masa simpan.
- Stok minimum.
- Penjualan 7 hari.
- Produk terlaris.
- Aktivitas transaksi terbaru.

---

## 21. Database

Model utama yang disarankan:

```text
User
Fruit
Supplier
StockBatch
StockMovement
Sale
SaleItem
Expense
Notification
```

Relasi utama:

```text
Fruit 1 ─── N StockBatch
Supplier 1 ─── N StockBatch

Sale 1 ─── N SaleItem
Fruit 1 ─── N SaleItem
StockBatch 1 ─── N SaleItem

Fruit 1 ─── N StockMovement
StockBatch 1 ─── N StockMovement

User 1 ─── N Sale
User 1 ─── N StockMovement
```

Gunakan foreign key dan index pada field yang sering digunakan untuk pencarian/filter.

---

## 22. Integritas Transaksi

Operasi berikut harus atomic:

### Penjualan

```text
Validasi stok
→ pilih batch FEFO
→ buat Sale
→ buat SaleItem
→ kurangi StockBatch
→ buat StockMovement
→ commit
```

Jika salah satu gagal, rollback seluruh operasi.

### Stok masuk

```text
Validasi data
→ buat StockBatch
→ buat StockMovement
→ update stok
→ commit
```

Gunakan database transaction Prisma.

---

## 23. Validasi

Validasi dilakukan di server.

Gunakan Zod.

Validasi minimal:

- Nama buah wajib.
- Harga tidak boleh negatif.
- Jumlah stok harus > 0.
- Masa simpan harus > 0.
- Uang bayar tidak boleh kurang dari total.
- Stok tidak boleh menjadi negatif.
- Role harus valid.
- Supplier harus valid jika diwajibkan.

Frontend validation hanya untuk UX. Server validation tetap wajib.

---

## 24. UI/UX

Referensi visual adalah dashboard POS pada gambar yang diberikan user.

Karakter UI:

- Modern.
- Profesional.
- Bersih.
- Dominan putih pada content area.
- Sidebar gelap.
- Card dengan border halus.
- Rounded corners.
- Ikon Lucide.
- Badge status.
- Button yang jelas.
- Tidak terlalu banyak animasi.
- Responsive.

Sidebar:

```text
POS Toko Buah

Dashboard

OPERASIONAL TOKO
  User Account
  Data Buah
  Data Supplier
  Data Stok
  Kasir Apps
  Data Transaksi

LAPORAN
  Laporan Penjualan
  Laporan Laba Rugi
```

Pada desktop sidebar dapat dibuat collapsible.

---

## 25. Search dan Filter

Data tabel harus mendukung:

- Search.
- Pagination.
- Sorting.
- Filter tanggal.
- Filter status.
- Filter supplier jika relevan.

Gunakan URL query parameters untuk filter halaman yang perlu dapat dibagikan/bookmark.

---

## 26. Status Badge

Gunakan status yang jelas:

### Masa simpan

- Aman
- Segera Batas
- Melewati Batas
- Habis

### Stok

- Tersedia
- Stok Menipis
- Habis

### Transaksi

- Selesai
- Dibatalkan

Gunakan warna/status yang konsisten melalui komponen Badge.

---

## 27. Error Handling

Jangan menampilkan stack trace ke user.

Gunakan pesan yang mudah dipahami:

```text
"Transaksi gagal. Stok Apel Fuji tidak mencukupi."
```

Untuk error server:

```text
"Terjadi kesalahan saat menyimpan data. Silakan coba lagi."
```

Log error secara aman di server.

---

## 28. Keamanan

Wajib:

- Password di-hash.
- Session aman.
- Authorization server-side.
- Validasi semua input.
- Hindari SQL injection dengan Prisma.
- Jangan menyimpan password plaintext.
- Jangan menaruh secret di source code.
- Gunakan `.env`.
- Jangan commit `.env`.

Contoh:

```env
DATABASE_URL=
AUTH_SECRET=
```

Sediakan `.env.example`.

---

## 29. Seed Data

Buat seed database untuk development yang berisi:

- 1 Admin.
- 1 Kasir/Karyawan.
- Minimal 8-12 buah.
- Beberapa supplier.
- Beberapa batch stok.
- Batch aman.
- Batch segera batas.
- Batch melewati batas.
- Contoh transaksi.

Data seed harus memudahkan pengujian fitur notifikasi dan FEFO.

---

## 30. Testing

Prioritaskan testing pada business logic:

1. Perhitungan tanggal masa simpan.
2. Status masa simpan.
3. Notifikasi masa simpan.
4. FEFO.
5. Pengurangan stok.
6. Penjualan multi-batch.
7. Perhitungan laba.
8. Validasi pembayaran.
9. Authorization role.

Minimal buat unit test untuk service yang mengatur:

```text
expiry-status
stock-allocation
sale-calculation
profit-calculation
```

---

## 31. Aturan Pengembangan Agent

Saat mengerjakan task:

1. Baca `AGENTS.md` terlebih dahulu.
2. Pahami struktur project sebelum membuat perubahan.
3. Jangan menghapus fitur yang sudah bekerja tanpa alasan.
4. Jangan membuat mock data permanen sebagai pengganti database.
5. Gunakan database nyata untuk fitur CRUD.
6. Pisahkan UI, business logic, validation, dan database access.
7. Gunakan Server Actions/API sesuai kebutuhan.
8. Jangan melakukan query database langsung dari Client Component.
9. Gunakan Server Component secara default jika tidak membutuhkan interaktivitas browser.
10. Gunakan Client Component hanya ketika diperlukan.
11. Setelah perubahan besar, jalankan lint/typecheck/test.
12. Perbaiki error sebelum melanjutkan fitur berikutnya.
13. Jangan mengubah schema database tanpa memperbarui migration.
14. Jangan melakukan breaking change pada fitur lama tanpa alasan.
15. Prioritaskan correctness transaksi dan stok dibanding kosmetik UI.

---

## 32. Urutan Implementasi

Implementasikan secara bertahap:

### Phase 1
- Setup Next.js.
- Tailwind.
- shadcn/ui.
- Prisma.
- PostgreSQL.
- Auth.
- Layout/sidebar/navbar.

### Phase 2
- User.
- Role.
- Data buah.
- Supplier.

### Phase 3
- StockBatch.
- Stok masuk.
- StockMovement.
- Masa simpan.

### Phase 4
- Notification Center.
- Status masa simpan.
- Stok menipis.
- Buah melewati masa simpan.

### Phase 5
- Halaman kasir.
- Keranjang.
- Pembayaran.
- FEFO.
- Cetak struk.

### Phase 6
- Data transaksi.
- Detail transaksi.
- Pembatalan transaksi dengan kontrol yang aman.

### Phase 7
- Laporan penjualan.
- Laporan laba rugi.
- Grafik dashboard.

### Phase 8
- Testing.
- Validasi.
- Authorization.
- Responsive UI.
- Performance.
- Final cleanup.

---

## 33. Definition of Done

Sebuah fitur dianggap selesai jika:

- UI sudah dibuat.
- Responsive.
- Validasi frontend dan backend tersedia.
- Database terhubung.
- Authorization diterapkan.
- Loading state tersedia.
- Empty state tersedia.
- Error state tersedia.
- Success feedback tersedia.
- Data tidak hilang ketika refresh.
- Tidak ada TypeScript error.
- Tidak ada lint error yang relevan.
- Business logic sudah diuji.
- Tidak merusak fitur sebelumnya.

---

## 34. Prinsip Penting

### Jangan menyederhanakan stok menjadi satu angka saja.

Stok harus dapat dilacak berdasarkan batch karena masa simpan berbeda.

### Jangan menghapus buah yang melewati masa simpan secara otomatis.

Ubah statusnya dan tampilkan sebagai buah yang perlu diperiksa.

### Jangan menghitung laba berdasarkan harga beli saat ini.

Gunakan harga beli dari batch yang benar-benar terjual.

### Jangan mengandalkan frontend untuk keamanan.

Authorization harus diperiksa di server.

### Jangan membuat UI hanya terlihat bagus.

Prioritaskan:

```text
Data benar
→ stok benar
→ transaksi atomic
→ laporan benar
→ authorization benar
→ baru optimasi UI
```
