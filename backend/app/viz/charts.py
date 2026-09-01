import io
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import polars as pl

def generate_quarterly_evolution_chart(before_df: pl.DataFrame, after_df: pl.DataFrame) -> bytes:
    """Generates line chart of Quarterly Evolution of resultado_antes_da_tributacao and lucro_liquido."""
    df_b = before_df.select(["data", "resultado_antes_da_tributacao", "lucro_liquido"]).to_pandas()
    df_a = after_df.select(["data", "resultado_antes_da_tributacao", "lucro_liquido"]).to_pandas()

    df_b["Scenario"] = "Antes"
    df_a["Scenario"] = "Depois"

    df_combined = pl.concat([
        before_df.select(["data", "lucro_liquido"]).with_columns(pl.lit("Antes").alias("Cenário")),
        after_df.select(["data", "lucro_liquido"]).with_columns(pl.lit("Depois").alias("Cenário"))
    ]).to_pandas()

    try:
        from backend.app.data.loader import get_active_company_info
        comp = get_active_company_info()
        comp_name = comp.get("name", "Empresa")
        curr = comp.get("currency", "R$")
    except Exception:
        comp_name = "Empresa"
        curr = "R$"

    dates = df_combined["data"].astype(str).tolist()
    years = [d[:4] for d in dates if len(d) >= 4 and d[:4].isdigit()]
    if years:
        min_y, max_y = min(years), max(years)
        period_str = f"({min_y}–{max_y})" if min_y != max_y else f"({min_y})"
    else:
        period_str = ""

    plt.figure(figsize=(12, 5))
    sns.set_theme(style="whitegrid")
    sns.lineplot(data=df_combined, x="data", y="lucro_liquido", hue="Cenário", marker="o")
    plt.title(f"Evolução do Lucro Líquido {period_str} — {comp_name} (Antes vs Depois)")
    plt.xlabel("Período / Data")
    plt.ylabel(f"Lucro Líquido ({curr})")
    plt.xticks(rotation=45)
    plt.gca().xaxis.set_major_locator(plt.MaxNLocator(12))
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=150)
    plt.close()
    buf.seek(0)
    return buf.getvalue()

def generate_annual_comparison_chart(before_df: pl.DataFrame, after_df: pl.DataFrame) -> bytes:
    """Generates bar chart of Annual Lucro Líquido (summed by year)."""
    b_ann = before_df.group_by("ano").agg(pl.col("lucro_liquido").sum().alias("Antes")).sort("ano")
    a_ann = after_df.group_by("ano").agg(pl.col("lucro_liquido").sum().alias("Depois")).sort("ano")

    merged = b_ann.join(a_ann, on="ano").to_pandas()
    melted = merged.melt(id_vars=["ano"], value_vars=["Antes", "Depois"], var_name="Cenário", value_name="Lucro_Líquido")

    try:
        from backend.app.data.loader import get_active_company_info
        comp = get_active_company_info()
        comp_name = comp.get("name", "Empresa")
        curr = comp.get("currency", "R$")
    except Exception:
        comp_name = "Empresa"
        curr = "R$"

    plt.figure(figsize=(12, 5))
    sns.set_theme(style="whitegrid")
    sns.barplot(data=melted, x="ano", y="Lucro_Líquido", hue="Cenário", palette="muted")
    plt.title(f"Lucro Líquido Anual Acumulado — {comp_name} (Antes vs Depois da Simulação)")
    plt.xlabel("Ano / Exercício")
    plt.ylabel(f"Lucro Líquido Anual ({curr})")
    plt.xticks(rotation=45)
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=150)
    plt.close()
    buf.seek(0)
    return buf.getvalue()
