"""
High-throughput streaming ingestion engine for official CVM Open Data bulk packages.
Downloads annual (DFP) and quarterly (ITR) ZIP packages from dados.cvm.gov.br,
parses all consolidated financial statements (DRE, BPA, BPP, DFC) using Polars,
normalizes account structures into canonical representations, and ingests them into DuckDB.
"""
import io
import time
import zipfile
from pathlib import Path
from typing import List, Dict, Any, Optional, Set, Tuple
import httpx
import polars as pl

from backend.app.cvm.config import (
    CACHE_DIR, DB_PATH, USER_AGENT
)
from backend.app.cvm.database import cvm_db
from backend.app.cvm.normalizer import normalize_account_code

CVM_DFP_URL_TEMPLATE = "https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/DFP/DADOS/dfp_cia_aberta_{year}.zip"
CVM_ITR_URL_TEMPLATE = "https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/ITR/DADOS/itr_cia_aberta_{year}.zip"

class CVMDataStreamer:
    def __init__(self, cache_dir: Optional[Path] = None):
        self.cache_dir = cache_dir or CACHE_DIR
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def download_package(self, year: int, doc_type: str = "DFP", timeout_secs: float = 90.0) -> Optional[Path]:
        """Downloads official CVM bulk ZIP file with local caching."""
        doc_type_upper = doc_type.upper()
        doc_type_lower = doc_type.lower()
        cached_zip = self.cache_dir / f"{doc_type_lower}_cia_aberta_{year}.zip"

        # Check existing valid cache (> 5 MB and not empty)
        if cached_zip.exists() and cached_zip.stat().st_size > 5_000_000:
            print(f"[CVM Streamer] Using cached package: {cached_zip.name} ({cached_zip.stat().st_size / (1024*1024):.1f} MB)", flush=True)
            return cached_zip

        url = (CVM_DFP_URL_TEMPLATE if doc_type_upper == "DFP" else CVM_ITR_URL_TEMPLATE).format(year=year)
        print(f"[CVM Streamer] Downloading {doc_type_upper} {year} from {url}...", flush=True)

        req_headers = {"User-Agent": USER_AGENT}
        start_t = time.time()
        try:
            with httpx.Client(timeout=timeout_secs, follow_redirects=True) as client:
                resp = client.get(url, headers=req_headers)
                if resp.status_code == 200 and len(resp.content) > 500_000:
                    with open(cached_zip, "wb") as f:
                        f.write(resp.content)
                    elapsed = time.time() - start_t
                    print(f"[CVM Streamer] Downloaded {cached_zip.name} ({len(resp.content) / (1024*1024):.1f} MB in {elapsed:.1f}s)", flush=True)
                    return cached_zip
                else:
                    print(f"[CVM Streamer] Warning: HTTP {resp.status_code} for {url}", flush=True)
        except Exception as e:
            print(f"[CVM Streamer] Error downloading {url}: {e}", flush=True)

        return cached_zip if (cached_zip.exists() and cached_zip.stat().st_size > 1_000_000) else None

    def process_zip_statements(
        self,
        zip_path: Path,
        doc_type: str = "DFP",
        target_cod_cvms: Optional[Set[int]] = None
    ) -> List[Dict[str, Any]]:
        """
        Parses all consolidated financial statement CSVs from a CVM bulk ZIP file using Polars.
        Extracts DRE, BPA, BPP and DFC, normalizes scale, and returns canonical records.
        """
        if not zip_path or not zip_path.exists():
            return []

        all_records: List[Dict[str, Any]] = []
        start_t = time.time()
        print(f"[CVM Streamer] Parsing statements from {zip_path.name} with Polars...", flush=True)

        try:
            with zipfile.ZipFile(zip_path, "r") as zf:
                namelist = zf.namelist()
                # Target Consolidated core statements
                target_csvs = [
                    n for n in namelist
                    if n.endswith(".csv") and any(k in n for k in ["_DRE_con_", "_BPA_con_", "_BPP_con_", "_DFC_MI_con_"])
                ]

                # If no _con_ files matched, fallback to general non-ind files
                if not target_csvs:
                    target_csvs = [
                        n for n in namelist
                        if n.endswith(".csv") and any(k in n for k in ["_DRE_", "_BPA_", "_BPP_", "_DFC_"])
                        and "_ind_" not in n and "_DVA_" not in n and "_DMPL_" not in n and "_DRA_" not in n
                    ]

                for csv_name in target_csvs:
                    try:
                        with zf.open(csv_name) as f:
                            raw_bytes = f.read()

                        # Read with Polars (high performance)
                        df = pl.read_csv(
                            io.BytesIO(raw_bytes),
                            separator=";",
                            encoding="iso-8859-1",
                            truncate_ragged_lines=True,
                            ignore_errors=True
                        )
                    except Exception as parse_err:
                        print(f"[CVM Streamer] Warning reading {csv_name}: {parse_err}")
                        continue

                    # Column validation
                    cols = {c.upper(): c for c in df.columns}
                    cd_cvm_col = cols.get("CD_CVM")
                    dt_refer_col = cols.get("DT_REFER")
                    cd_conta_col = cols.get("CD_CONTA")
                    ds_conta_col = cols.get("DS_CONTA")
                    vl_conta_col = cols.get("VL_CONTA")
                    ordem_col = cols.get("ORDEM_EXERC")
                    escala_col = cols.get("ESCALA_MOEDA")

                    if not (cd_cvm_col and dt_refer_col and cd_conta_col and vl_conta_col):
                        continue

                    # Filter for latest exercise order if present
                    if ordem_col and ordem_col in df.columns:
                        df = df.filter(pl.col(ordem_col).is_in(["ÚLTIMO", "ULTIMO"]))

                    # If target companies specified, filter early
                    if target_cod_cvms:
                        df = df.filter(pl.col(cd_cvm_col).cast(pl.Int64, strict=False).is_in(list(target_cod_cvms)))

                    if len(df) == 0:
                        continue

                    # Detect statement type from filename
                    stmt_type = "DRE"
                    if "_BPA_" in csv_name:
                        stmt_type = "BPA"
                    elif "_BPP_" in csv_name:
                        stmt_type = "BPP"
                    elif "_DFC_" in csv_name:
                        stmt_type = "DFC"

                    # Group processing by company to identify financial institution accounts
                    companies_in_df = df.select([cd_cvm_col]).unique().to_series().to_list()

                    for code_val in companies_in_df:
                        if code_val is None:
                            continue
                        try:
                            cod_cvm = int(code_val)
                        except Exception:
                            continue

                        sub = df.filter(pl.col(cd_cvm_col) == code_val)
                        if len(sub) == 0:
                            continue

                        # Detect financial institution
                        is_financial = False
                        if stmt_type == "DRE":
                            for row in sub.select([ds_conta_col]).iter_rows():
                                ds_val = str(row[0] or "").lower()
                                if "intermediação" in ds_val or "intermediacao" in ds_val or "operações de crédito" in ds_val:
                                    is_financial = True
                                    break

                        # Scale divisor to normalize to R$ Milhões
                        scale_divisor = 1000.0  # Default CVM is in Thousands (R$ Mil)
                        if escala_col and escala_col in sub.columns:
                            raw_scale = str(sub[escala_col][0] or "").upper()
                            if "UNIDADE" in raw_scale:
                                scale_divisor = 1_000_000.0
                            elif "MILH" in raw_scale:
                                scale_divisor = 1.0

                        for row in sub.iter_rows(named=True):
                            cd = str(row.get(cd_conta_col) or "").strip()
                            ds = str(row.get(ds_conta_col) or "").strip()
                            dt_ref = str(row.get(dt_refer_col) or "").strip()
                            raw_vl = row.get(vl_conta_col)

                            try:
                                if isinstance(raw_vl, str):
                                    vl_f = float(raw_vl.replace(".", "").replace(",", "."))
                                else:
                                    vl_f = float(raw_vl)
                                vl_milhoes = round(vl_f / scale_divisor, 2)
                            except Exception:
                                vl_milhoes = 0.0

                            canonical = normalize_account_code(cd, ds, is_financial=is_financial)

                            all_records.append({
                                "cod_cvm": cod_cvm,
                                "dt_refer": dt_ref,
                                "tipo": doc_type.upper(),
                                "cd_conta": cd,
                                "ds_conta": ds,
                                "vl_conta": vl_milhoes,
                                "conta_canonical": canonical
                            })

            elapsed = time.time() - start_t
            print(f"[CVM Streamer] Finished {zip_path.name}: {len(all_records):,} rows extracted in {elapsed:.1f}s", flush=True)
        except Exception as ex:
            print(f"[CVM Streamer] Critical error processing {zip_path}: {ex}", flush=True)

        return all_records

    def sync_all_companies(
        self,
        years: Optional[List[int]] = None,
        doc_types: Optional[List[str]] = None,
        batch_size: int = 50_000
    ) -> Dict[str, Any]:
        """
        Executes full bulk synchronization of all CVM companies:
        1. Downloads DFP and ITR bulk zip packages for specified years.
        2. Streams and normalizes consolidated statements.
        3. Upserts records into DuckDB table `cvm_financials` in high-throughput chunks.
        4. Updates watchdog status and company filings.
        """
        years = years or [2023, 2024, 2025]
        doc_types = doc_types or ["DFP", "ITR"]

        total_extracted = 0
        total_ingested = 0
        companies_updated: Set[int] = set()
        start_all = time.time()

        print(f"==================================================================", flush=True)
        print(f"[CVM Streamer] Starting Bulk Synchronization for years {years} ({doc_types})", flush=True)
        print(f"==================================================================", flush=True)

        # 1. Update active company list from CVM cad_cia_aberta first
        try:
            from backend.app.cvm.fetcher import cvm_fetcher
            import asyncio
            asyncio.run(cvm_fetcher.fetch_cad_cia_aberta())
        except Exception as reg_err:
            print(f"[CVM Streamer] Note on registry sync: {reg_err}")

        # 2. Process each package
        for year in years:
            for dt in doc_types:
                zip_path = self.download_package(year, doc_type=dt)
                if not zip_path or not zip_path.exists():
                    print(f"[CVM Streamer] Skipping {dt} {year} (package not available)")
                    continue

                records = self.process_zip_statements(zip_path, doc_type=dt)
                if not records:
                    continue

                total_extracted += len(records)
                pkg_companies = {r["cod_cvm"] for r in records}
                companies_updated.update(pkg_companies)

                # Instantaneous Arrow / DuckDB batch upsert
                print(f"[CVM Streamer] Ingesting {len(records):,} rows into DuckDB using Arrow zero-copy...", flush=True)
                df_records = pl.DataFrame(records)
                cvm_db.upsert_financials_df(df_records)
                total_ingested += len(records)

                # Register filings
                filings = []
                distinct_combos = {(r["cod_cvm"], r["dt_refer"]) for r in records}
                for cod, d_ref in distinct_combos:
                    f_id = f"{cod}_{dt}_{d_ref.replace('-', '')}_1"
                    filings.append({
                        "id": f_id,
                        "cod_cvm": cod,
                        "tipo": dt,
                        "dt_refer": d_ref,
                        "dt_entrega": d_ref,
                        "versao": 1,
                        "url_documento": f"https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/{dt}/DADOS/{dt.lower()}_cia_aberta_{d_ref[:4]}.zip",
                        "status": "LOADED"
                    })
                cvm_db.upsert_filings(filings)

        elapsed_total = time.time() - start_all
        cvm_db.update_watch_status(
            status="IDLE",
            detected=len(companies_updated),
            loaded=total_ingested,
            error=None
        )

        summary = {
            "status": "SUCCESS",
            "years_processed": years,
            "doc_types": doc_types,
            "companies_synced": len(companies_updated),
            "rows_extracted": total_extracted,
            "rows_ingested": total_ingested,
            "elapsed_seconds": round(elapsed_total, 2)
        }

        print(f"==================================================================", flush=True)
        print(f"[CVM Streamer] Sync Complete: {len(companies_updated)} companies, {total_ingested:,} rows in {elapsed_total:.1f}s", flush=True)
        print(f"==================================================================", flush=True)
        return summary

cvm_streamer = CVMDataStreamer()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="HyperCube CVM Bulk Data Streamer")
    parser.add_argument("--years", nargs="+", type=int, default=[2024, 2025], help="Years to sync (default: 2024 2025)")
    parser.add_argument("--types", nargs="+", type=str, default=["DFP"], help="Types to sync (default: DFP)")
    args = parser.parse_args()

    cvm_streamer.sync_all_companies(years=args.years, doc_types=args.types)
