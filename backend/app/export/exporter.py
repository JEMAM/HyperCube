import io
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import pandas as pd
from typing import Dict, Any, Optional

def create_financial_excel_report(
    df_before: pd.DataFrame,
    df_after: pd.DataFrame,
    metrics: Dict[str, Any],
    summary: str,
    mode: str = "DRE"
) -> io.BytesIO:
    """
    Generates a professional Excel (.xlsx) workbook containing:
    1. Executive Summary & Parameters
    2. Consolidated Annual Comparison (Before vs After)
    3. Full Time-Series Comparison
    """
    wb = openpyxl.Workbook()
    
    # Styles
    font_title = Font(name="Calibri", size=16, bold=True, color="1F2937")
    font_section = Font(name="Calibri", size=13, bold=True, color="0F766E")
    font_header = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    font_bold = Font(name="Calibri", size=11, bold=True)
    font_regular = Font(name="Calibri", size=11)
    
    fill_header_dre = PatternFill(start_color="059669", end_color="059669", fill_type="solid") # Emerald
    fill_header_dfc = PatternFill(start_color="0284C7", end_color="0284C7", fill_type="solid") # Sky
    fill_header = fill_header_dfc if mode == "DFC" else fill_header_dre
    
    fill_subtotal = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
    fill_accent = PatternFill(start_color="F0FDF4", end_color="F0FDF4", fill_type="solid")
    
    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )

    # -------------------------------------------------------------
    # TAB 1: Resumo Executivo
    # -------------------------------------------------------------
    ws_summary = wb.active
    ws_summary.title = "Resumo Executivo"
    ws_summary.views.sheetView[0].showGridLines = True
    
    ws_summary["A1"] = f"HyperCube Engine — Relatório de Simulação What-If ({mode})"
    ws_summary["A1"].font = font_title
    
    ws_summary["A3"] = "Parâmetros da Simulação"
    ws_summary["A3"].font = font_section
    
    params = [
        ("Nó / Conta Impactada", metrics.get("node", "N/A")),
        ("Variação Aplicada (%)", f"{metrics.get('change_pct', 0.0):+.1f}%"),
        ("Anos Afetados", f"{metrics.get('start_year', 'Todos')} - {metrics.get('end_year', 'Todos')}"),
        ("Tempo de Recálculo Reativo", f"{metrics.get('elapsed_ms', 0.0):.2f} ms"),
        ("Quantidade de Linhas Processadas", len(df_after))
    ]
    
    row_idx = 4
    for label, val in params:
        ws_summary.cell(row=row_idx, column=1, value=label).font = font_bold
        ws_summary.cell(row=row_idx, column=2, value=val).font = font_regular
        ws_summary.cell(row=row_idx, column=1).border = thin_border
        ws_summary.cell(row=row_idx, column=2).border = thin_border
        row_idx += 1
        
    row_idx += 1
    ws_summary.cell(row=row_idx, column=1, value="Análise do Agente Inteligente (IA)").font = font_section
    row_idx += 1
    
    summary_cell = ws_summary.cell(row=row_idx, column=1, value=summary or "Simulação executada com sucesso.")
    summary_cell.font = font_regular
    summary_cell.alignment = Alignment(wrap_text=True, vertical="top")
    ws_summary.merge_cells(start_row=row_idx, start_column=1, end_row=row_idx+5, end_column=6)

    # -------------------------------------------------------------
    # TAB 2: Séries Completas (Antes vs Depois)
    # -------------------------------------------------------------
    ws_data = wb.create_sheet(title=f"Dados {mode}")
    ws_data.views.sheetView[0].showGridLines = True
    
    # Selected key columns to display
    if mode == "DFC":
        key_cols = [
            'data', 'recebimento_vendas', 'total_saidas_operacionais',
            'fco_caixa_liquido', 'fci_caixa_liquido', 'fcf_caixa_liquido',
            'variacao_liquida_caixa', 'saldo_final_caixa'
        ]
    else:
        key_cols = [
            'data', 'ano', 'trimestre', 'receita_com_operacoes_de_credito_e_repasses',
            'despesas_de_captacao', 'produto_da_intermediacao_financeira',
            'provisao_para_risco_de_credito_prc', 'resultado_da_intermediacao_financeira',
            'resultado_antes_da_tributacao', 'lucro_liquido'
        ]
        
    cols_to_use = [c for c in key_cols if c in df_after.columns]
    
    # Headers
    ws_data.cell(row=1, column=1, value="Período").font = font_header
    ws_data.cell(row=1, column=1).fill = fill_header
    col_idx = 2
    
    for c in cols_to_use:
        if c in ['data', 'ano', 'trimestre']:
            continue
        ws_data.cell(row=1, column=col_idx, value=f"{c} (Antes)").font = font_header
        ws_data.cell(row=1, column=col_idx).fill = fill_header
        col_idx += 1
        ws_data.cell(row=1, column=col_idx, value=f"{c} (Simulado)").font = font_header
        ws_data.cell(row=1, column=col_idx).fill = fill_header
        col_idx += 1
        ws_data.cell(row=1, column=col_idx, value="Variação Abs (R$)").font = font_header
        ws_data.cell(row=1, column=col_idx).fill = fill_header
        col_idx += 1

    row_out = 2
    for i in range(len(df_after)):
        r_before = df_before.iloc[i]
        r_after = df_after.iloc[i]
        
        ws_data.cell(row=row_out, column=1, value=str(r_after.get('data', ''))).font = font_bold
        ws_data.cell(row=row_out, column=1).border = thin_border
        
        c_idx = 2
        for col in cols_to_use:
            if col in ['data', 'ano', 'trimestre']:
                continue
            val_b = float(r_before.get(col, 0.0))
            val_a = float(r_after.get(col, 0.0))
            diff = val_a - val_b
            
            cell_b = ws_data.cell(row=row_out, column=c_idx, value=val_b)
            cell_b.number_format = '#,##0.00'
            cell_b.font = font_regular
            cell_b.border = thin_border
            c_idx += 1
            
            cell_a = ws_data.cell(row=row_out, column=c_idx, value=val_a)
            cell_a.number_format = '#,##0.00'
            cell_a.font = font_bold if abs(diff) > 0.01 else font_regular
            cell_a.border = thin_border
            c_idx += 1
            
            cell_d = ws_data.cell(row=row_out, column=c_idx, value=diff)
            cell_d.number_format = '+#,##0.00;-#,##0.00;0.00'
            cell_d.font = font_regular
            cell_d.border = thin_border
            if abs(diff) > 0.01:
                cell_d.fill = fill_accent
            c_idx += 1
            
        row_out += 1

    # Auto-adjust column widths
    for sheet in [ws_summary, ws_data]:
        for col in sheet.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                if cell.value:
                    val_str = str(cell.value)
                    if '\n' in val_str:
                        val_str = max(val_str.split('\n'), key=len)
                    max_len = max(max_len, len(val_str))
            sheet.column_dimensions[col_letter].width = max(max_len + 3, 12)

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return output
