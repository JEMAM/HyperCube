import httpx
import zipfile
import io

url = "https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/DFP/DADOS/dfp_cia_aberta_2024.zip"
print(f"Downloading {url}...")
r = httpx.get(url, timeout=60.0, follow_redirects=True)
print(f"Downloaded {len(r.content)/(1024*1024):.2f} MB")

zf = zipfile.ZipFile(io.BytesIO(r.content))
for name in zf.namelist():
    info = zf.getinfo(name)
    print(f"  {name} ({info.file_size / (1024*1024):.2f} MB uncompressed)")
