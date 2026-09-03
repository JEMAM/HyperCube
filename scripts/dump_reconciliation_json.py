import fitz
import json

doc = fitz.open(r"C:\Users\edumo\Documents\cvc_2024-2025.pdf")

# Page 20: DRE (Consolidado & Controladora)
dre_text = doc[19].get_text("text")

# Page 18 & 19: BP
bp_ativo_text = doc[17].get_text("text")
bp_passivo_text = doc[18].get_text("text")

# Page 23: DFC
dfc_text = doc[22].get_text("text")

# Page 24: DVA
dva_text = doc[23].get_text("text")

with open("scripts/cvc_reconciliation_raw.json", "w", encoding="utf-8") as f:
    json.dump({
        "dre": dre_text,
        "bp_ativo": bp_ativo_text,
        "bp_passivo": bp_passivo_text,
        "dfc": dfc_text,
        "dva": dva_text
    }, f, ensure_ascii=False, indent=2)

print("Saved raw statements json")
