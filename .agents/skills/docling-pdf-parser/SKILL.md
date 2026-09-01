---
name: docling-pdf-parser
description: High-fidelity PDF document reading, structural layout analysis, OCR, and table extraction into Markdown using Docling and Python parsers.
---

# Skill: Docling PDF Specialist & Financial Data Extractor

You act as a **Docling Specialist Agent** dedicated to reading, parsing, OCR-ing, and extracting structured Markdown data from PDF documents (financial statements, DRE/DFC reports, banking quarterlies, and scanned documents).

## When to Use This Skill

Trigger whenever the task involves:
- Reading, parsing, or analyzing `.pdf` files (DRE, DFC, balance sheets, executive reports).
- Extracting tables, structured financial metrics, or text layouts from PDF documents.
- Converting complex scanned or multi-column PDFs into clean GitHub-flavored Markdown.
- Processing uploaded `.pdf` custom files for scenario simulation and DAG analysis.

## Core Capabilities & Architecture

1. **Docling Engine Integration (`docling`)**:
   - High-precision document layout analysis (detecting headers, footers, multi-column text, sidebars, and nested tables).
   - Table structure recognition (converting complex banking matrix tables into Markdown tables).
   - OCR fallback for scanned images and non-searchable PDF pages.

2. **Polars & Data Integration**:
   - Parsing financial tables (DRE/DFC line items) into normalized Polars DataFrames.
   - Mapping extracted accounts directly into canonical DAG engine keys (`receita_com_operacoes_de_credito_e_repasses`, `despesas_de_captacao`, `fco_caixa_liquido`, etc.).

3. **Fallback Parsers**:
   - Secondary Python fallbacks using `pdfplumber`, `pypdf`, `pymupdf` (PyMuPDF / fitz), or `pdf2image` + `tesseract` when `docling` is offline or in light environments.

## Extraction Workflow & Best Practices

### 1. Document Parsing Strategy
- **Text & Structure Extraction**: Preserve heading hierarchy (`#`, `##`, `###`), bold financial totals, and page references.
- **Table Formatting**: Convert every financial table into standard GFM Markdown table format (`| Account | Q1 | Q2 | Q3 | Q4 |`).
- **Scanned / OCR Handling**: Recognize text embedded inside images using OCR engines without dropping numbers or minus signs (`-` / `()`).

### 2. Financial Normalization Rules
- Convert Brazilian currency values (`R$ 1.234.567,89` or `(123.456)`) into float values for calculations (`1234567.89` or `-123456.0`).
- Resolve canonical financial line items:
  - **DRE**: Receita de Crédito, Funding, PRC, Produto de Intermediação, EBT, Lucro Líquido.
  - **DFC**: FCO (Operacional), FCI (Investimento), FCF (Financiamento), Saldo Inicial, Saldo Final.

### 3. Usage Example (Python Script Interface)

```python
from docling.document_converter import DocumentConverter

def extract_pdf_to_markdown(pdf_path: str) -> str:
    """Converts PDF document into structured Markdown using Docling."""
    converter = DocumentConverter()
    result = converter.convert(pdf_path)
    markdown_content = result.document.export_to_markdown()
    return markdown_content
```

## Input File Formats Supported

- Native Searchable PDF (`.pdf`)
- Scanned PDF Documents (`.pdf` image-only)
- Hybrid PDF Reports with Charts and Embedded Spreadsheets

## Output Format

The extracted document is emitted in Markdown format:
1. **Document Metadata Header** (Title, Date, Pages, Source).
2. **Executive Text & Context**.
3. **Structured Financial Tables** (Clean GFM tables).
4. **Calculated Summaries & DAG Mapping Recommendations**.
