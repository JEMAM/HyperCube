import urllib.request
import json

base = "http://localhost:3000/api"
endpoints = ["bp/table", "bp/kpis", "bp/dag", "bp/agent/explain"]

for ep in endpoints:
    url = f"{base}/{ep}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "HyperCube-Test"})
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.status
            data = json.loads(response.read().decode("utf-8"))
            print(f"[{status}] GET {url}")
            if "rows" in data:
                print(f"   -> Rows: {len(data['rows'])}, Company: {data.get('company', {}).get('name')}")
            elif "summary" in data and isinstance(data["summary"], dict):
                print(f"   -> KPIs periods: {data.get('periods')}, Latest: {data.get('latest_period')}")
                print(f"   -> Liquidez Corrente: {data['summary'].get('liquidez', {}).get('corrente')}x")
                print(f"   -> Fleuriet Badge: {data['summary'].get('fleuriet', {}).get('badge')}, ST: R$ {data['summary'].get('fleuriet', {}).get('st')} M")
                print(f"   -> Endividamento Geral: {data['summary'].get('endividamento', {}).get('geral_pct')}%")
                print(f"   -> ROE: {data['summary'].get('dupont_rentabilidade', {}).get('roe')}%")
            elif "nodes" in data:
                print(f"   -> DAG Nodes: {len(data['nodes'])}, Edges: {len(data['edges'])}")
            elif "summary" in data and isinstance(data["summary"], str):
                print(f"   -> Explain snippet: {data['summary'][:70]}...")
    except Exception as e:
        print(f"[ERR] GET {url}: {e}")
