# CVM Open Data Portal — Sources & Normalization Architecture

This document describes the official CVM (Comissão de Valores Mobiliários) Open Data Portal endpoints, file formats, and the canonical accounting normalization schema utilized by the Hyperblock Engine.

---

## 1. Official CVM Open Data Endpoints

All data is acquired strictly via the official CVM Open Data Portal (`https://dados.cvm.gov.br`). Interactive scraping of `sistemas.cvm.gov.br` is not performed.

### 1.1 Company Registry (Cadastro de Companhias Abertas)
- **URL**: `https://dados.cvm.gov.br/dados/CIA_ABERTA/CAD/DADOS/cad_cia_aberta.csv`
- **Format**: CSV, ISO-8859-1 (Latin-1) / UTF-8, semicolon (`;`) delimited.
- **Key Columns**:
  - `CD_CVM`: CVM company identification code (INTEGER)
  - `CNPJ_CIA`: Corporate tax registration number (VARCHAR)
  - `DENOM_SOCIAL`: Full corporate registered name
  - `DENOM_COMERC`: Commercial trade name / Nome de Pregão
  - `SETOR_ATIV`: Economic sector / industry classification
  - `SIT`: Registration status (`ATIVO` / `CANCELADO`)
  - `TP_MERC`: Market category (B3 Novo Mercado, Nível 1, etc.)
  - `UF`: State federative unit

### 1.2 Quarterly Financial Statements — ITR (Informações Trimestrais)
- **Document Metadata**: `https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/ITR/`
- **Financial Statements (Consolidated DRE)**:
  `https://dados.cvm.gov.br/dados/CIA_ABERTA/ITR/DADOS/itr_cia_aberta_DRE_con_{YYYY}.csv`
- **Financial Statements (Consolidated Balance Sheet - BPA/BPP)**:
  `https://dados.cvm.gov.br/dados/CIA_ABERTA/ITR/DADOS/itr_cia_aberta_BPA_con_{YYYY}.csv`
  `https://dados.cvm.gov.br/dados/CIA_ABERTA/ITR/DADOS/itr_cia_aberta_BPP_con_{YYYY}.csv`
- **Financial Statements (Consolidated Cash Flow - DFC - Direct & Indirect)**:
  `https://dados.cvm.gov.br/dados/CIA_ABERTA/ITR/DADOS/itr_cia_aberta_DFC_MI_con_{YYYY}.csv`

### 1.3 Annual Financial Statements — DFP (Demonstrações Financeiras Padronizadas)
- **Document Metadata**: `https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/DFP/`
- **Financial Statements (Consolidated DRE)**:
  `https://dados.cvm.gov.br/dados/CIA_ABERTA/DFP/DADOS/dfp_cia_aberta_DRE_con_{YYYY}.csv`
- **Financial Statements (Consolidated Balance Sheet & DFC)**:
  `https://dados.cvm.gov.br/dados/CIA_ABERTA/DFP/DADOS/dfp_cia_aberta_BPA_con_{YYYY}.csv`
  `https://dados.cvm.gov.br/dados/CIA_ABERTA/DFP/DADOS/dfp_cia_aberta_DFC_MI_con_{YYYY}.csv`

---

## 2. Polars Streaming Ingestion Strategy

To process CVM dataset files (often 100MB to 500MB+ per annual batch) with zero memory spikes:
1. `polars.scan_csv` executes streaming evaluation.
2. Lazy predicates (`pl.col("CD_CVM").is_in(...)` and `pl.col("ORDEM_EXERC") == "ÚLTIMO"`) filter the dataset before materialization.
3. Decimals formatted with commas (e.g. `12345,67`) are cast cleanly with type-safe numeric coercions.
4. ETag and `If-Modified-Since` headers prevent re-downloading unchanged annual archives.

---

## 3. Canonical Accounting Schema Normalization

Raw CVM financial lines (`CD_CONTA`, `DS_CONTA`) follow standard CPC/IFRS chart of accounts. The engine normalizes these into canonical accounts across sectors:

| Canonical Key | CVM Standard Account (`CD_CONTA`) | Description |
| :--- | :--- | :--- |
| `receita_liquida` | `3.01` | Receita Líquida de Vendas e Serviços |
| `custo_bens_servicos` | `3.02` | Custo dos Bens e/ou Serviços Vendidos |
| `lucro_bruto` | `3.03` | Lucro Bruto |
| `despesas_operacionais` | `3.04` | Despesas/Receitas Operacionais Totais |
| `despesas_vendas` | `3.04.01` | Despesas com Vendas |
| `despesas_gerais_adm` | `3.04.02` | Despesas Gerais e Administrativas |
| `outras_receitas_despesas_op`| `3.04.05` / `3.04.06` | Outras Receitas / Despesas Operacionais |
| `resultado_ebit` | `3.05` | Resultado Antes do Resultado Financeiro e Tributos (EBIT) |
| `resultado_financeiro` | `3.06` | Resultado Financeiro Líquido |
| `receitas_financeiras` | `3.06.01` | Receitas Financeiras |
| `despesas_financeiras` | `3.06.02` | Despesas Financeiras |
| `resultado_antes_tributos` | `3.07` / `3.08` | Resultado Antes dos Tributos sobre o Lucro (LAIR) |
| `imposto_renda_contribuicao` | `3.08` / `3.09` | Imposto de Renda e Contribuição Social sobre o Lucro |
| `lucro_liquido` | `3.11` / `3.99` | Lucro / Prejuízo Líquido Consolidado do Período |

For financial institutions (Bancos, Seguradoras, Intermediação Financeira):
- `receita_intermediacao` (`receita_com_operacoes_de_credito_e_repasses`, etc.)
- `despesas_captacao` (`despesas_de_captacao`)
- `provisao_credito` (`provisao_para_risco_de_credito_prc`)
- `resultado_intermediacao`
- `lucro_liquido`

---

## 4. DuckDB Storage Architecture

Persisted inside DuckDB (`hyperblock_cvm.duckdb` or in-memory instance):
```sql
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

CREATE TABLE IF NOT EXISTS cvm_filings (
  id VARCHAR PRIMARY KEY,           -- hash(cod_cvm|tipo|dt_refer|versao)
  cod_cvm INTEGER,
  tipo VARCHAR,                    -- 'ITR' | 'DFP'
  dt_refer DATE,
  dt_entrega DATE,
  versao INTEGER,
  url_documento VARCHAR,
  status VARCHAR DEFAULT 'NEW'     -- NEW | DOWNLOADED | LOADED
);

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

CREATE TABLE IF NOT EXISTS cvm_watch_status (
  id INTEGER PRIMARY KEY,
  last_run TIMESTAMP,
  status VARCHAR,
  filings_detected INTEGER,
  filings_loaded INTEGER,
  last_error VARCHAR
);
```
