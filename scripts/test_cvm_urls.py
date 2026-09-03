import httpx

for dt in ['DFP', 'ITR']:
    for yr in [2023, 2024, 2025]:
        url = f"https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/{dt}/DADOS/{dt.lower()}_cia_aberta_{yr}.zip"
        try:
            r = httpx.head(url, timeout=15.0, follow_redirects=True)
            cl = r.headers.get("content-length", "unknown")
            if cl != "unknown":
                cl_mb = f"{int(cl) / (1024*1024):.1f} MB"
            else:
                cl_mb = "unknown"
            print(f"{dt} {yr}: HTTP {r.status_code} | Size: {cl_mb} | URL: {url}")
        except Exception as e:
            print(f"{dt} {yr}: Error: {e}")
