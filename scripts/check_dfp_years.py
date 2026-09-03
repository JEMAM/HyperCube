import httpx
import zipfile
import io

for yr in [2024, 2025]:
    url = f"https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/DFP/DADOS/dfp_cia_aberta_{yr}.zip"
    r = httpx.get(url, timeout=60.0, follow_redirects=True)
    zf = zipfile.ZipFile(io.BytesIO(r.content))
    print(f"=== DFP {yr} files ({len(r.content)/(1024*1024):.1f} MB) ===")
    for name in zf.namelist()[:6]:
        print(f"  {name}")
