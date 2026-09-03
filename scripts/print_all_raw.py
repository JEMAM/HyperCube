import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open("frontend/lib/cvm_real_financials.json", "r", encoding="utf-8") as f:
    real_data = json.load(f)

pine_cvm = real_data.get("20567")
ts_2025 = next(t for t in pine_cvm["time_series"] if t["period"] == "2025-12-31")

print("Total raw accounts in ts_2025:", len(ts_2025.get("raw_accounts", [])))
for a in ts_2025.get("raw_accounts", []):
    print(f"  [{a['cd_conta']}] {a['ds_conta']}: R$ {a['vl_conta']:.2f} M")
