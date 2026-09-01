"""
Configuration settings for CVM Open Data Watchdog & Normalizer.
"""
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "app" / "data" / "cvm"
CACHE_DIR = DATA_DIR / "cache"
DB_PATH = DATA_DIR / "hyperblock_cvm.duckdb"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Official CVM Open Data Endpoints
CVM_BASE_URL = "https://dados.cvm.gov.br/dados/CIA_ABERTA"

CVM_CAD_CIA_URL = f"{CVM_BASE_URL}/CAD/DADOS/cad_cia_aberta.csv"
CVM_ITR_DOC_URL = f"{CVM_BASE_URL}/DOC/ITR/DADOS"
CVM_DFP_DOC_URL = f"{CVM_BASE_URL}/DOC/DFP/DADOS"
CVM_ITR_DADOS_URL = f"{CVM_BASE_URL}/ITR/DADOS"
CVM_DFP_DADOS_URL = f"{CVM_BASE_URL}/DFP/DADOS"

# Network & Politeness Settings
USER_AGENT = "HyperblockEngine/2.0 (+https://github.com/hyperblock/engine; contact@hyperblock.ai)"
REQUEST_TIMEOUT = 5.0  # seconds
RATE_LIMIT_DELAY = 1.0  # minimum seconds between requests
MAX_RETRIES = 2
BACKOFF_FACTOR = 1.5

# Supported Reporting Periods
DEFAULT_HISTORICAL_YEARS = [2022, 2023, 2024, 2025, 2026]
