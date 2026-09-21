import re
import json

with open('prisma/rab_pdf_text.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's clean the text and split into pages
# In PDF, page 2 and page 3 contain the RAB table
p2_idx = text.find('--- PAGE 2 ---')
p3_idx = text.find('--- PAGE 3 ---')

p2 = text[p2_idx:p3_idx]
p3 = text[p3_idx:]

table_text = p2 + "\n" + p3

# Remove page header / footer / summary lines that could interfere
# Subtotals to ignore:
# A.1. 21,703,572.99
# A.2. 14,664,867.50
# A.3. 49,976,129.22
# A.4. 179,408,982.58
# A.5. 75,939,476.39
# A.7. 83,740,703.28
# A.8. 49,057,095.92
# B.1. 93,299,811.50
# B.2. 36,275,295.21
# B.3. 103,797,478.40
# C. 4,200,000.00
# Grand Total 712,063,413.00

with open('prisma/schedule-items.json', 'r', encoding='utf-8') as f:
    schedule_items = json.load(f)

# Let's do a regex that matches each item line with its prices
# Look at pattern in PDF:
# Every item has:
# [Volume] [Satuan] Rp [Harga Upah 1] [Harga Upah 2] Rp [Harga Bahan 1] [Harga Bahan 2] Rp [Total Satuan] Rp [Total Upah] Rp [Total Bahan] Rp [Total Item]
# For example:
# 1.00 Ls Rp 1,500,000.00 1,680,000.00 Rp 0.00 Rp 1,680,000.00 Rp 1,680,000.00 Rp 0.00 Rp 1,680,000.00
# 54.55 M' Rp 69,800.00 78,176.00 Rp 49,830.00 55,809.60 Rp 133,985.60 Rp 4,264,500.80 Rp 3,044,413.68 Rp 7,308,914.48

# Notice the last 3 Rp amounts in each line:
# Rp [Total Upah] Rp [Total Bahan] Rp [Total Item]
# Let's extract all matches of:
# Rp\s*([\d,]+\.\d{2})\s+Rp\s*([\d,]+\.\d{2})\s+Rp\s*([\d,]+\.\d{2})
matches = list(re.finditer(r'Rp\s*([\d,]+\.\d{2})\s+Rp\s*([\d,]+\.\d{2})\s+Rp\s*([\d,]+\.\d{2})', table_text))
print(f"Found {len(matches)} 3-Rp blocks in table text.")

# Also let's find lines where Bahan is 0.00, e.g.:
# Rp 1,680,000.00 Rp 0.00 Rp 1,680,000.00
# which matches Rp [Total Upah] Rp [Total Bahan] Rp [Total Item]!

parsed_items_data = []
for m in matches:
    upah = float(m.group(1).replace(',', ''))
    bahan = float(m.group(2).replace(',', ''))
    total = float(m.group(3).replace(',', ''))
    # start pos of match in table_text
    start_pos = m.start()
    # get 200 chars before
    pre = table_text[max(0, start_pos - 250):start_pos]
    parsed_items_data.append({
        'upah': upah,
        'bahan': bahan,
        'total': total,
        'pre': pre
    })

print(f"Parsed {len(parsed_items_data)} item prices.")
total_sum = sum(p['total'] for p in parsed_items_data)
print(f"Sum of parsed totals: Rp {total_sum:,.2f}")
