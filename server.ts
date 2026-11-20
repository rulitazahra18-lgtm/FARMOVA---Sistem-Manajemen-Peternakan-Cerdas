import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    name: 'FARMOVA Backend API',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Farm AI Consultation & Advice
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, farmContext, history } = req.body;

    const systemInstruction = `Anda adalah Dokter Hewan & Konsultan Manajemen Peternakan Cerdas di FARMOVA.
Misi Anda:
1. Membantu peternak menganalisis data peternakan aktual, kesehatan ternak, pakan, produksi (telur, susu, bobot panen), dan keuangan.
2. Jangan pernah mengarang data statistik atau menjamin laba pasti. Selalu gunakan angka riil yang tercantum dalam data peternakan pengguna.
3. Berikan saran yang praktis, ramah peternak, saintifik (zootechnic/nutrisi pakan/sanitasi), dan aplikatif di lapangan.
4. Jika Anda merekomendasikan tindakan medis atau perawatan mendesak, sertakan tag [ACTION: <nama tindakan> | <kategori> | <hari/waktu>] di akhir tanggapan agar sistem peternak dapat langsung menyimpannya ke jadwal kegiatan harian.

Konteks Peternakan Pengguna Saat Ini:
${JSON.stringify(farmContext || {}, null, 2)}
`;

    // Format conversation history for multi-turn if provided
    let promptContents = message;
    if (history && Array.isArray(history) && history.length > 0) {
      const formattedHistory = history
        .slice(-6)
        .map((h: { sender: string; text: string }) => `${h.sender === 'user' ? 'Peternak' : 'Asisten FARMOVA'}: ${h.text}`)
        .join('\n');
      promptContents = `Riwayat Percakapan Sebelumnya:\n${formattedHistory}\n\nPertanyaan Baru Peternak:\n${message}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptContents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'Maaf, saya tidak dapat memproses jawaban saat ini. Silakan coba kembali.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    res.status(500).json({
      error: 'Gagal menghubungi Asisten AI',
      message: error?.message || 'Terjadi kesalahan internal server.',
    });
  }
});

// Automated Anomaly Detection and Farm Diagnostic
app.post('/api/ai/analyze-anomaly', async (req, res) => {
  try {
    const { livestockData, productionHistory, feedRecords, mortalityRecords } = req.body;

    const prompt = `Analisis data peternakan berikut untuk menemukan potensi anomali, risiko penurunan produksi, pemborosan pakan (FCR buruk), atau tanda-tanda penyakit:
Data Populasi & Kandang:
${JSON.stringify(livestockData, null, 2)}

Riwayat Produksi Terbaru:
${JSON.stringify(productionHistory, null, 2)}

Riwayat Konsumsi Pakan:
${JSON.stringify(feedRecords, null, 2)}

Riwayat Mortalitas/Kematian:
${JSON.stringify(mortalityRecords, null, 2)}

Format jawaban yang diinginkan:
Berikan analisis ringkas dalam Bahasa Indonesia yang mencakup:
1. Status Kesehatan & Performa Umum (Baik / Perlu Perhatian / Kritis).
2. Temuan Anomali atau Tren Negatif (misal: penurunan telur beruntun, kenaikan mortalitas melebihi batas 1%, FCR melebihi standar).
3. 3 Rekomendasi Solusi Taktis Segera.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Anda adalah sistem deteksi dini dan audit performa peternakan FARMOVA.',
      },
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error('Error in /api/ai/analyze-anomaly:', error);
    res.status(500).json({
      error: 'Gagal menganalisis anomali',
      message: error?.message || 'Gagal terhubung ke Gemini API.',
    });
  }
});

// Feasibility Evaluation for Onboarding Plan
app.post('/api/ai/feasibility-plan', async (req, res) => {
  try {
    const { planType, inputs, calculations } = req.body;

    const prompt = `Lakukan evaluasi kelayakan bisnis untuk rencana peternakan berikut:
Tipe Perencanaan: ${planType === 'capital' ? 'Berdasarkan Modal Tersedia' : 'Berdasarkan Target Keuntungan'}
Data Masukan Peternak:
${JSON.stringify(inputs, null, 2)}
Hasil Kalkulasi Kebutuhan & Proyeksi:
${JSON.stringify(calculations, null, 2)}

Berikan evaluasi objektif:
- Tingkat Kelayakan (Sangat Layak / Layak Bersyarat / Berisiko Tinggi)
- Catatan Kritis mengenai cadangan dana darurat (buffer) dan estimasi FCR/kematian
- 3 Tips Kunci untuk peternak agar rencana ini sukses di lapangan.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Anda adalah konsultan keuangan agribisnis peternakan FARMOVA yang objektif dan realistis.',
      },
    });

    res.json({ evaluation: response.text });
  } catch (error: any) {
    console.error('Error in /api/ai/feasibility-plan:', error);
    res.status(500).json({
      error: 'Gagal mengevaluasi kelayakan rencana',
      message: error?.message || 'Gagal terhubung ke Gemini API.',
    });
  }
});

// AI Alternative Feed Formulation & Substitution Advisor
app.post('/api/ai/alternative-feed', async (req, res) => {
  try {
    const { commodityName, populationCount, localIngredients, currentFeedPricePerKg, targetNotes } = req.body;

    const prompt = `Anda adalah Ahli Nutrisi Ternak (Feed Formulator) di FARMOVA.
Peternak ingin menyusun formula pakan alternatif berbasis bahan lokal yang tersedia di sekitar peternakan untuk menekan biaya pakan tanpa mengorbankan produktivitas ternak.

Data Peternakan:
- Komoditas Ternak: ${commodityName}
- Populasi Aktif: ${populationCount} ekor
- Harga Pakan Utama/Pabrikan Saat Ini: Rp ${Number(currentFeedPricePerKg || 8500).toLocaleString('id-ID')}/kg
- Bahan Lokal Tersedia: ${localIngredients}
- Catatan Tambahan Peternak: ${targetNotes || '-'}

Tugas Anda (dalam Bahasa Indonesia yang terstruktur, praktis, dan ilmiah):
1. Rekomendasi Komposisi Campuran Ransum (dalam persentase % per 100 kg pakan) beserta batas aman substitusi terhadap pakan utama.
2. Estimasi Profil Nutrisi (Protein Kasar % & Energi) dan perbandingan biaya per kg vs pakan pabrikan (beri label perkiraan yang realistis).
3. Panduan Pengolahan / Fermentasi (misal penggunaan probiotik EM4/molases, pengeringan, atau pelayuan untuk menghilangkan zat antinutrisi seperti sianida/tanin/jamur).
4. Peringatan Risiko & Langkah Adaptasi Bertahap (transisi pakan 5-7 hari agar ternak tidak stres dan produksi telur/susu/bobot tidak anjlok).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Anda adalah ahli nutrisi pakan ternak FARMOVA. Jangan pernah mengarang hasil uji lab atau menjamin peningkatan keuntungan pasti; berikan rentang estimasi nutrisi standar literatur peternakan dan tekankan uji coba bertahap.',
      },
    });

    res.json({ formulaAdvice: response.text });
  } catch (error: any) {
    console.error('Error in /api/ai/alternative-feed:', error);
    res.status(500).json({
      error: 'Gagal menyusun formulasi pakan alternatif',
      message: error?.message || 'Gagal terhubung ke Gemini API.',
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FARMOVA Server running on port ${PORT} (NODE_ENV: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer();
