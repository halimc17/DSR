import json
import re

# Load schedule items
with open('prisma/schedule-items.json', 'r', encoding='utf-8') as f:
    schedule_items = json.load(f)

# Load PDF text
with open('prisma/rab_pdf_text.txt', 'r', encoding='utf-8') as f:
    pdf_text = f.read()

# Let's inspect the exact lines from PDF to match kode and prices
lines = [l.strip() for l in pdf_text.split('\n') if l.strip()]

# Total contract value
GRAND_TOTAL = 712063413.0

# Map of kode -> PDF extracted data
pdf_items = {}

# Regex for item line in PDF:
# e.g.: A.1.1. Pek. Pembersihan Awal Lapangan 1.00 Ls Rp 1,500,000.00 1,680,000.00 Rp 0.00 Rp 1,680,000.00 Rp 1,680,000.00 Rp 0.00 Rp 1,680,000.00
# or: B.1.13. Pek. Instalasi Nurce Call 21 Titik ... 1.00 Ls Rp 2,750,000.00 3,080,000.00 0.00 Rp 3,080,000.00 Rp 3,080,000.00 Rp 0.00 Rp 3,080,000.00

# We can find each item's total price by searching for the total rupiah at the end of the entry
# Notice in PDF:
# Each item has:
# HARGA SATUAN (UPAH, BAHAN, TOTAL) and TOTAL HARGA (UPAH, BAHAN, TOTAL)
# The last number is the grand total for that item!

# Let's parse all items systematically
# For each schedule item, we find its match in PDF
for item in schedule_items:
    kode = item['kode'] # e.g. A.1.1, A.4.6, B.1.7.a, B.1.11
    
    # Clean kode for search regex
    # Match pattern like "A.1.1." or "A. 4.6." or "B.1.7.a"
    # Find position in pdf_text
    escaped_kode = re.sub(r'\.', r'\\s*\\.\\s*', kode)
    pattern = re.compile(rf'{escaped_kode}\.?\s+(.+?)(?=(?:[A-C]\s*\.\s*\d|\Z))', re.DOTALL)
    m = pattern.search(pdf_text)
    
    total_harga = 0.0
    harga_upah = 0.0
    harga_bahan = 0.0
    
    if m:
        block = m.group(1)
        # Extract all numbers formatted like 1,680,000.00 or 712,063,413.00
        # Rupiah amounts have format: [0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?
        amounts = re.findall(r'(\d{1,3}(?:,\d{3})+(?:\.\d{2})|\b\d+\.\d{2}\b)', block)
        # Convert amounts to float
        floats = []
        for a in amounts:
            try:
                val = float(a.replace(',', ''))
                floats.append(val)
            except:
                pass
        
        # In the table, the last float in the row block is usually the total item price
        # Let's filter out known volumes
        candidates = [f for f in floats if f > 1000]
        if candidates:
            # The last candidate in the item line is the total item price
            total_harga = candidates[-1]
            if len(candidates) >= 3:
                # UPAH total is candidates[-3], BAHAN total is candidates[-2], TOTAL is candidates[-1]
                harga_upah = candidates[-3]
                harga_bahan = candidates[-2]
    
    item['totalHarga'] = total_harga
    item['hargaUpah'] = harga_upah
    item['hargaBahan'] = harga_bahan
    item['bobotPersen'] = round((total_harga / GRAND_TOTAL) * 100, 4) if total_harga > 0 else round(item['bobotJadwalAsli'], 4)
    item['selisihBobot'] = round(item['bobotJadwalAsli'] - item['bobotPersen'], 4)
    item['statusRekonsiliasi'] = 'CLARIFIED' if abs(item['selisihBobot']) > 0.5 else 'VERIFIED'

# Let's print items with selisih > 0.5
print("=== ITEMS WITH SELISIH BOBOT > 0.5% ===")
for item in schedule_items:
    if abs(item['selisihBobot']) > 0.5:
        print(f"Kode: {item['kode']} | Uraian: {item['uraian'][:35]} | RAB: {item['totalHarga']:,.2f} ({item['bobotPersen']}%) | Jadwal: {item['bobotJadwalAsli']:.2f}% | Selisih: {item['selisihBobot']:+.2f}%")

total_rab = sum(it['totalHarga'] for it in schedule_items)
print(f"Total calculated RAB: Rp {total_rab:,.2f} (Target: Rp {GRAND_TOTAL:,.2f})")

# Write final seed data
seed_data = {
    'project': {
        'nama': 'Renovasi Ruang Hemodialisa RS Umum Pertamina Prabumulih',
        'lokasi': 'Jl. Kesehatan No. 100, Komperta Prabumulih, Kel. Muntang Tapus, Kec. Prabumulih Barat, Sumatera Selatan 31122',
        'client': 'PT Abadinusa Usahasemesta',
        'kontraktor': 'PT Mitra Bangun Mahakarya',
        'nilaiKontrak': GRAND_TOTAL,
        'tanggalMulai': '2026-09-14T00:00:00.000Z',
        'tanggalBatasKontrak': '2026-11-13T00:00:00.000Z',
        'tanggalAkhirBaseline': '2026-11-15T00:00:00.000Z',
        'hariKerja': 60,
        'dendaPersenPerHari': 0.1,
        'maksDendaPersen': 10.0
    },
    'periods': [
        { 'mingguKe': 1, 'tanggalMulai': '2026-09-15T00:00:00.000Z', 'tanggalSelesai': '2026-09-20T00:00:00.000Z', 'bobotRencana': 0.8725, 'bobotKumulatifRencana': 0.8725, 'nilaiKumulatifRencana': 6212543.0 },
        { 'mingguKe': 2, 'tanggalMulai': '2026-09-21T00:00:00.000Z', 'tanggalSelesai': '2026-09-27T00:00:00.000Z', 'bobotRencana': 2.1930, 'bobotKumulatifRencana': 3.0655, 'nilaiKumulatifRencana': 21828032.0 },
        { 'mingguKe': 3, 'tanggalMulai': '2026-09-28T00:00:00.000Z', 'tanggalSelesai': '2026-10-04T00:00:00.000Z', 'bobotRencana': 8.2156, 'bobotKumulatifRencana': 11.2811, 'nilaiKumulatifRencana': 80328731.0 },
        { 'mingguKe': 4, 'tanggalMulai': '2026-10-05T00:00:00.000Z', 'tanggalSelesai': '2026-10-11T00:00:00.000Z', 'bobotRencana': 4.9829, 'bobotKumulatifRencana': 16.2640, 'nilaiKumulatifRencana': 115809772.0 },
        { 'mingguKe': 5, 'tanggalMulai': '2026-10-12T00:00:00.000Z', 'tanggalSelesai': '2026-10-18T00:00:00.000Z', 'bobotRencana': 6.8493, 'bobotKumulatifRencana': 23.1132, 'nilaiKumulatifRencana': 164581977.0 },
        { 'mingguKe': 6, 'tanggalMulai': '2026-10-19T00:00:00.000Z', 'tanggalSelesai': '2026-10-25T00:00:00.000Z', 'bobotRencana': 20.9556, 'bobotKumulatifRencana': 44.0688, 'nilaiKumulatifRencana': 313796570.0 },
        { 'mingguKe': 7, 'tanggalMulai': '2026-10-26T00:00:00.000Z', 'tanggalSelesai': '2026-11-01T00:00:00.000Z', 'bobotRencana': 30.2952, 'bobotKumulatifRencana': 74.3640, 'nilaiKumulatifRencana': 529500778.0 },
        { 'mingguKe': 8, 'tanggalMulai': '2026-11-02T00:00:00.000Z', 'tanggalSelesai': '2026-11-08T00:00:00.000Z', 'bobotRencana': 14.0234, 'bobotKumulatifRencana': 88.3874, 'nilaiKumulatifRencana': 629379611.0 },
        { 'mingguKe': 9, 'tanggalMulai': '2026-11-09T00:00:00.000Z', 'tanggalSelesai': '2026-11-15T00:00:00.000Z', 'bobotRencana': 11.6126, 'bobotKumulatifRencana': 100.0000, 'nilaiKumulatifRencana': 712063413.0 }
    ],
    'rabItems': schedule_items
}

with open('prisma/seed-data.json', 'w', encoding='utf-8') as f:
    json.dump(seed_data, f, indent=2, ensure_ascii=False)

print("Saved prisma/seed-data.json successfully.")
