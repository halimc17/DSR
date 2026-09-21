import zipfile
import xml.etree.ElementTree as ET
import json
import re

xlsx_path = r'G:\My Drive\MBM\PROJECT\RS PERTAMINA PRABUMULIIH\time schedule  prabumulih rekap.xlsx'

# 1. Parse Time Schedule Excel
with zipfile.ZipFile(xlsx_path) as z:
    strings = []
    if 'xl/sharedStrings.xml' in z.namelist():
        tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
        for elem in tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
            text = ''.join([t.text or '' for t in elem.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')])
            strings.append(text)
    
    sheet_tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
    rows = sheet_tree.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row')
    
    parsed_rows = []
    for r in rows:
        row_dict = {}
        for c in r.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
            cell_ref = c.attrib.get('r', '')
            col = ''.join([ch for ch in cell_ref if ch.isalpha()])
            v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
            val = ''
            if v is not None and v.text:
                val = v.text
                if c.attrib.get('t') == 's':
                    val = strings[int(val)] if int(val) < len(strings) else val
            row_dict[col] = val
        parsed_rows.append(row_dict)

print(f"Total rows in schedule: {len(parsed_rows)}")

# Let's inspect schedule rows to identify items
# Col A: NO (e.g. A., A.1., or empty)
# Col B: NO detail (e.g. A.1.1.) or Uraian if main category
# Col C: Uraian Pekerjaan
# Col D: Volume
# Col E: Satuan
# Col F: Bobot (%)
# Col G: M1 (15-20 Sep)
# Col H: M2 (21-27 Sep)
# Col I: M3 (28 Sep-4 Okt)
# Col J: M4 (5-11 Okt)
# Col K: M5 (12-18 Okt)
# Col L: M6 (19-25 Okt)
# Col M: M7 (26 Okt-1 Nov)
# Col N: M8 (2-8 Nov)
# Col O: M9 (9-15 Nov)

items = []
current_kategori = "A. CIVIL WORK"
current_subkategori = "A.1. PEKERJAAN PERSIAPAN"
urutan = 0

for r in parsed_rows:
    col_a = r.get('A', '').strip()
    col_b = r.get('B', '').strip()
    col_c = r.get('C', '').strip()
    col_d = r.get('D', '').strip()
    col_e = r.get('E', '').strip()
    col_f = r.get('F', '').strip()
    
    # Check category header
    if col_a in ['A.', 'B.', 'C.']:
        current_kategori = f"{col_a} {col_b}".strip()
        continue
    if col_a.startswith('A.') or col_a.startswith('B.') or col_a.startswith('C.'):
        current_subkategori = f"{col_a} {col_b}".strip()
        continue
    
    # Check if item row
    # Item row has col_b with kode like A.1.1. or B.1.1 or similar
    # or col_b might contain both kode and uraian in some rows (e.g. B.1.1)
    kode = ''
    uraian = ''
    
    if re.match(r'^[A-C]\.\d+\.\d+', col_b):
        parts = col_b.split(None, 1)
        kode = parts[0].rstrip('.')
        if len(parts) > 1:
            uraian = parts[1]
        else:
            uraian = col_c
    elif col_b.startswith('A.') or col_b.startswith('B.') or col_b.startswith('C.'):
        kode = col_b.rstrip('.')
        uraian = col_c
        
    if not kode:
        continue
        
    # Check if it has volume or bobot
    vol_str = col_d.replace(',', '.').replace(' ', '').replace('Ls', '').strip()
    try:
        volume = float(vol_str) if vol_str else 1.0
    except:
        volume = 1.0
        
    satuan = col_e.strip() or 'Ls'
    satuan = satuan.replace('M', 'm²').replace("M'", "m'")
    
    try:
        bobot_jadwal = float(col_f) if col_f else 0.0
    except:
        bobot_jadwal = 0.0
        
    # Weekly plans (G to O)
    week_cols = ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O']
    plans = {}
    for w_idx, c_name in enumerate(week_cols, 1):
        val = r.get(c_name, '').strip()
        if val:
            try:
                plans[w_idx] = float(val)
            except:
                pass
                
    urutan += 1
    items.append({
        'urutan': urutan,
        'kode': kode,
        'parentKode': '.'.join(kode.split('.')[:2]),
        'kategori': current_kategori,
        'subKategori': current_subkategori,
        'uraian': uraian.strip(),
        'volume': volume,
        'satuan': satuan,
        'bobotJadwalAsli': bobot_jadwal,
        'plans': plans
    })

print(f"Extracted {len(items)} items from schedule.")
for it in items[:5]:
    print(it)

# Write intermediate schedule items
with open('prisma/schedule-items.json', 'w', encoding='utf-8') as f:
    json.dump(items, f, indent=2, ensure_ascii=False)
