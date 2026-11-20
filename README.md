# FARMOVA — Sistem Manajemen Peternakan Cerdas

**FARMOVA** adalah aplikasi web manajemen peternakan modern yang dirancang untuk membantu peternak memantau dan mengelola operasional peternakan secara terorganisir, adaptif sesuai jenis komoditas ternak, dan berbasis data aktual.

Aplikasi ini mendukung berbagai komoditas peternakan di Indonesia—mulai dari **Ayam Petelur (Layer)**, **Ayam Pedaging (Broiler)**, **Bebek Petelur**, **Sapi Perah**, **Sapi Potong**, hingga **Kambing & Domba**—dalam satu platform terpadu dengan dukungan **Asisten AI Peternakan (Gemini API)** di sisi server.

---

## Fitur Utama

### 1. Pengaturan Awal & Kalkulator Rencana Usaha (Onboarding Wizard)
* **2 Metode Perencanaan:**
  * **Sesuai Modal (*Budget-First*):** Menghitung kapasitas populasi optimal, alokasi dana bibit/DOC, pakan fase awal, operasional, serta cadangan dana darurat (buffer) berdasarkan modal tersedia.
  * **Sesuai Target Keuntungan (*Goal-First*):** Menghitung mundur populasi minimum, kebutuhan pakan, luas lahan/kandang, dan estimasi modal awal dari target laba bulanan.
* **Audit Kelayakan AI:** Evaluasi objektif rencana usaha beserta estimasi *Break Even Point* (BEP) sebelum masuk ke dasbor operasional.

### 2. Dasbor Dinamis Multi-Komoditas
* Tampilan KPI, grafik tren produksi terakhir, dan jadwal kegiatan menyesuaikan komoditas aktif yang dipilih peternak (butir telur & HDP% untuk unggas petelur, bobot sampling & FCR untuk broiler, liter susu & kadar lemak untuk sapi perah, serta ADG untuk penggemukan).
* Peringatan otomatis untuk stok pakan yang menipis dan tugas harian yang belum selesai.

### 3. Pengelolaan Produksi Semi-Otomatis
* Input harian cepat sesuai karakteristik spesies ternak.
* Penghitungan otomatis persentase **HDP (Hen-Day Production)**, konversi rak telur (30 butir/rak), pengurangan stok pakan gudang, dan sinkronisasi angka kematian ke populasi batch.

### 4. Pengelolaan Ternak & Kandang
* Pemantauan kapasitas kandang, kepadatan (*occupancy*), serta suhu & kelembaban mikroklimat.
* Pengelolaan *batch*/koloni berdasarkan fase pemeliharaan (*starter, grower, finisher, layer, laktasi*) beserta pencatatan mortalitas/afkir.

### 5. Jadwal & Kegiatan Spesifik Spesies
* Jadwal perawatan, pemberian pakan, vaksinasi, sanitasi kandang, dan pemerahan susu dibedakan per komoditas.
* Rekomendasi tindakan dari **Asisten AI** dapat dikonversi langsung menjadi checklist jadwal harian.

### 6. Pengelolaan Keuangan & Arus Kas
* Memisahkan secara tegas **Modal Awal**, **Pemasukan Riil**, **Pengeluaran Operasional (OPEX)**, dan **Laba/Rugi Bersih**.
* Dilengkapi penanda status transaksi (**Nyata/Aktual** vs **Perkiraan/Proyeksi**).

### 7. Persediaan, Logistik & Pakan Alternatif
* **Persediaan Pakan & Obat:** Pemantauan stok konsentrat, bahan baku, vitamin/vaksin, estimasi sisa hari pemakaian, dan fitur restok cepat.
* **Pakan Alternatif (Terintegrasi di Persediaan):**
  * **Katalog Bahan Pakan Lokal:** Maggot BSF, Azolla Microphylla, Ampas Tahu Fermentasi, Indigofera, Dedak Fermentasi, dan Silase Kulit Kopi/Onggok lengkap dengan profil protein, energi, cara pengolahan, peringatan anti-nutrisi, serta fitur tambah bahan lokal kustom dan sinkronisasi `+ Stok` ke gudang.
  * **Kalkulator Substitusi & Hemat Biaya:** Simulasi persentase campuran pakan utama vs pakan alternatif dengan batas aman nutrisi biologis, estimasi penghematan bulanan, simpan resep formulasi, dan pembuatan jadwal persiapan pakan.
  * **Konsultan Formulasi AI:** Penyusunan rasio campuran ransum berbasis bahan lokal yang tersedia di sekitar kandang.

### 8. Analisis Usaha & Laporan Resmi
* Evaluasi efisiensi konversi pakan (**FCR**), porsi biaya pakan terhadap total OPEX, dan pencapaian target laba.
* Modul **Laporan** siap cetak / ekspor PDF dengan format rekap eksekutif, produksi, jurnal kas, dan logistik.

### 9. Asisten AI Peternakan
* Konsultasi interaktif berbasis konteks data kandang aktual (populasi, produksi terbaru, stok pakan, dan jadwal).
* Fitur **Deteksi Anomali Otomatis** untuk mendeteksi penurunan produksi atau risiko kesehatan ternak lebih dini.

---

## Arsitektur & Stack Teknologi

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React
* **Backend:** Node.js, Express.js (`server.ts`)
* **AI Integration:** `@google/genai` (Model `gemini-3.8-flash` berjalan di sisi server)
* **Penyimpanan Data Client:** `localStorage` (dengan fitur unduh backup JSON di menu Pengaturan)

---

## Struktur Direktori

```text
├── server.ts                          # Server Express, Vite middleware, dan endpoint Gemini AI
├── index.html                         # Entry HTML & metadata SEO
├── metadata.json                      # Konfigurasi kapabilitas AI Studio
├── package.json                       # Dependensi dan skrip npm
├── .env.example                       # Contoh variabel lingkungan
└── src/
    ├── App.tsx                        # Root state management, localStorage sync & routing tab
    ├── main.tsx                       # Entry point React
    ├── index.css                      # Konfigurasi Tailwind CSS & style cetak laporan
    ├── types/
    │   └── farm.ts                    # Definisi tipe TypeScript domain peternakan
    ├── data/
    │   └── initialData.ts             # Dataset awal, standar komoditas & katalog pakan alternatif
    ├── services/
    │   ├── api.ts                     # Klien API untuk endpoint AI backend
    │   └── calculationEngine.ts       # Mesin kalkulasi kelayakan usaha (Modal vs Target)
    └── components/
        ├── layout/                    # Header, Sidebar desktop, Mobile bottom navbar
        ├── onboarding/                # Wizard perencanaan & evaluasi kelayakan
        ├── dashboard/                 # Dasbor dinamis adaptif per komoditas
        ├── production/                # Pencatatan & riwayat produksi harian
        ├── livestock/                 # Manajemen kandang, batch & mortalitas
        ├── schedules/                 # Jadwal kegiatan spesifik spesies
        ├── finances/                  # Arus kas, pemasukan, pengeluaran & laba/rugi
        ├── inventory/                 # Persediaan pakan, pakan alternatif & obat/vaksin
        ├── feed/                      # Modul katalog, kalkulator & AI pakan alternatif
        ├── analytics/                 # Analisis FCR, OPEX & efisiensi usaha
        ├── ai/                        # Asisten AI chat & deteksi anomali
        ├── reports/                   # Laporan resmi siap cetak / PDF
        └── settings/                  # Pengaturan profil, privasi AI & backup JSON
```

---

## Endpoint API Backend (`server.ts`)

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Memeriksa status server dan ketersediaan `GEMINI_API_KEY`. |
| `POST` | `/api/ai/chat` | Konsultasi multi-turn dengan Asisten AI berbasis konteks kandang aktual. |
| `POST` | `/api/ai/analyze-anomaly` | Audit otomatis anomali produksi, mortalitas, dan konsumsi pakan. |
| `POST` | `/api/ai/feasibility-plan` | Evaluasi kelayakan rencana usaha saat onboarding (Modal vs Target). |
| `POST` | `/api/ai/alternative-feed` | Rekomendasi formulasi campuran dan fermentasi pakan alternatif lokal. |

---

## Konfigurasi & Cara Menjalankan

### 1. Variabel Lingkungan
Salin `.env.example` menjadi `.env` (atau atur pada panel Secrets di environment Anda):

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

### 2. Instalasi & Menjalankan Lokal

```bash
# Install dependensi
npm install

# Jalankan mode pengembangan (Express + Vite pada port 3000)
npm run dev
```

### 3. Pemeriksaan Tipe & Build Produksi

```bash
# Cek tipe TypeScript
npm run lint

# Build bundle produksi
npm run build

# Jalankan server produksi
NODE_ENV=production npm start
```
