import re, zlib, os

def analyze_pdf(path):
    print("=== Analyzing:", path)
    if not os.path.exists(path):
        print("Not found:", path)
        return
    with open(path, 'rb') as f:
        data = f.read()
    print("Size:", len(data))
    
    # Try decompressing streams
    text_pieces = []
    stream_matches = list(re.finditer(rb'stream[\r\n]+(.*?)[\r\n]+endstream', data, re.DOTALL))
    print("Stream count:", len(stream_matches))
    for sm in stream_matches:
        raw_stream = sm.group(1)
        try:
            decomp = zlib.decompress(raw_stream)
        except:
            decomp = raw_stream
        
        # search for text
        # (text) Tj
        for tj in re.finditer(rb'\(([^\)\\]*(?:\\.[^\)\\]*)*)\)\s*Tj', decomp):
            try:
                text_pieces.append(tj.group(1).decode('latin1'))
            except:
                pass
        for tj_arr in re.finditer(rb'\[(.*?)\]\s*TJ', decomp):
            for part in re.finditer(rb'\(([^\)\\]*(?:\\.[^\)\\]*)*)\)', tj_arr.group(1)):
                try:
                    text_pieces.append(part.group(1).decode('latin1'))
                except:
                    pass
    
    full_text = ' '.join(text_pieces)
    print("Extracted text length:", len(full_text))
    if len(full_text) > 0:
        with open('extracted_' + os.path.basename(path) + '.txt', 'w', encoding='utf-8') as out:
            out.write(full_text)
        
        # Scan for interesting terms
        for kw in ['%', 'percent', 'fee', 'commission', 'revenue', 'take', 'share', 'pricing', 'subscription', 'transaction']:
            matches = [m.start() for m in re.finditer(r'\b' + re.escape(kw), full_text, re.IGNORECASE)]
            print(f"Keyword '{kw}': {len(matches)} matches")
            for idx in matches[:5]:
                print("   ...", full_text[max(0, idx-60):min(len(full_text), idx+100)].replace('\n', ' '), "...")

analyze_pdf(r'../Revised-Business-Proposal-Documentation-Format.pdf')
analyze_pdf(r'../Business-Proposal-Documentation Updated.pdf')
