import pypdf

reader = pypdf.PdfReader('../Business-Proposal-Documentation Updated.pdf')

with open('scripts/proposal_summary.txt', 'w', encoding='utf-8') as f:
    for i in range(min(25, len(reader.pages))):
        f.write(f"\n--- PAGE {i+1} ---\n")
        f.write(reader.pages[i].extract_text() or '')

print("Extracted pages 1-25 to scripts/proposal_summary.txt")
