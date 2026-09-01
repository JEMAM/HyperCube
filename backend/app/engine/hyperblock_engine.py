import time
import polars as pl
from typing import Dict, List, Callable, Optional
from backend.app.graph.dag_builder import BankingFinancialDAG

class PolarsHyperblockEngine:
    """
    Reactive Multidimensional Calculation Engine for Quarterly Banking DRE.
    Executes topological order recalculations touching ONLY affected descendant nodes
    across all quarters in vectorized Polars expressions.
    """
    def __init__(self, df: pl.DataFrame, dag: BankingFinancialDAG = None):
        self.df = df.clone()
        self.dag = dag or BankingFinancialDAG()
        self.formulas: Dict[str, Callable[[pl.DataFrame], pl.Expr]] = {}
        self.recalc_log: List[Dict[str, float]] = []
        self._register_banking_formulas()

    def _register_banking_formulas(self):
        """Registers default vectorized Polars expressions for DRE DAG nodes."""
        self.set_formula(
            "produto_da_intermediacao_financeira",
            lambda df: (
                pl.col("receita_com_operacoes_de_credito_e_repasses") +
                (pl.col("receita_titulos_valores_mobiliarios") if "receita_titulos_valores_mobiliarios" in df.columns else pl.lit(0.0)) +
                pl.col("despesas_de_captacao")
            )
        )
        self.set_formula(
            "resultado_da_intermediacao_financeira",
            lambda df: (
                pl.col("produto_da_intermediacao_financeira") +
                (pl.col("provisao_para_risco_de_credito_prc") if "provisao_para_risco_de_credito_prc" in df.columns else pl.lit(0.0))
            )
        )
        
        # Only register detailed participations formula if its sub-columns exist
        part_cols = [
            "receita_de_dividendos_e_juros_sobre_o_capital_proprio",
            "resultado_com_equivalencia_patrimonial",
            "reversao_constituicao_de_provisao_para_ajuste_de_investimentos",
            "resultado_com_alienacoes_de_titulos_de_renda_variavel",
            "resultado_com_derivativos_renda_variavel",
            "resultado_com_fundos_participacoes_societarias",
            "outras_rendas_despesas_sobre_participacoes_societarias"
        ]
        if all(c in self.df.columns for c in part_cols):
            self.set_formula(
                "resultado_com_participacoes_societarias",
                lambda df: sum(pl.col(c) for c in part_cols)
            )

        self.set_formula(
            "resultado_antes_da_tributacao",
            lambda df: (
                pl.col("resultado_da_intermediacao_financeira") +
                (pl.col("resultado_com_participacoes_societarias") if "resultado_com_participacoes_societarias" in df.columns else pl.lit(0.0)) +
                (pl.col("despesas_pessoal_e_administrativas") if "despesas_pessoal_e_administrativas" in df.columns else pl.lit(0.0)) +
                (pl.col("despesas_tributarias") if "despesas_tributarias" in df.columns else pl.lit(0.0)) +
                (pl.col("outras_despesas_liquidas") if "outras_despesas_liquidas" in df.columns else pl.lit(0.0))
            )
        )
        self.set_formula(
            "lucro_liquido",
            lambda df: (
                pl.col("resultado_antes_da_tributacao") +
                (pl.col("tributos_sobre_o_lucro") if "tributos_sobre_o_lucro" in df.columns else pl.lit(0.0)) +
                (pl.col("participacao_nos_lucros") if "participacao_nos_lucros" in df.columns else pl.lit(0.0))
            )
        )

    def set_formula(self, node: str, formula_fn: Callable[[pl.DataFrame], pl.Expr]):
        self.formulas[node] = formula_fn

    def recalculate(self, changed_nodes: List[str]) -> Dict[str, float]:
        start_time = time.perf_counter()
        affected = self.dag.get_affected_nodes(changed_nodes)

        recalculated_count = 0
        for node in affected:
            if node in self.formulas:
                expr = self.formulas[node](self.df)
                self.df = self.df.with_columns(expr.alias(node))
                recalculated_count += 1

        reactive_time = (time.perf_counter() - start_time) * 1000  # in ms

        # Benchmark full recalculation
        full_start = time.perf_counter()
        full_topo = self.dag.get_topological_sort()
        for node in full_topo:
            if node in self.formulas:
                expr = self.formulas[node](self.df)
                _ = self.df.with_columns(expr.alias(node))
        full_time = (time.perf_counter() - full_start) * 1000  # in ms

        metrics = {
            "changed_nodes": changed_nodes,
            "affected_nodes": affected,
            "recalculated_nodes_count": recalculated_count,
            "reactive_time_ms": round(reactive_time, 4),
            "full_recalc_time_ms": round(full_time, 4),
            "speedup": round(full_time / reactive_time, 2) if reactive_time > 0 else 1.0
        }
        self.recalc_log.append(metrics)
        print(f"[HyperblockEngine] Reactive update executed for {changed_nodes} -> Affected {affected} in {reactive_time:.3f}ms")
        return metrics

    def apply_assumption_change(
        self,
        node: str,
        change_pct: float,
        start_year: Optional[int] = None,
        end_year: Optional[int] = None
    ) -> Dict[str, float]:
        """
        Applies a what-if assumption change (% change) to a specific input node,
        optionally filtered by calendar year date range (e.g., 2024–2025).
        """
        if node not in self.df.columns:
            raise ValueError(f"Node '{node}' not found in engine DataFrame.")

        multiplier = 1.0 + (change_pct / 100.0)

        cond = pl.lit(True)
        if start_year is not None:
            cond = cond & (pl.col("ano") >= start_year)
        if end_year is not None:
            cond = cond & (pl.col("ano") <= end_year)

        self.df = self.df.with_columns(
            pl.when(cond)
            .then(pl.col(node) * multiplier)
            .otherwise(pl.col(node))
            .alias(node)
        )

        return self.recalculate([node])

    def get_dataframe(self) -> pl.DataFrame:
        return self.df

if __name__ == "__main__":
    from backend.app.data.loader import load_dre_data
    df_raw = load_dre_data()
    engine = PolarsHyperblockEngine(df_raw)

    print("Initial Lucro Líquido Total:", engine.get_dataframe()["lucro_liquido"].sum())
    metrics = engine.apply_assumption_change("despesas_de_captacao", 10.0, start_year=2024, end_year=2025)
    print("After +10% funding expenses in 2024-2025:")
    print("Metrics:", metrics)
    print("Updated Lucro Líquido Total:", engine.get_dataframe()["lucro_liquido"].sum())
