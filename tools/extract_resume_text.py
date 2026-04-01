from pypdf import PdfReader
import sys
p = r"c:\Users\kaush\Documents\stitch portfolio 1\media\Anisha Choudhary Resume (1).pdf"
reader = PdfReader(p)
all_text = []
for i, page in enumerate(reader.pages):
    try:
        t = page.extract_text()
    except Exception as e:
        t = None
    if t:
        all_text.append(t)
text = "\n\n".join(all_text)
# Print to stdout for capture
print(text)
