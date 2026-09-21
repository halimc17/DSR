import pypdf
import json
import re

reader = pypdf.PdfReader(r'G:\My Drive\MBM\PROJECT\RS PERTAMINA PRABUMULIIH\SURAT PENAWARAN.pdf')
full_text = ""
for i, page in enumerate(reader.pages):
    full_text += f"\n--- PAGE {i+1} ---\n" + page.extract_text()

with open('prisma/rab_pdf_text.txt', 'w', encoding='utf-8') as f:
    f.write(full_text)

print(f"Extracted {len(full_text)} characters from Surat Penawaran PDF.")
