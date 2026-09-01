import io
import pandas as pd
from typing import Dict, Any, Optional
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)

def create_financial_pdf_report(
    df_before: pd.DataFrame,
    df_after: pd.DataFrame,
    metrics: Dict[str, Any],
    summary: str,
    mode: str = "DRE"
) -> io.BytesIO:
    """
    Generates a professional financial PDF report for DRE / DFC simulation results.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    story = []
    styles = getSampleStyleSheet()

    # Color Palette
    primary_color = colors.HexColor("#0F766E") if mode == "DRE" else colors.HexColor("#0284C7")
    secondary_color = colors.HexColor("#1E293B")
    accent_bg = colors.HexColor("#F8FAFC")
    border_color = colors.HexColor("#CBD5E1")
    highlight_green = colors.HexColor("#10B981")

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#64748B"),
        spaceAfter=15
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=secondary_color
    )

    bold_label = ParagraphStyle(
        'BoldLabel',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    # Header
    story.append(Paragraph(f"HyperCube Engine — Relatório Executivo de Simulação ({mode})", title_style))
    story.append(Paragraph("Motor de Cálculo Multidimensional Reativo • Auditoria & Análise What-If", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=15))

    # Section 1: Parameters Box
    story.append(Paragraph("1. Parâmetros da Simulação Executada", section_heading))

    param_data = [
        [Paragraph("<b>Nó / Conta Alterada:</b>", body_style), Paragraph(str(metrics.get("node", "N/A")), body_style)],
        [Paragraph("<b>Variação Aplicada:</b>", body_style), Paragraph(f"<b>{metrics.get('change_pct', 0.0):+.1f}%</b>", body_style)],
        [Paragraph("<b>Anos Afetados:</b>", body_style), Paragraph(f"{metrics.get('start_year', 'Todos')} a {metrics.get('end_year', 'Todos')}", body_style)],
        [Paragraph("<b>Tempo de Recálculo Reativo:</b>", body_style), Paragraph(f"{metrics.get('elapsed_ms', 0.0):.2f} ms", body_style)],
        [Paragraph("<b>Registros Processados:</b>", body_style), Paragraph(f"{len(df_after)} períodos", body_style)]
    ]

    param_table = Table(param_data, colWidths=[180, 340])
    param_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), accent_bg),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(param_table)
    story.append(Spacer(1, 15))

    # Section 2: Executive Summary by AI Agent
    story.append(Paragraph("2. Parecer do Agente Executivo de Inteligência Artificial", section_heading))
    summary_text = summary or "Simulação executada com sucesso. Todos os nós descendentes foram recalculados com reatividade topológica vetorizada."
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 15))

    # Section 3: Comparative Financial Table
    story.append(Paragraph("3. Quadro Comparativo das Principais Métricas (Antes vs. Depois)", section_heading))

    if mode == "DFC":
        metrics_keys = [
            ("recebimento_vendas", "Recebimento de Vendas"),
            ("total_saidas_operacionais", "Total Saídas Operacionais"),
            ("fco_caixa_liquido", "Fluxo Operacional (FCO)"),
            ("fci_caixa_liquido", "Fluxo Investimento (FCI)"),
            ("fcf_caixa_liquido", "Fluxo Financiamento (FCF)"),
            ("variacao_liquida_caixa", "Variação Líquida de Caixa"),
            ("saldo_final_caixa", "Saldo Final de Caixa")
        ]
    else:
        metrics_keys = [
            ("receita_com_operacoes_de_credito_e_repasses", "Receita de Crédito"),
            ("despesas_de_captacao", "Despesas de Captação"),
            ("produto_da_intermediacao_financeira", "Produto Intermediação"),
            ("provisao_para_risco_de_credito_prc", "Provisão Risco Crédito"),
            ("resultado_da_intermediacao_financeira", "Resultado Intermediação"),
            ("resultado_antes_da_tributacao", "Resultado Antes Tributos (EBT)"),
            ("lucro_liquido", "Lucro Líquido")
        ]

    table_data = [
        [
            Paragraph("<b>Métrica / Conta</b>", ParagraphStyle('TH', parent=body_style, textColor=colors.white)),
            Paragraph("<b>Original (Total R$)</b>", ParagraphStyle('TH', parent=body_style, textColor=colors.white, alignment=2)),
            Paragraph("<b>Simulado (Total R$)</b>", ParagraphStyle('TH', parent=body_style, textColor=colors.white, alignment=2)),
            Paragraph("<b>Variação (R$)</b>", ParagraphStyle('TH', parent=body_style, textColor=colors.white, alignment=2)),
            Paragraph("<b>Var (%)</b>", ParagraphStyle('TH', parent=body_style, textColor=colors.white, alignment=2)),
        ]
    ]

    for col_id, col_label in metrics_keys:
        if col_id in df_before.columns and col_id in df_after.columns:
            sum_b = float(df_before[col_id].sum())
            sum_a = float(df_after[col_id].sum())
            diff = sum_a - sum_b
            pct_var = ((sum_a - sum_b) / abs(sum_b) * 100.0) if sum_b != 0 else 0.0

            formatted_b = f"R$ {sum_b:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
            formatted_a = f"R$ {sum_a:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
            formatted_diff = f"{diff:+,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
            formatted_pct = f"{pct_var:+.2f}%"

            table_data.append([
                Paragraph(col_label, body_style),
                Paragraph(formatted_b, ParagraphStyle('TD', parent=body_style, alignment=2)),
                Paragraph(formatted_a, ParagraphStyle('TD', parent=bold_label, alignment=2)),
                Paragraph(formatted_diff, ParagraphStyle('TD', parent=body_style, alignment=2)),
                Paragraph(formatted_pct, ParagraphStyle('TD', parent=bold_label, alignment=2, textColor=highlight_green if diff >= 0 else colors.HexColor("#DC2626"))),
            ])

    comp_table = Table(table_data, colWidths=[160, 95, 95, 95, 75])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, accent_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))

    story.append(comp_table)
    story.append(Spacer(1, 20))

    # Footer Notes
    story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceAfter=10))
    story.append(Paragraph(
        "HyperCube Engine © 2026 — Documento gerado automaticamente pelo motor de simulação multidimensional.",
        ParagraphStyle('Footer', parent=subtitle_style, alignment=1)
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer
