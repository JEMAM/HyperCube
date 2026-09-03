import fitz

doc = fitz.open(r"C:\Users\edumo\Documents\cvc_2024-2025.pdf")

# Let's inspect pages 18, 19, 20, 21, 22, 23, 24 (0-indexed: 17 to 23)
for page_num in range(17, 24):
    print(f"==================================================")
    print(f"=== PAGE {page_num + 1} ===")
    print(f"==================================================")
    text = doc[page_num].get_text("text")
    print(text)
