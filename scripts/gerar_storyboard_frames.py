#!/usr/bin/env python3
"""
gerar_storyboard_frames.py — Gera os 9 frames do storyboard do vídeo institucional
usando apenas Pillow (sem moviepy/ffmpeg). Produz imagens 1920x1080 dark-mode premium.
"""

import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
W, H = 1920, 1080
OUT = Path(r"c:\Users\edumo\HyperCube_.4\scripts\output\frames")
OUT.mkdir(parents=True, exist_ok=True)

# Brand Colors
NAVY = (12, 35, 64)
CORAL = (255, 79, 48)
CYAN = (56, 189, 248)
EMERALD = (16, 185, 129)
AMBER = (245, 158, 11)
WHITE = (255, 255, 255)
SLATE_900 = (15, 23, 42)
SLATE_800 = (30, 41, 59)
SLATE_700 = (51, 65, 85)
SLATE_500 = (100, 116, 139)
SLATE_200 = (226, 232, 240)

def get_font(size: int, bold: bool = False):
    """Tenta carregar fonte; fallback para default."""
    names = ["arialbd.ttf", "arial.ttf", "calibri.ttf"] if bold else ["arial.ttf", "calibri.ttf"]
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except (IOError, OSError):
            continue
    return ImageFont.load_default()

def draw_rounded_rect(draw, xy, radius, fill, outline=None, width=1):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)

def draw_kpi_card(draw, x, y, w, h, label, value, accent_color, font_label, font_value):
    draw_rounded_rect(draw, [x, y, x+w, y+h], 16, SLATE_800, outline=SLATE_700, width=1)
    # Accent bar
    draw.rectangle([x, y, x+4, y+h], fill=accent_color)
    draw.text((x + 20, y + 12), label, fill=SLATE_200, font=font_label)
    draw.text((x + 20, y + 38), value, fill=WHITE, font=font_value)

def draw_line_chart(draw, x, y, w, h, lines_data, colors):
    """Draw a simple multi-line chart."""
    # Background
    draw_rounded_rect(draw, [x, y, x+w, y+h], 16, SLATE_800, outline=SLATE_700)
    
    # Grid lines
    for i in range(5):
        gy = y + 30 + i * ((h - 60) // 4)
        draw.line([(x + 30, gy), (x + w - 20, gy)], fill=(40, 50, 65), width=1)
    
    # Lines
    for line_data, color in zip(lines_data, colors):
        points = []
        for j, val in enumerate(line_data):
            px = x + 30 + j * ((w - 50) // (len(line_data) - 1))
            py = y + h - 40 - int(val * (h - 80))
            points.append((px, py))
        if len(points) >= 2:
            draw.line(points, fill=color, width=3)

def draw_dag_node(draw, cx, cy, r, label, color, font):
    draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=color, outline=WHITE, width=2)
    draw.text((cx, cy), label[:3], fill=WHITE, font=font, anchor="mm")

def draw_dag_edge(draw, x1, y1, x2, y2, color):
    draw.line([(x1, y1), (x2, y2)], fill=color, width=2)

def draw_cube_face(draw, pts, fill_color, outline_color):
    draw.polygon(pts, fill=fill_color, outline=outline_color)


# ===== CENA 1: Abertura =====
def cena_01():
    img = Image.new("RGB", (W, H), NAVY)
    draw = ImageDraw.Draw(img)
    
    # Grid pattern
    for i in range(0, W, 48):
        draw.line([(i, 0), (i, H)], fill=(16, 40, 72), width=1)
    for i in range(0, H, 48):
        draw.line([(0, i), (W, i)], fill=(16, 40, 72), width=1)
    
    # Central glow
    for r in range(200, 0, -2):
        alpha_val = max(0, 30 - r // 7)
        c = (12 + alpha_val, 35 + alpha_val, 64 + alpha_val * 2)
        draw.ellipse([W//2 - r, H//2 - 80 - r, W//2 + r, H//2 - 80 + r], fill=c)
    
    # 3D Cube wireframe
    cx, cy = W // 2, H // 2 - 60
    s = 100
    # Front face
    pts_front = [(cx-s, cy-s), (cx+s, cy-s), (cx+s, cy+s), (cx-s, cy+s)]
    draw.polygon(pts_front, fill=(20, 50, 80), outline=CORAL, width=3)
    # Top face
    off = 60
    pts_top = [(cx-s, cy-s), (cx-s+off, cy-s-off), (cx+s+off, cy-s-off), (cx+s, cy-s)]
    draw.polygon(pts_top, fill=(25, 55, 90), outline=CYAN, width=2)
    # Right face
    pts_right = [(cx+s, cy-s), (cx+s+off, cy-s-off), (cx+s+off, cy+s-off), (cx+s, cy+s)]
    draw.polygon(pts_right, fill=(18, 45, 75), outline=CORAL, width=2)
    
    # Text
    f_big = get_font(56, True)
    f_sub = get_font(24)
    f_tag = get_font(18)
    
    draw.text((W//2, H//2 + 120), "Hyper Cube 4D", fill=WHITE, font=f_big, anchor="mm")
    draw.text((W//2, H//2 + 170), "CONNECTED PLANNING ENGINE", fill=CORAL, font=f_sub, anchor="mm")
    draw.text((W//2, H//2 + 220), "E se toda decisao financeira pudesse ser simulada em tempo real?", fill=SLATE_200, font=f_tag, anchor="mm")
    
    img.save(OUT / "cena_01.png", quality=95)

# ===== CENA 2: Sala de Reuniao =====
def cena_02():
    img = Image.new("RGB", (W, H), SLATE_900)
    draw = ImageDraw.Draw(img)
    
    f_title = get_font(36, True)
    f_sub = get_font(20)
    f_sm = get_font(14)
    f_val = get_font(28, True)
    f_lbl = get_font(14)
    
    # Sidebar
    draw.rectangle([0, 0, 260, H], fill=NAVY)
    draw.text((130, 40), "HC", fill=CORAL, font=get_font(48, True), anchor="mm")
    draw.text((130, 80), "HyperCube 4D", fill=WHITE, font=f_sm, anchor="mm")
    
    menu_items = ["Plataforma", "Visao Geral", "Economia", "DRE", "DFC", "BP", "Grafo DAG", "Cubo OLAP", "Valuation", "CVM"]
    for i, item in enumerate(menu_items):
        y = 140 + i * 42
        bg = (20, 55, 90) if i == 0 else None
        if bg:
            draw.rounded_rectangle([12, y-4, 248, y+32], radius=8, fill=bg)
        draw.text((40, y+4), item, fill=WHITE if i == 0 else SLATE_500, font=f_sm)
    
    draw.text((130, H - 50), "Jose Eduardo Moraes", fill=SLATE_500, font=f_sm, anchor="mm")
    draw.text((130, H - 30), "(FP&A)", fill=SLATE_700, font=f_sm, anchor="mm")
    
    # Main content area
    draw.text((680, 60), "Reuniao Trimestral de FP&A", fill=WHITE, font=f_title)
    draw.text((680, 110), "Grupo Casas Bahia S.A. (BHIA3) — R$ Milhoes — 1T26", fill=SLATE_200, font=f_sub)
    
    # KPI Cards
    draw_kpi_card(draw, 300, 170, 380, 80, "Receita Liquida", "R$ 6.850 M", CORAL, f_lbl, f_val)
    draw_kpi_card(draw, 710, 170, 380, 80, "EBITDA Ajustado", "R$ 412 M", EMERALD, f_lbl, f_val)
    draw_kpi_card(draw, 1120, 170, 380, 80, "Lucro Liquido", "R$ -285 M", CYAN, f_lbl, f_val)
    
    # Chart
    lines = [
        [0.2, 0.3, 0.35, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.78, 0.85],
        [0.15, 0.2, 0.25, 0.35, 0.38, 0.42, 0.45, 0.5, 0.52, 0.55, 0.53, 0.58],
        [0.1, 0.15, 0.18, 0.25, 0.28, 0.32, 0.35, 0.38, 0.4, 0.42, 0.4, 0.45],
    ]
    draw_line_chart(draw, 300, 290, 1200, 400, lines, [CORAL, CYAN, EMERALD])
    
    # Legend
    for i, (label, color) in enumerate([("Receita", CORAL), ("EBITDA", CYAN), ("Lucro", EMERALD)]):
        draw.rectangle([320 + i*200, 710, 340 + i*200, 726], fill=color)
        draw.text((348 + i*200, 710), label, fill=SLATE_200, font=f_sm)
    
    # Stepper
    draw_rounded_rect(draw, [300, H-80, 1540, H-20], 12, SLATE_800)
    steps = ["1. Ingestao", "2. Connected Planning", "3. DRE, DFC & BP", "4. Grafo DAG"]
    for i, step in enumerate(steps):
        x = 380 + i * 290
        c = CORAL if i == 0 else SLATE_500
        draw.text((x, H-58), step, fill=c, font=f_sm)
    
    img.save(OUT / "cena_02.png", quality=95)

# ===== CENA 3: DRE What-If =====
def cena_03():
    img = Image.new("RGB", (W, H), SLATE_900)
    draw = ImageDraw.Draw(img)
    
    f_title = get_font(32, True)
    f_sub = get_font(16)
    f_val = get_font(28, True)
    f_lbl = get_font(13)
    f_sm = get_font(14)
    f_btn = get_font(16, True)
    
    # Header
    draw.text((60, 30), "DRE — Demonstracao do Resultado", fill=WHITE, font=f_title)
    draw.text((60, 70), "Simulacao What-If com Propagacao Topologica DAG", fill=SLATE_200, font=f_sub)
    
    # KPI Cards
    draw_kpi_card(draw, 60, 110, 440, 80, "Receita Liquida", "USD 56.85 B", CORAL, f_lbl, f_val)
    draw_kpi_card(draw, 530, 110, 440, 80, "EBITDA", "USD 28.935 M", EMERALD, f_lbl, f_val)
    draw_kpi_card(draw, 1000, 110, 440, 80, "Lucro Liquido", "USD 12.450 M", CYAN, f_lbl, f_val)
    
    # Scenario Panel (left)
    draw_rounded_rect(draw, [60, 220, 480, 620], 16, SLATE_800, outline=SLATE_700)
    draw.text((80, 240), "Simulacao de Cenario", fill=CORAL, font=get_font(18, True))
    draw.text((80, 275), "Conta:", fill=SLATE_200, font=f_sm)
    draw_rounded_rect(draw, [80, 295, 460, 325], 8, (20, 30, 50), outline=SLATE_700)
    draw.text((90, 300), "SG&A (Desp. Administrativas)", fill=WHITE, font=f_sm)
    
    draw.text((80, 345), "Variacao (%):", fill=SLATE_200, font=f_sm)
    # Slider
    draw.rectangle([80, 375, 460, 379], fill=SLATE_700)
    draw.rectangle([80, 375, 270, 379], fill=CORAL)
    draw.ellipse([262, 370, 280, 388], fill=CORAL, outline=WHITE, width=2)
    draw.text((290, 368), "-5.0%", fill=CORAL, font=get_font(18, True))
    
    # Simulate button
    draw_rounded_rect(draw, [80, 420, 260, 460], 12, CORAL)
    draw.text((170, 432), "Simular", fill=WHITE, font=f_btn, anchor="mm")
    
    # Reset button
    draw_rounded_rect(draw, [280, 420, 460, 460], 12, SLATE_700)
    draw.text((370, 432), "Resetar", fill=WHITE, font=f_btn, anchor="mm")
    
    # AI Agent Panel
    draw_rounded_rect(draw, [60, 490, 480, 620], 16, (15, 30, 20), outline=EMERALD, width=2)
    draw.text((80, 510), "Agente IA — Diagnostico", fill=EMERALD, font=get_font(16, True))
    draw.text((80, 540), "Impacto: Reducao de SG&A em", fill=SLATE_200, font=f_sm)
    draw.text((80, 560), "-5% elevou EBITDA em +2.8%.", fill=EMERALD, font=get_font(14, True))
    draw.text((80, 585), "Margem operacional sobe de", fill=SLATE_200, font=f_sm)
    draw.text((80, 605), "32.1% para 33.8% (+170 bps).", fill=SLATE_200, font=f_sm)
    
    # Chart (right)
    lines = [
        [0.3, 0.35, 0.4, 0.5, 0.55, 0.6, 0.65, 0.72, 0.78, 0.82, 0.85, 0.9],
        [0.2, 0.22, 0.28, 0.35, 0.38, 0.42, 0.48, 0.52, 0.58, 0.62, 0.65, 0.7],
        [0.15, 0.18, 0.2, 0.28, 0.3, 0.35, 0.4, 0.44, 0.48, 0.52, 0.55, 0.6],
        [0.05, 0.08, 0.1, 0.15, 0.18, 0.2, 0.25, 0.28, 0.3, 0.35, 0.38, 0.42],
    ]
    draw_line_chart(draw, 520, 220, 880, 400, lines, [CORAL, EMERALD, CYAN, AMBER])
    
    # Labels
    labels = [("Receita", CORAL), ("Lucro Bruto", EMERALD), ("EBITDA", CYAN), ("Lucro Liq.", AMBER)]
    for i, (l, c) in enumerate(labels):
        draw.rectangle([540 + i*210, 640, 560 + i*210, 656], fill=c)
        draw.text((568 + i*210, 640), l, fill=SLATE_200, font=f_sm)
    
    # Bottom: Performance badge
    draw_rounded_rect(draw, [520, 670, 800, 700], 8, (15, 30, 20), outline=EMERALD)
    draw.text((530, 675), "Recalculo DAG: 1.34 ms  |  18 nos propagados", fill=EMERALD, font=f_sm)
    
    # Time axis
    periods = ["2T03", "4T05", "2T08", "4T10", "2T13", "4T15", "2T18", "4T20", "2T23", "4T25"]
    for i, p in enumerate(periods):
        x = 550 + i * 87
        draw.text((x, 625), p, fill=SLATE_500, font=get_font(11))
    
    img.save(OUT / "cena_03.png", quality=95)

# ===== CENA 4: DFC =====
def cena_04():
    img = Image.new("RGB", (W, H), SLATE_900)
    draw = ImageDraw.Draw(img)
    
    f_title = get_font(32, True)
    f_sub = get_font(16)
    f_val = get_font(28, True)
    f_lbl = get_font(13)
    f_sm = get_font(14)
    
    draw.text((60, 30), "DFC — Fluxo de Caixa Direto", fill=WHITE, font=f_title)
    draw.text((60, 70), "Simulacao de Liquidez com Reconciliacao FCO + FCI + FCF", fill=SLATE_200, font=f_sub)
    
    draw_kpi_card(draw, 60, 110, 440, 80, "FCO (Operacional)", "R$ 1.245 M", EMERALD, f_lbl, f_val)
    draw_kpi_card(draw, 530, 110, 440, 80, "FCI (Investimentos)", "R$ -890 M", CYAN, f_lbl, f_val)
    draw_kpi_card(draw, 1000, 110, 440, 80, "Saldo Final de Caixa", "R$ 2.340 M", AMBER, f_lbl, f_val)
    
    # DFC Chart
    lines = [
        [0.6, 0.65, 0.55, 0.7, 0.72, 0.68, 0.75, 0.8, 0.78, 0.85, 0.82, 0.88],
        [0.2, 0.18, 0.15, 0.22, 0.25, 0.2, 0.28, 0.3, 0.25, 0.32, 0.28, 0.35],
        [0.4, 0.45, 0.38, 0.5, 0.52, 0.48, 0.55, 0.58, 0.52, 0.6, 0.55, 0.65],
        [0.35, 0.38, 0.32, 0.42, 0.45, 0.4, 0.48, 0.52, 0.48, 0.55, 0.5, 0.58],
    ]
    draw_line_chart(draw, 60, 220, 1400, 480, lines, [EMERALD, CYAN, AMBER, CORAL])
    
    labels = [("FCO", EMERALD), ("FCI", CYAN), ("FCF", AMBER), ("Var. Liq.", CORAL)]
    for i, (l, c) in enumerate(labels):
        draw.rectangle([100 + i*220, 720, 120 + i*220, 736], fill=c)
        draw.text((128 + i*220, 720), l, fill=SLATE_200, font=f_sm)
    
    # Account chips
    chips = ["recebimento_vendas", "fco_caixa_liquido", "saldo_final_caixa"]
    for i, chip in enumerate(chips):
        x = 60 + i * 320
        draw_rounded_rect(draw, [x, 760, x+290, 790], 16, SLATE_800, outline=CYAN, width=1)
        draw.text((x+15, 768), chip, fill=CYAN, font=f_sm)
    
    draw_rounded_rect(draw, [60, 820, 380, 850], 8, (15, 30, 20), outline=EMERALD)
    draw.text((70, 825), "Recalculo DAG: 0.98 ms  |  14 nos propagados", fill=EMERALD, font=f_sm)
    
    img.save(OUT / "cena_04.png", quality=95)

# ===== CENA 5: BP =====
def cena_05():
    img = Image.new("RGB", (W, H), SLATE_900)
    draw = ImageDraw.Draw(img)
    
    f_title = get_font(32, True)
    f_sub = get_font(16)
    f_val = get_font(24, True)
    f_lbl = get_font(13)
    f_sm = get_font(14)
    
    draw.text((60, 30), "BP — Balanco Patrimonial", fill=WHITE, font=f_title)
    draw.text((60, 70), "Equacao Contabil + Modelo Fleuriet + Decomposicao Dupont", fill=SLATE_200, font=f_sub)
    
    draw_kpi_card(draw, 60, 110, 350, 80, "Ativo Total", "USD 88.45 B", CYAN, f_lbl, f_val)
    draw_kpi_card(draw, 440, 110, 350, 80, "NCG (Fleuriet)", "USD 8.120 M", EMERALD, f_lbl, f_val)
    draw_kpi_card(draw, 820, 110, 350, 80, "ROE (Dupont 3F)", "28.4%", AMBER, f_lbl, f_val)
    draw_kpi_card(draw, 1200, 110, 350, 80, "Liq. Corrente", "1.82x", CORAL, f_lbl, f_val)
    
    # Balance chart
    lines = [
        [0.8, 0.82, 0.85, 0.88, 0.9, 0.92, 0.95, 0.93],
        [0.5, 0.52, 0.55, 0.58, 0.6, 0.62, 0.65, 0.63],
        [0.3, 0.32, 0.35, 0.38, 0.4, 0.42, 0.45, 0.43],
        [0.45, 0.48, 0.5, 0.52, 0.55, 0.58, 0.6, 0.58],
    ]
    draw_line_chart(draw, 60, 220, 900, 380, lines, [CYAN, EMERALD, AMBER, (168, 85, 247)])
    
    labels = [("Ativo Total", CYAN), ("Ativo Circ.", EMERALD), ("Passivo Circ.", AMBER), ("PL", (168, 85, 247))]
    for i, (l, c) in enumerate(labels):
        draw.rectangle([100 + i*230, 620, 120 + i*230, 636], fill=c)
        draw.text((128 + i*230, 620), l, fill=SLATE_200, font=f_sm)
    
    # Dupont decomposition box
    draw_rounded_rect(draw, [1000, 220, 1500, 600], 16, SLATE_800, outline=AMBER)
    draw.text((1020, 240), "Decomposicao Dupont", fill=AMBER, font=get_font(18, True))
    
    dupont_items = [
        ("ROE", "28.4%", AMBER),
        ("= Margem Liquida", "18.2%", SLATE_200),
        ("x Giro do Ativo", "0.64x", SLATE_200),
        ("x Multiplicador PL", "2.44x", SLATE_200),
    ]
    for i, (label, val, color) in enumerate(dupont_items):
        y = 290 + i * 55
        draw.text((1040, y), label, fill=color, font=f_sm)
        draw.text((1380, y), val, fill=WHITE, font=get_font(20, True))
    
    # Fleuriet
    draw_rounded_rect(draw, [1000, 440, 1500, 600], 16, (15, 30, 20), outline=EMERALD)
    draw.text((1020, 460), "Modelo Fleuriet", fill=EMERALD, font=get_font(18, True))
    draw.text((1020, 500), "CDG: R$ 12.450 M", fill=SLATE_200, font=f_sm)
    draw.text((1020, 525), "NCG: R$ 8.120 M", fill=SLATE_200, font=f_sm)
    draw.text((1020, 550), "ST:  R$ 4.330 M", fill=SLATE_200, font=f_sm)
    draw.text((1020, 575), "Situacao: SOLIDA", fill=EMERALD, font=get_font(14, True))
    
    # Balance equation bar
    draw_rounded_rect(draw, [60, H-60, 800, H-20], 10, (15, 40, 20), outline=EMERALD, width=2)
    draw.text((80, H-50), "Ativo Total = Passivo + PL  |  Delta = 0,00  ✓", fill=EMERALD, font=get_font(16, True))
    
    img.save(OUT / "cena_05.png", quality=95)

# ===== CENA 6: DAG Graph =====
def cena_06():
    img = Image.new("RGB", (W, H), SLATE_900)
    draw = ImageDraw.Draw(img)
    
    f_title = get_font(32, True)
    f_sub = get_font(16)
    f_sm = get_font(14)
    f_node = get_font(11)
    
    draw.text((60, 30), "Grafo DAG — Dependencias Topologicas", fill=WHITE, font=f_title)
    draw.text((60, 70), "Rustworkx Engine: Recalculo em < 2ms, Zero Referencias Circulares", fill=SLATE_200, font=f_sub)
    
    # Tab selectors
    tabs = [("DRE", True), ("DFC", False), ("BP", False)]
    for i, (tab, active) in enumerate(tabs):
        x = 60 + i * 120
        bg = CORAL if active else SLATE_800
        draw_rounded_rect(draw, [x, 110, x+100, 140], 16, bg, outline=SLATE_700)
        draw.text((x+50, 118), tab, fill=WHITE, font=get_font(14, True), anchor="mm")
    
    # DAG Nodes
    # Layer 1 (inputs)
    layer1 = [
        (250, 220, "RBR", CYAN), (450, 220, "DEC", CYAN), (650, 220, "DOA", CYAN),
        (850, 220, "DFI", CYAN), (1050, 220, "ORC", CYAN), (1250, 220, "IMR", CYAN),
    ]
    # Layer 2
    layer2 = [
        (350, 400, "RLQ", EMERALD), (650, 400, "LBR", EMERALD),
        (950, 400, "DOT", EMERALD), (1200, 400, "RFN", EMERALD),
    ]
    # Layer 3
    layer3 = [
        (500, 560, "EBT", AMBER), (850, 560, "LOI", AMBER),
    ]
    # Layer 4
    layer4 = [
        (680, 720, "LLQ", CORAL),
    ]
    
    # Edges layer1 -> layer2
    edges = [
        (250, 220, 350, 400), (450, 220, 350, 400), (450, 220, 650, 400),
        (650, 220, 650, 400), (650, 220, 950, 400), (850, 220, 950, 400),
        (1050, 220, 1200, 400), (1250, 220, 1200, 400),
    ]
    for x1, y1, x2, y2 in edges:
        draw_dag_edge(draw, x1, y1+30, x2, y2-30, (40, 60, 80))
    
    # Edges layer2 -> layer3
    edges2 = [
        (350, 400, 500, 560), (650, 400, 500, 560), (650, 400, 850, 560),
        (950, 400, 850, 560), (1200, 400, 850, 560),
    ]
    for x1, y1, x2, y2 in edges2:
        draw_dag_edge(draw, x1, y1+30, x2, y2-30, (50, 70, 90))
    
    # Edges layer3 -> layer4
    edges3 = [
        (500, 560, 680, 720), (850, 560, 680, 720),
    ]
    for x1, y1, x2, y2 in edges3:
        draw_dag_edge(draw, x1, y1+30, x2, y2-30, (60, 80, 100))
    
    # Draw nodes
    for x, y, label, color in layer1 + layer2 + layer3 + layer4:
        r = 28
        draw.ellipse([x-r, y-r, x+r, y+r], fill=color, outline=WHITE, width=2)
        draw.text((x, y), label, fill=WHITE, font=f_node, anchor="mm")
    
    # Node labels
    node_labels = {
        (250, 220): "Receita Bruta", (450, 220): "Deducoes", (650, 220): "Despesas Op.",
        (850, 220): "Desp. Financ.", (1050, 220): "Outros (Rec)", (1250, 220): "IR + CSLL",
        (350, 400): "Receita Liq.", (650, 400): "Lucro Bruto",
        (950, 400): "Desp. Oper. Total", (1200, 400): "Resultado Fin.",
        (500, 560): "EBITDA", (850, 560): "LAIR",
        (680, 720): "Lucro Liquido",
    }
    for (x, y), label in node_labels.items():
        draw.text((x, y + 38), label, fill=SLATE_200, font=get_font(10), anchor="mm")
    
    # Performance badge
    draw_rounded_rect(draw, [60, H-60, 400, H-20], 10, (15, 30, 20), outline=EMERALD)
    draw.text((80, H-48), "Recalculo: 1.34 ms  |  18 nos  |  0 ciclos", fill=EMERALD, font=f_sm)
    
    # Legend
    legend = [("Leaf (Input)", CYAN), ("Calculado", EMERALD), ("Intermediario", AMBER), ("Resultado", CORAL)]
    for i, (l, c) in enumerate(legend):
        x = 1550
        y = 110 + i * 30
        draw.ellipse([x, y, x+16, y+16], fill=c)
        draw.text((x+24, y), l, fill=SLATE_200, font=f_sm)
    
    img.save(OUT / "cena_06.png", quality=95)

# ===== CENA 7: OLAP Cube 3D =====
def cena_07():
    img = Image.new("RGB", (W, H), (8, 12, 24))
    draw = ImageDraw.Draw(img)
    
    f_title = get_font(32, True)
    f_sub = get_font(16)
    f_sm = get_font(14)
    f_axis = get_font(12)
    
    draw.text((60, 30), "Cubo OLAP N-Dimensional", fill=WHITE, font=f_title)
    draw.text((60, 70), "Slice & Dice em Tempo Real — WebGL + Three.js + React Three Fiber", fill=SLATE_200, font=f_sub)
    
    # 3D cube with voxels
    cx, cy = W // 2, H // 2
    size = 180
    offset = 100
    
    # Draw a large isometric cube with colored voxels
    # Grid of small cubes
    voxel_size = 36
    colors_voxel = [AMBER, CYAN, (234, 179, 8), CORAL, EMERALD, (139, 92, 246)]
    
    import random
    random.seed(42)
    
    for iz in range(5):
        for iy in range(5):
            for ix in range(5):
                if random.random() > 0.5:
                    continue
                # Isometric projection
                px = cx + (ix - iy) * 28 - 60
                py = cy + (ix + iy) * 14 - iz * 28 - 40
                
                color = random.choice(colors_voxel)
                # Darken based on depth
                factor = 0.6 + iz * 0.08
                c = tuple(min(255, int(v * factor)) for v in color)
                
                # Front face
                pts = [(px, py), (px+24, py-12), (px+24, py+12), (px, py+24)]
                draw.polygon(pts, fill=c, outline=(255, 255, 255, 30))
                
                # Top face
                c2 = tuple(min(255, int(v * 1.2)) for v in c)
                pts_top = [(px, py), (px+24, py-12), (px+48, py), (px+24, py+12)]
                draw.polygon(pts_top, fill=c2)
    
    # Axis labels
    draw.text((cx + 250, cy + 130), "Tempo →", fill=AMBER, font=get_font(16, True))
    draw.text((cx - 350, cy + 130), "← Contas DRE", fill=CYAN, font=get_font(16, True))
    draw.text((cx + 200, cy - 220), "Metricas ↑", fill=EMERALD, font=get_font(16, True))
    
    # Axis values
    years = ["2024", "2025", "Budget 2026"]
    for i, y in enumerate(years):
        draw.text((cx + 100 + i*70, cy + 160), y, fill=SLATE_200, font=f_axis)
    
    contas = ["Receita", "CMV", "EBITDA", "L. Liq."]
    for i, c in enumerate(contas):
        draw.text((cx - 280 + i*60, cy + 160), c, fill=SLATE_200, font=f_axis)
    
    # Tooltip
    draw_rounded_rect(draw, [cx + 120, cy - 100, cx + 450, cy - 30], 12, SLATE_800, outline=AMBER, width=2)
    draw.text((cx + 140, cy - 90), "Receita 2025-Q2", fill=AMBER, font=get_font(14, True))
    draw.text((cx + 140, cy - 70), "USD 14.200 M", fill=WHITE, font=get_font(18, True))
    draw.text((cx + 140, cy - 45), "Margem: 34.2%", fill=EMERALD, font=f_sm)
    
    img.save(OUT / "cena_07.png", quality=95)

# ===== CENA 8: Economia & Valuation =====
def cena_08():
    img = Image.new("RGB", (W, H), SLATE_900)
    draw = ImageDraw.Draw(img)
    
    f_title = get_font(24, True)
    f_val = get_font(28, True)
    f_lbl = get_font(13)
    f_sm = get_font(14)
    
    # Left: Macro
    draw.text((60, 30), "Dashboard Macroeconomico", fill=WHITE, font=f_title)
    draw.text((60, 60), "Banco Central do Brasil — API SGS", fill=SLATE_200, font=f_sm)
    
    draw.line([(W//2 - 10, 20), (W//2 - 10, H - 20)], fill=SLATE_700, width=2)
    
    # Selic + IPCA chart
    selic = [0.45, 0.5, 0.55, 0.65, 0.7, 0.75, 0.72, 0.68, 0.6, 0.55, 0.5, 0.52]
    ipca = [0.3, 0.32, 0.38, 0.42, 0.48, 0.52, 0.5, 0.45, 0.38, 0.35, 0.32, 0.34]
    draw_line_chart(draw, 60, 100, 860, 350, [selic, ipca], [EMERALD, CYAN])
    
    for i, (l, c) in enumerate([("Selic Meta", EMERALD), ("IPCA 12M", CYAN)]):
        draw.rectangle([80 + i*200, 470, 100 + i*200, 486], fill=c)
        draw.text((108 + i*200, 470), l, fill=SLATE_200, font=f_sm)
    
    # PTAX
    ptax = [0.4, 0.42, 0.45, 0.5, 0.55, 0.52, 0.58, 0.6, 0.62, 0.58, 0.55, 0.57]
    draw_line_chart(draw, 60, 520, 860, 300, [ptax], [AMBER])
    draw.text((80, 840), "USD/BRL PTAX", fill=AMBER, font=f_sm)
    
    # Right: Valuation
    draw.text((W//2 + 40, 30), "Valuation Corporativo — DCF", fill=WHITE, font=f_title)
    
    draw_kpi_card(draw, W//2 + 40, 80, 440, 80, "Fair Value", "R$ 42.80", AMBER, f_lbl, f_val)
    draw_kpi_card(draw, W//2 + 40, 170, 440, 80, "Upside", "+18.3%", EMERALD, f_lbl, f_val)
    
    # Bar chart for FCFF
    years_fc = ["2026", "2027", "2028", "2029", "2030", "2031"]
    fcff_vals = [0.5, 0.6, 0.7, 0.75, 0.8, 0.85]
    pv_vals = [0.45, 0.5, 0.55, 0.55, 0.55, 0.5]
    
    chart_x = W//2 + 40
    chart_y = 280
    chart_w = 880
    chart_h = 400
    draw_rounded_rect(draw, [chart_x, chart_y, chart_x + chart_w, chart_y + chart_h], 16, SLATE_800)
    
    bar_w = 50
    gap = 100
    for i, (fcff, pv) in enumerate(zip(fcff_vals, pv_vals)):
        bx = chart_x + 60 + i * (bar_w * 2 + gap)
        # FCFF bar
        bh = int(fcff * (chart_h - 80))
        draw.rectangle([bx, chart_y + chart_h - 40 - bh, bx + bar_w, chart_y + chart_h - 40], fill=EMERALD)
        # PV bar
        bh2 = int(pv * (chart_h - 80))
        draw.rectangle([bx + bar_w + 5, chart_y + chart_h - 40 - bh2, bx + bar_w * 2 + 5, chart_y + chart_h - 40], fill=CYAN)
        # Year label
        draw.text((bx + bar_w, chart_y + chart_h - 25), years_fc[i], fill=SLATE_200, font=get_font(11), anchor="mm")
    
    for i, (l, c) in enumerate([("FCFF Projetado", EMERALD), ("Valor Presente", CYAN)]):
        draw.rectangle([chart_x + 60 + i * 240, chart_y + chart_h + 15, chart_x + 80 + i * 240, chart_y + chart_h + 31], fill=c)
        draw.text((chart_x + 88 + i * 240, chart_y + chart_h + 15), l, fill=SLATE_200, font=f_sm)
    
    draw.text((chart_x + 60, chart_y + chart_h + 45), "WACC: 11.2%  |  Terminal Growth: 3.5%", fill=SLATE_500, font=f_sm)
    
    img.save(OUT / "cena_08.png", quality=95)

# ===== CENA 9: Fechamento =====
def cena_09():
    img = Image.new("RGB", (W, H), NAVY)
    draw = ImageDraw.Draw(img)
    
    # Grid pattern
    for i in range(0, W, 48):
        draw.line([(i, 0), (i, H)], fill=(16, 40, 72), width=1)
    for i in range(0, H, 48):
        draw.line([(0, i), (W, i)], fill=(16, 40, 72), width=1)
    
    # Glow
    for r in range(180, 0, -2):
        alpha_val = max(0, 25 - r // 8)
        c = (12 + alpha_val, 35 + alpha_val, 64 + alpha_val * 2)
        draw.ellipse([W//2 - r, 200 - r, W//2 + r, 200 + r], fill=c)
    
    # Cube
    cx, cy = W // 2, 200
    s = 80
    off = 48
    pts_front = [(cx-s, cy-s), (cx+s, cy-s), (cx+s, cy+s), (cx-s, cy+s)]
    draw.polygon(pts_front, fill=(20, 50, 80), outline=CORAL, width=3)
    pts_top = [(cx-s, cy-s), (cx-s+off, cy-s-off), (cx+s+off, cy-s-off), (cx+s, cy-s)]
    draw.polygon(pts_top, fill=(25, 55, 90), outline=CYAN, width=2)
    pts_right = [(cx+s, cy-s), (cx+s+off, cy-s-off), (cx+s+off, cy+s-off), (cx+s, cy+s)]
    draw.polygon(pts_right, fill=(18, 45, 75), outline=CORAL, width=2)
    
    # Title
    draw.text((W//2, 350), "Hyper Cube 4D", fill=WHITE, font=get_font(56, True), anchor="mm")
    draw.text((W//2, 400), "CONNECTED PLANNING ENGINE", fill=CORAL, font=get_font(24), anchor="mm")
    
    # Pillar icons
    pillars = [
        ("DRE ✓", CORAL), ("DFC ✓", CYAN), ("BP ✓", EMERALD),
        ("DAG ✓", AMBER), ("OLAP ✓", (168, 85, 247)),
    ]
    for i, (label, color) in enumerate(pillars):
        x = W//2 - 300 + i * 150
        draw_rounded_rect(draw, [x, 460, x+120, 500], 12, (20, 40, 65), outline=color, width=2)
        draw.text((x+60, 472), label, fill=color, font=get_font(16, True), anchor="mm")
    
    # Tagline
    draw.text((W//2, 560), "A infraestrutura de decisao", fill=WHITE, font=get_font(30, True), anchor="mm")
    draw.text((W//2, 600), "para a Empresa Agentica", fill=SLATE_200, font=get_font(28), anchor="mm")
    
    # CTA Button
    draw_rounded_rect(draw, [W//2 - 150, 670, W//2 + 150, 720], 28, CORAL)
    draw.text((W//2, 688), "Agende uma Demo →", fill=WHITE, font=get_font(20, True), anchor="mm")
    
    # Footer
    draw.text((W//2, H - 40), "Jose Eduardo Moraes (FP&A) · HyperCube Connected Planning", fill=SLATE_500, font=get_font(14), anchor="mm")
    
    img.save(OUT / "cena_09.png", quality=95)


# ===== MAIN =====
if __name__ == "__main__":
    print("Gerando 9 frames do storyboard...\n")
    
    generators = [cena_01, cena_02, cena_03, cena_04, cena_05, cena_06, cena_07, cena_08, cena_09]
    
    for i, gen in enumerate(generators, 1):
        gen()
        print(f"  [OK] Cena {i:02d} gerada: {OUT / f'cena_{i:02d}.png'}")
    
    print(f"\n[DONE] {len(generators)} frames gerados em {OUT}/")
    print("Frames prontos para visualizacao.")
