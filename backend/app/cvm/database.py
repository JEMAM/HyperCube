"""
DuckDB persistence layer for CVM companies, filings, and canonical financials.
"""
import duckdb
from datetime import datetime, date
from typing import List, Dict, Any, Optional
from backend.app.cvm.config import DB_PATH
from backend.app.cvm.normalizer import normalize_sector

class CVMDatabase:
    def __init__(self, db_path: Optional[str] = None):
        self.db_path = str(db_path or DB_PATH)
        try:
            self.conn = duckdb.connect(self.db_path)
            self._init_schema()
            self._seed_default_companies_if_empty()
            self._sanitize_existing_sectors()
        except Exception as e:
            try:
                # Try read-only if locked by another process
                self.conn = duckdb.connect(self.db_path, read_only=True)
            except Exception:
                # Fallback to in-memory instance
                self.conn = duckdb.connect(":memory:")
                self._init_schema()
                self._seed_default_companies_if_empty()
                self._sanitize_existing_sectors()

    def get_connection(self):
        return self.conn

    def _init_schema(self):
        """Creates the DuckDB tables required by the CVM module."""
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS cvm_companies (
                cod_cvm INTEGER PRIMARY KEY,
                cnpj VARCHAR,
                denom_social VARCHAR,
                nome_pregao VARCHAR,
                categoria VARCHAR,
                situacao VARCHAR,
                setor VARCHAR,
                uf VARCHAR,
                codigo_cvm_str VARCHAR
            );
        """)

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS cvm_filings (
                id VARCHAR PRIMARY KEY,
                cod_cvm INTEGER,
                tipo VARCHAR,
                dt_refer DATE,
                dt_entrega DATE,
                versao INTEGER,
                url_documento VARCHAR,
                status VARCHAR DEFAULT 'NEW'
            );
        """)

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS cvm_financials (
                cod_cvm INTEGER,
                dt_refer DATE,
                tipo VARCHAR,
                cd_conta VARCHAR,
                ds_conta VARCHAR,
                vl_conta DOUBLE,
                conta_canonical VARCHAR,
                PRIMARY KEY (cod_cvm, dt_refer, tipo, cd_conta)
            );
        """)

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS cvm_watch_status (
                id INTEGER PRIMARY KEY,
                last_run TIMESTAMP,
                status VARCHAR,
                filings_detected INTEGER,
                filings_loaded INTEGER,
                last_error VARCHAR
            );
        """)

    def _sanitize_existing_sectors(self):
        """Sanitizes and normalizes any existing sectors already present in the database."""
        try:
            rows = self.conn.execute("SELECT cod_cvm, setor FROM cvm_companies WHERE setor IS NOT NULL").fetchall()
            for cod_cvm, raw_setor in rows:
                clean_sec = normalize_sector(raw_setor)
                if clean_sec != raw_setor:
                    self.conn.execute("UPDATE cvm_companies SET setor = ? WHERE cod_cvm = ?", [clean_sec, cod_cvm])
            # Ensure filings have the valid /DOC/ path in CVM Open Data portal
            self.conn.execute("""
                UPDATE cvm_filings 
                SET url_documento = REPLACE(url_documento, 'CIA_ABERTA/', 'CIA_ABERTA/DOC/') 
                WHERE url_documento LIKE '%dados.cvm.gov.br/dados/CIA_ABERTA/%' 
                  AND url_documento NOT LIKE '%/DOC/%'
            """)
        except Exception:
            pass

    def _seed_default_companies_if_empty(self):
        """Seeds standard flagship Brazilian listed companies if table is currently empty."""
        count = self.conn.execute("SELECT COUNT(*) FROM cvm_companies").fetchone()[0]
        if count > 0:
            return

        seeds = [
            (9512, "33.000.167/0001-01", "PETROLEO BRASILEIRO S.A. PETROBRAS", "PETROBRAS", "Categoria A", "ATIVO", "Petróleo, Gás e Biocombustíveis", "RJ", "009512"),
            (4170, "33.592.510/0001-54", "VALE S.A.", "VALE", "Categoria A", "ATIVO", "Mineração e Metalurgia", "RJ", "004170"),
            (1023, "00.000.000/0001-91", "BANCO DO BRASIL S.A.", "BANCO DO BRASIL", "Categoria A", "ATIVO", "Intermediários Financeiros / Bancos", "DF", "001023"),
            (19348, "02.387.241/0001-60", "ITAU UNIBANCO HOLDING S.A.", "ITAU UNIBANCO", "Categoria A", "ATIVO", "Intermediários Financeiros / Bancos", "SP", "019348"),
            (23264, "07.526.557/0001-00", "AMBEV S.A.", "AMBEV S.A.", "Categoria A", "ATIVO", "Bebidas e Alimentos", "SP", "023264"),
            (21903, "59.291.534/0001-67", "GRUPO CASAS BAHIA S.A.", "CASAS BAHIA", "Categoria A", "ATIVO", "Comércio Varejista", "SP", "021903"),
            (22470, "47.960.950/0001-21", "MAGAZINE LUIZA S.A.", "MAGAZINE LUIZA", "Categoria A", "ATIVO", "Comércio Varejista", "SP", "022470"),
            (5410, "84.429.695/0001-11", "WEG S.A.", "WEG", "Categoria A", "ATIVO", "Máquinas e Equipamentos", "SC", "005410"),
            (18325, "60.643.289/0001-71", "EMBRAER S.A.", "EMBRAER", "Categoria A", "ATIVO", "Material de Transporte / Aeroespacial", "SP", "018325"),
            (16454, "16.404.287/0001-55", "SUZANO S.A.", "SUZANO S.A.", "Categoria A", "ATIVO", "Papel e Celulose", "BA", "016454"),
            (20257, "02.474.103/0001-19", "LOCALIZA RENT A CAR S.A.", "LOCALIZA", "Categoria A", "ATIVO", "Aluguel de Carros / Serviços", "MG", "020257"),
            (24376, "06.057.223/0001-71", "B3 S.A. - BRASIL, BOLSA, BALCAO", "B3", "Categoria A", "ATIVO", "Serviços Financeiros Diversos", "SP", "024376"),
            (20982, "02.558.157/0001-62", "EQUATORIAL ENERGIA S.A.", "EQUATORIAL", "Categoria A", "ATIVO", "Energia Elétrica", "DF", "020982"),
            (26034, "00.776.574/0001-56", "VIBRA ENERGIA S.A.", "VIBRA", "Categoria A", "ATIVO", "Distribuição de Combustíveis", "RJ", "026034"),
            (24295, "02.808.708/0001-07", "RAIADROGASIL S.A.", "RAIADROGASIL", "Categoria A", "ATIVO", "Comércio / Farmácias", "SP", "024295")
        ]

        self.conn.executemany("""
            INSERT OR REPLACE INTO cvm_companies 
            (cod_cvm, cnpj, denom_social, nome_pregao, categoria, situacao, setor, uf, codigo_cvm_str)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [(s[0], s[1], s[2], s[3], s[4], s[5], normalize_sector(s[6]), s[7], s[8]) for s in seeds])

        # Seed initial watch status
        self.conn.execute("""
            INSERT OR REPLACE INTO cvm_watch_status (id, last_run, status, filings_detected, filings_loaded, last_error)
            VALUES (1, ?, 'IDLE', 0, 0, NULL)
        """, [datetime.now()])

    def upsert_companies(self, companies: List[Dict[str, Any]]):
        """Batch upsert CVM companies from cad_cia_aberta."""
        if not companies:
            return
        rows = [
            (
                c["cod_cvm"],
                c.get("cnpj", ""),
                c.get("denom_social", ""),
                c.get("nome_pregao", ""),
                c.get("categoria", "Categoria A"),
                c.get("situacao", "ATIVO"),
                normalize_sector(c.get("setor", "Outros")),
                c.get("uf", "SP"),
                c.get("codigo_cvm_str", str(c["cod_cvm"]).zfill(6))
            )
            for c in companies
        ]
        self.conn.executemany("""
            INSERT OR REPLACE INTO cvm_companies 
            (cod_cvm, cnpj, denom_social, nome_pregao, categoria, situacao, setor, uf, codigo_cvm_str)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, rows)

    def upsert_filings(self, filings: List[Dict[str, Any]]):
        """Batch upsert filings."""
        if not filings:
            return
        rows = [
            (
                f["id"],
                f["cod_cvm"],
                f["tipo"],
                f["dt_refer"],
                f["dt_entrega"],
                f.get("versao", 1),
                f.get("url_documento", ""),
                f.get("status", "NEW")
            )
            for f in filings
        ]
        self.conn.executemany("""
            INSERT OR REPLACE INTO cvm_filings 
            (id, cod_cvm, tipo, dt_refer, dt_entrega, versao, url_documento, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, rows)

    def upsert_financials(self, financials: List[Dict[str, Any]]):
        """Batch upsert canonical financial records."""
        if not financials:
            return
        rows = [
            (
                rec["cod_cvm"],
                rec["dt_refer"],
                rec["tipo"],
                rec["cd_conta"],
                rec["ds_conta"],
                float(rec["vl_conta"]),
                rec.get("conta_canonical", "")
            )
            for rec in financials
        ]
        self.conn.executemany("""
            INSERT OR REPLACE INTO cvm_financials 
            (cod_cvm, dt_refer, tipo, cd_conta, ds_conta, vl_conta, conta_canonical)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, rows)

    def upsert_financials_df(self, df: Any):
        """Batch upserts millions of canonical financial records instantly using Arrow zero-copy."""
        if df is None or len(df) == 0:
            return
        arrow_table = df.to_arrow()
        self.conn.register("incoming_records", arrow_table)
        self.conn.execute("""
            INSERT OR REPLACE INTO cvm_financials 
            (cod_cvm, dt_refer, tipo, cd_conta, ds_conta, vl_conta, conta_canonical)
            SELECT 
                CAST(cod_cvm AS INTEGER), 
                CAST(dt_refer AS DATE), 
                CAST(tipo AS VARCHAR), 
                CAST(cd_conta AS VARCHAR), 
                CAST(ds_conta AS VARCHAR), 
                CAST(vl_conta AS DOUBLE), 
                CAST(conta_canonical AS VARCHAR)
            FROM incoming_records
        """)
        self.conn.unregister("incoming_records")

    def get_sectors(self) -> List[str]:
        """Returns sorted list of distinct, deduplicated industry sectors."""
        from backend.app.cvm.normalizer import CVM_CANONICAL_SECTORS
        try:
            res = self.conn.execute("""
                SELECT DISTINCT setor 
                FROM cvm_companies 
                WHERE setor IS NOT NULL 
                ORDER BY setor ASC
            """).fetchall()
            unique_sectors = sorted(list({
                normalize_sector(str(r[0]))
                for r in res
                if r and r[0] is not None and not isinstance(r[0], (datetime, date)) and str(r[0]).strip() and not str(r[0]).startswith("202")
            }))
            if len(unique_sectors) >= 20:
                return unique_sectors
        except Exception:
            pass
        return list(CVM_CANONICAL_SECTORS)

    def get_companies(self, sector: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns list of active companies matching sector and search criteria."""
        query = "SELECT cod_cvm, cnpj, denom_social, nome_pregao, categoria, situacao, setor, uf, codigo_cvm_str FROM cvm_companies WHERE situacao = 'ATIVO' AND nome_pregao IS NOT NULL AND trim(nome_pregao) != '' AND trim(nome_pregao) != '--'"
        params = []

        if sector and sector != "all":
            norm_sec = normalize_sector(sector)
            query += " AND (setor = ? OR setor = ? OR setor ILIKE ? OR LOWER(setor) LIKE LOWER(?))"
            params.extend([sector, norm_sec, f"%{norm_sec}%", f"%{norm_sec}%"])

        if search:
            term = f"%{search.strip()}%"
            query += " AND (LOWER(denom_social) LIKE LOWER(?) OR LOWER(nome_pregao) LIKE LOWER(?) OR cnpj LIKE ? OR codigo_cvm_str LIKE ?)"
            params.extend([term, term, term, term])

        query += " ORDER BY nome_pregao ASC, denom_social ASC"
        res = self.conn.execute(query, params).fetchall()
        
        companies_map = {}
        for r in res:
            if not r or len(r) == 0:
                continue
            cod = r[0] if len(r) > 0 else 0
            if not cod or cod in companies_map:
                continue
            companies_map[cod] = {
                "cod_cvm": cod,
                "cnpj": r[1] if len(r) > 1 and r[1] is not None else "",
                "denom_social": r[2] if len(r) > 2 and r[2] is not None else f"Companhia {cod}",
                "nome_pregao": (r[3] if len(r) > 3 and r[3] and r[3].strip() not in ("", "--") else (r[2] if len(r) > 2 and r[2] else f"Companhia {cod}")),
                "categoria": r[4] if len(r) > 4 and r[4] is not None else "Categoria A",
                "situacao": r[5] if len(r) > 5 and r[5] is not None else "ATIVO",
                "setor": normalize_sector(r[6]) if len(r) > 6 and r[6] else "Outros",
                "uf": r[7] if len(r) > 7 and r[7] is not None else "",
                "codigo_cvm_str": (r[8] if len(r) > 8 and r[8] else str(cod).zfill(6))
            }
        return list(companies_map.values())

    def get_company_by_code(self, cod_cvm: int) -> Optional[Dict[str, Any]]:
        """Returns single company details by CVM code."""
        res = self.conn.execute("""
            SELECT cod_cvm, cnpj, denom_social, nome_pregao, categoria, situacao, setor, uf, codigo_cvm_str 
            FROM cvm_companies 
            WHERE cod_cvm = ?
        """, [cod_cvm]).fetchone()
        if not res or len(res) == 0:
            return None
        return {
            "cod_cvm": res[0] if len(res) > 0 else cod_cvm,
            "cnpj": res[1] if len(res) > 1 and res[1] is not None else "",
            "denom_social": res[2] if len(res) > 2 and res[2] is not None else f"Companhia {cod_cvm}",
            "nome_pregao": res[3] if len(res) > 3 and res[3] is not None else "",
            "categoria": res[4] if len(res) > 4 and res[4] is not None else "Categoria A",
            "situacao": res[5] if len(res) > 5 and res[5] is not None else "ATIVO",
            "setor": res[6] if len(res) > 6 and res[6] is not None else "",
            "uf": res[7] if len(res) > 7 and res[7] is not None else "",
            "codigo_cvm_str": res[8] if len(res) > 8 and res[8] is not None else str(cod_cvm).zfill(6)
        }

    def get_company_filings(self, cod_cvm: int) -> List[Dict[str, Any]]:
        """Returns filings history for a company."""
        res = self.conn.execute("""
            SELECT id, cod_cvm, tipo, dt_refer, dt_entrega, versao, url_documento, status
            FROM cvm_filings
            WHERE cod_cvm = ?
            ORDER BY dt_refer DESC, versao DESC
        """, [cod_cvm]).fetchall()
        return [
            {
                "id": r[0] if len(r) > 0 else f"{cod_cvm}_{i}",
                "cod_cvm": r[1] if len(r) > 1 else cod_cvm,
                "tipo": r[2] if len(r) > 2 else "DFP",
                "dt_refer": str(r[3]) if len(r) > 3 else "2025-12-31",
                "dt_entrega": str(r[4]) if len(r) > 4 and r[4] else None,
                "versao": r[5] if len(r) > 5 else 1,
                "url_documento": r[6] if len(r) > 6 else "",
                "status": r[7] if len(r) > 7 else "NEW"
            }
            for i, r in enumerate(res)
        ]

    def get_company_financials(self, cod_cvm: int) -> List[Dict[str, Any]]:
        """Returns all canonical financials for a company ordered chronologically."""
        res = self.conn.execute("""
            SELECT cod_cvm, dt_refer, tipo, cd_conta, ds_conta, vl_conta, conta_canonical
            FROM cvm_financials
            WHERE cod_cvm = ?
            ORDER BY dt_refer ASC, cd_conta ASC
        """, [cod_cvm]).fetchall()
        return [
            {
                "cod_cvm": r[0] if len(r) > 0 else cod_cvm,
                "dt_refer": str(r[1]) if len(r) > 1 else "2025-12-31",
                "tipo": r[2] if len(r) > 2 else "DFP",
                "cd_conta": r[3] if len(r) > 3 else "3.01",
                "ds_conta": r[4] if len(r) > 4 else "",
                "vl_conta": float(r[5]) if len(r) > 5 and r[5] is not None else 0.0,
                "conta_canonical": r[6] if len(r) > 6 else "receita_liquida"
            }
            for r in res
        ]

    def update_watch_status(self, status: str, detected: int = 0, loaded: int = 0, error: Optional[str] = None):
        """Updates watchdog execution metadata."""
        self.conn.execute("""
            UPDATE cvm_watch_status
            SET last_run = ?, status = ?, filings_detected = ?, filings_loaded = ?, last_error = ?
            WHERE id = 1
        """, [datetime.now(), status, detected, loaded, error])

    def get_watch_status(self) -> Dict[str, Any]:
        """Returns current watchdog status."""
        res = self.conn.execute("""
            SELECT last_run, status, filings_detected, filings_loaded, last_error
            FROM cvm_watch_status
            WHERE id = 1
        """).fetchone()
        if not res:
            return {
                "last_run": None,
                "status": "UNKNOWN",
                "filings_detected": 0,
                "filings_loaded": 0,
                "last_error": None
            }
        return {
            "last_run": str(res[0]) if len(res) > 0 and res[0] else None,
            "status": res[1] if len(res) > 1 else "ACTIVE",
            "filings_detected": res[2] if len(res) > 2 else 0,
            "filings_loaded": res[3] if len(res) > 3 else 0,
            "last_error": res[4] if len(res) > 4 else None
        }

# Global singleton
cvm_db = CVMDatabase()
