import fitz

doc = fitz.open(r"C:\Users\edumo\Documents\cvc_2024-2025.pdf")

with open("scripts/cvc_pdf_clean.txt", "w", encoding="utf-8") as f:
    for page_num in range(17, 24):
        f.write(f"\n==================================================\n")
        f.write(f"=== PAGE {page_num + 1} (PDF Page) ===\n")
        f.write(f"==================================================\n")
        text = doc[page_num].get_text("text")
        f.write(text)

print("Saved clean UTF-8 extracted statements to scripts/cvc_pdf_clean.txt")
