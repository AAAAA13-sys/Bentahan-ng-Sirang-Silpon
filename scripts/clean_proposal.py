import pypdf, re

reader = pypdf.PdfReader('../Business-Proposal-Documentation Updated.pdf')

full_text = []
for i, page in enumerate(reader.pages):
    raw = page.extract_text() or ''
    # collapse multiple whitespace/newlines
    cleaned = re.sub(r'\s+', ' ', raw).strip()
    full_text.append(f"=== PAGE {i+1} ===\n{cleaned}")

all_doc = '\n\n'.join(full_text)
with open('scripts/cleaned_proposal.txt', 'w', encoding='utf-8') as f:
    f.write(all_doc)

print(f"Cleaned {len(reader.pages)} pages, total chars: {len(all_doc)}")

# Let's search for Problem, Solution, Opportunity, Value, Benefits, Why
for term in ['Problem', 'Executive Summary', 'Value Proposition', 'Opportunity', 'Advantage', 'Beneficiaries', 'Objectives', 'Market Need']:
    print(f"\n--- Matches for {term} ---")
    for m in re.finditer(r'(' + re.escape(term) + r'[^.\n]{0,100}\..{0,300})', all_doc, re.IGNORECASE):
        print("  ->", m.group(1)[:200])
