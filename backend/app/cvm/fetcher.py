"""
Asynchronous HTTP fetcher and Polars streaming parser for CVM Open Data Portal.
"""
import asyncio
import io
import time
import httpx
import polars as pl
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple
from backend.app.cvm.config import (
    USER_AGENT, REQUEST_TIMEOUT, RATE_LIMIT_DELAY, MAX_RETRIES, 
    BACKOFF_FACTOR, CACHE_DIR, CVM_CAD_CIA_URL
)

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

cvm_fetcher = CVMFetcher()
