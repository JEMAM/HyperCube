"""
Asynchronous HTTP fetcher and Polars streaming parser for CVM Open Data Portal.
"""
import asyncio
import io
import time
import zipfile
import httpx
import polars as pl
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple
from backend.app.cvm.config import (
    USER_AGENT, REQUEST_TIMEOUT, RATE_LIMIT_DELAY, MAX_RETRIES, 
    BACKOFF_FACTOR, CACHE_DIR, CVM_CAD_CIA_URL
)
from backend.app.cvm.normalizer import normalize_account_code

class CVMFetcher:
    def __init__(self):
        self.last_request_time = 0.0
        self.etags: Dict[str, str] = {}

    async def _rate_limit(self):
        """Enforces a minimum interval between outgoing HTTP requests (politeness)."""
        elapsed = time.time() - self.last_request_time
        if elapsed < RATE_LIMIT_DELAY:
            await asyncio.sleep(RATE_LIMIT_DELAY - elapsed)
        self.last_request_time = time.time()

    async def fetch_url(self, url: str, headers: Optional[Dict[str, str]] = None) -> Tuple[Optional[bytes], int, Dict[str, str]]:
        """
        Fetches content from a URL with retries, exponential backoff, and ETag support.
        """
        req_headers = {"User-Agent": USER_AGENT}
        if headers:
            req_headers.update(headers)

        if url in self.etags:
            req_headers["If-None-Match"] = self.etags[url]

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                await self._rate_limit()
                timeout_config = httpx.Timeout(3.0, connect=2.0)
                async with httpx.AsyncClient(timeout=timeout_config, follow_redirects=True) as client:
                    response = await client.get(url, headers=req_headers)
                    
                    if response.status_code == 304:
                        return None, 304, dict(response.headers)
                    
                    if response.status_code in (200, 206):
                        if "etag" in response.headers:
                            self.etags[url] = response.headers["etag"]
                        return response.content, response.status_code, dict(response.headers)
                    
                    if response.status_code in (429, 500, 502, 503, 504):
                        wait_time = (BACKOFF_FACTOR ** attempt)
                        await asyncio.sleep(wait_time)
                        continue
                    
                    return None, response.status_code, dict(response.headers)
            except Exception as e:
                if attempt == MAX_RETRIES:
                    return None, 500, {"error": str(e)}
                await asyncio.sleep(0.5)

        return None, 500, {"error": "Max retries exceeded"}

    async def fetch_cad_cia_aberta(self) -> List[Dict[str, Any]]:
        """
        Fetches and parses the official CVM company registry (cad_cia_aberta.csv).
        """
        content, status, _ = await self.fetch_url(CVM_CAD_CIA_URL)
        if not content or status not in (200, 304):
            return []

        try:
            # Parse CSV with Polars
            df = pl.read_csv(
                io.BytesIO(content),
                separator=";",
                encoding="iso-8859-1",
                infer_schema_length=1000,
                truncate_ragged_lines=True
            )

            # Filter for active listed companies
            if "SIT" in df.columns:
                df = df.filter(pl.col("SIT") == "ATIVO")

            companies = []
            for row in df.iter_rows(named=True):
                cod_cvm_raw = row.get("CD_CVM")
                if cod_cvm_raw is None:
                    continue
                try:
                    cod_cvm = int(cod_cvm_raw)
                except (ValueError, TypeError):
                    continue

                companies.append({
                    "cod_cvm": cod_cvm,
                    "cnpj": str(row.get("CNPJ_CIA") or ""),
                    "denom_social": str(row.get("DENOM_SOCIAL") or ""),
                    "nome_pregao": str(row.get("DENOM_COMERC") or row.get("DENOM_SOCIAL") or ""),
                    "categoria": str(row.get("TP_MERC") or "Categoria A"),
                    "situacao": str(row.get("SIT") or "ATIVO"),
                    "setor": str(row.get("SETOR_ATIV") or "Outros"),
                    "uf": str(row.get("UF") or ""),
                    "codigo_cvm_str": str(cod_cvm).zfill(6)
                })

            return companies
        except Exception as err:
            return []

    def parse_financial_csv_bytes(self, content: bytes, tipo: str = "ITR") -> List[Dict[str, Any]]:
        """
        Parses a CVM DRE/BPA/DFC CSV in memory using Polars streaming/fast read.
        """
        try:
            df = pl.read_csv(
                io.BytesIO(content),
                separator=";",
                encoding="iso-8859-1",
                infer_schema_length=5000,
                truncate_ragged_lines=True
            )

            # Standard CVM column aliases
            cols = {c.upper(): c for c in df.columns}
            cd_cvm_col = cols.get("CD_CVM")
            dt_refer_col = cols.get("DT_REFER")
            cd_conta_col = cols.get("CD_CONTA")
            ds_conta_col = cols.get("DS_CONTA")
            vl_conta_col = cols.get("VL_CONTA")
            ordem_col = cols.get("ORDEM_EXERC")

            if not (cd_cvm_col and dt_refer_col and cd_conta_col and vl_conta_col):
                return []

            if ordem_col and ordem_col in df.columns:
                df = df.filter(pl.col(ordem_col).is_in(["ÚLTIMO", "ULTIMO", "PENÚLTIMO"]))

            records = []
            for row in df.iter_rows(named=True):
                cod_cvm = int(row[cd_cvm_col])
                dt_refer = str(row[dt_refer_col])
                cd_conta = str(row[cd_conta_col])
                ds_conta = str(row.get(ds_conta_col, ""))
                vl_raw = row[vl_conta_col]
                
                try:
                    if isinstance(vl_raw, str):
                        vl_clean = float(vl_raw.replace(".", "").replace(",", "."))
                    else:
                        vl_clean = float(vl_raw)
                except Exception:
                    vl_clean = 0.0

                records.append({
                    "cod_cvm": cod_cvm,
                    "dt_refer": dt_refer,
                    "tipo": tipo,
                    "cd_conta": cd_conta,
                    "ds_conta": ds_conta,
                    "vl_conta": vl_clean
                })
            return records
        except Exception:
            return []

    def download_and_cache_cvm_zip(self, year: int, doc_type: str = "DFP") -> Optional[Path]:
        """
        Downloads official CVM annual (DFP) or quarterly (ITR) bulk zip file and stores it in local cache.
        Skips download if a non-empty cache file less than 7 days old is already present.
        """
        doc_type_upper = doc_type.upper()
        doc_type_lower = doc_type.lower()
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        cached_zip = CACHE_DIR / f"{doc_type_lower}_cia_aberta_{year}.zip"

        if cached_zip.exists() and cached_zip.stat().st_size > 100000:
            age_seconds = time.time() - cached_zip.stat().st_mtime
            if age_seconds < 7 * 86400:
                return cached_zip

        url = f"https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/{doc_type_upper}/DADOS/{doc_type_lower}_cia_aberta_{year}.zip"
        req_headers = {"User-Agent": USER_AGENT}

        try:
            with httpx.Client(timeout=45.0, follow_redirects=True) as client:
                resp = client.get(url, headers=req_headers)
                if resp.status_code == 200 and len(resp.content) > 100000:
                    with open(cached_zip, "wb") as f:
                        f.write(resp.content)
                    return cached_zip
                elif resp.status_code == 304 and cached_zip.exists():
                    return cached_zip
        except Exception as e:
            print(f"[CVM Fetcher] Warning downloading {url}: {e}")
            if cached_zip.exists() and cached_zip.stat().st_size > 100000:
                return cached_zip
        return None if not cached_zip.exists() else cached_zip

    def extract_company_financials_from_zip(
        self,
        zip_path: Path,
        cod_cvm: int,
        doc_type: str = "DFP",
        is_financial: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Extracts official financial statement rows for a given cod_cvm directly from a CVM zip package.
        Supports DRE, BPA, BPP, and DFC, converting ESCALA_MOEDA into R$ Milhões.
        """
        if not zip_path or not zip_path.exists():
            return []

        records = []
        try:
            with zipfile.ZipFile(zip_path, "r") as zf:
                all_names = zf.namelist()
                # Target strictly core statement consolidated CSV files (DRE, BPA, BPP, DFC)
                target_csvs = [
                    n for n in all_names 
                    if n.endswith(".csv") and any(k in n for k in ["_DRE_con_", "_BPA_con_", "_BPP_con_", "_DFC_MD_con_", "_DFC_MI_con_"])
                ]

                # Fallback if no _con_ tag found
                if not target_csvs:
                    target_csvs = [
                        n for n in all_names 
                        if n.endswith(".csv") and any(k in n for k in ["_DRE_", "_BPA_", "_BPP_", "_DFC_"]) and "_ind_" not in n and "_DVA_" not in n and "_DMPL_" not in n and "_DRA_" not in n
                    ]

                for csv_name in target_csvs:
                    try:
                        with zf.open(csv_name) as f:
                            content = f.read()
                            df = pl.read_csv(
                                io.BytesIO(content),
                                separator=";",
                                encoding="iso-8859-1",
                                truncate_ragged_lines=True
                            )
                    except Exception:
                        continue

                    if "CD_CVM" not in df.columns or "CD_CONTA" not in df.columns or "VL_CONTA" not in df.columns:
                        continue

                    sub = df.filter(pl.col("CD_CVM") == cod_cvm)
                    if len(sub) == 0:
                        continue

                    if "ORDEM_EXERC" in sub.columns:
                        sub_ultimo = sub.filter(pl.col("ORDEM_EXERC").is_in(["ÚLTIMO", "ULTIMO"]))
                        if len(sub_ultimo) > 0:
                            sub = sub_ultimo

                    # Determine currency scale
                    escala = "MIL"
                    if "ESCALA_MOEDA" in sub.columns and len(sub) > 0:
                        raw_escala = str(sub["ESCALA_MOEDA"][0] or "").upper()
                        if "UNIDADE" in raw_escala:
                            escala = "UNIDADE"
                        elif "MILH" in raw_escala:
                            escala = "MILHAO"

                    scale_divisor = 1000.0 if escala == "MIL" else (1000000.0 if escala == "UNIDADE" else 1.0)

                    # Auto-detect if company is a financial institution based on statement accounts
                    company_is_fin = is_financial
                    if not company_is_fin:
                        for row in sub.iter_rows(named=True):
                            ds_lower = str(row.get("DS_CONTA") or "").lower()
                            if "intermediação" in ds_lower or "intermediacao" in ds_lower:
                                company_is_fin = True
                                break

                    for row in sub.iter_rows(named=True):
                        cd = str(row.get("CD_CONTA") or "").strip()
                        ds = str(row.get("DS_CONTA") or "").strip()
                        raw_vl = row.get("VL_CONTA")
                        try:
                            vl_clean = round(float(raw_vl) / scale_divisor, 2)
                        except (ValueError, TypeError):
                            vl_clean = 0.0

                        dt_refer = str(row.get("DT_REFER") or "")
                        canonical = normalize_account_code(cd, ds, is_financial=company_is_fin)

                        records.append({
                            "cod_cvm": cod_cvm,
                            "dt_refer": dt_refer,
                            "tipo": doc_type.upper(),
                            "cd_conta": cd,
                            "ds_conta": ds,
                            "vl_conta": vl_clean,
                            "conta_canonical": canonical
                        })
        except Exception as ex:
            print(f"[CVM Fetcher] Error extracting from {zip_path}: {ex}")

        return records

    def fetch_official_company_financials(
        self,
        cod_cvm: int,
        years: Optional[List[int]] = None,
        is_financial: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Downloads relevant official CVM zip files and extracts all financial statement rows for the specified company.
        """
        years = years or [2023, 2024, 2025]
        all_records = []

        for yr in years:
            for doc_type in ["DFP", "ITR"]:
                zip_path = self.download_and_cache_cvm_zip(yr, doc_type)
                if zip_path:
                    recs = self.extract_company_financials_from_zip(zip_path, cod_cvm, doc_type, is_financial)
                    all_records.extend(recs)

        return all_records

cvm_fetcher = CVMFetcher()

