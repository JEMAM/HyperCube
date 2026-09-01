import duckdb
import polars as pl
from typing import Dict, List, Any

class DuckDBAnalytics:
    def __init__(self, df: pl.DataFrame):
        self.conn = duckdb.connect(database=':memory:')
        self.conn.register('dre_quarterly', df)

    def summary_kpis(self) -> Dict[str, float]:
        """Calculates DRE KPIs across quarters, returning latest quarter for custom uploads (<=4 periods)."""
        query_latest = """
        SELECT 
            produto_da_intermediacao_financeira,
            resultado_da_intermediacao_financeira,
            resultado_antes_da_tributacao,
            lucro_liquido
        FROM dre_quarterly
        ORDER BY data DESC
        LIMIT 1
        """
        query_sum = """
        SELECT 
            SUM(produto_da_intermediacao_financeira) AS Total_Produto_Intermediacao,
            SUM(resultado_da_intermediacao_financeira) AS Total_Resultado_Intermediacao,
            SUM(resultado_antes_da_tributacao) AS Total_Resultado_Antes_Tributacao,
            SUM(lucro_liquido) AS Total_Lucro_Liquido,
            COUNT(*) AS period_count
        FROM dre_quarterly
        """
        res_sum = self.conn.execute(query_sum).fetchone()
        res_latest = self.conn.execute(query_latest).fetchone()

        period_count = res_sum[4] if res_sum and len(res_sum) > 4 else 96

        if period_count <= 4 and res_latest:
            return {
                "Total_Produto_Intermediacao": round(res_latest[0] or 0.0, 2),
                "Total_Resultado_Intermediacao": round(res_latest[1] or 0.0, 2),
                "Total_Resultado_Antes_Tributacao": round(res_latest[2] or 0.0, 2),
                "Total_Lucro_Liquido": round(res_latest[3] or 0.0, 2)
            }

        return {
            "Total_Produto_Intermediacao": round(res_sum[0] or 0.0, 2),
            "Total_Resultado_Intermediacao": round(res_sum[1] or 0.0, 2),
            "Total_Resultado_Antes_Tributacao": round(res_sum[2] or 0.0, 2),
            "Total_Lucro_Liquido": round(res_sum[3] or 0.0, 2)
        }

    def resultado_por_ano(self) -> List[Dict[str, Any]]:
        """
        Aggregates financial performance by calendar year and calculates YoY growth rates.
        """
        query = """
        WITH annual_summary AS (
            SELECT 
                ano,
                SUM(produto_da_intermediacao_financeira) AS produto_intermediacao,
                SUM(resultado_da_intermediacao_financeira) AS resultado_intermediacao,
                SUM(resultado_antes_da_tributacao) AS resultado_antes_tributacao,
                SUM(lucro_liquido) AS lucro_liquido
            FROM dre_quarterly
            GROUP BY ano
        )
        SELECT 
            ano,
            produto_intermediacao,
            resultado_intermediacao,
            resultado_antes_tributacao,
            lucro_liquido,
            COALESCE(LAG(lucro_liquido) OVER (ORDER BY ano), 0.0) AS lucro_liquido_prev_year,
            ROUND(
                CASE 
                    WHEN LAG(lucro_liquido) OVER (ORDER BY ano) IS NULL OR LAG(lucro_liquido) OVER (ORDER BY ano) = 0 THEN 0.0
                    ELSE ((lucro_liquido - LAG(lucro_liquido) OVER (ORDER BY ano)) / ABS(LAG(lucro_liquido) OVER (ORDER BY ano))) * 100.0
                END, 2
            ) AS yoy_growth_pct
        FROM annual_summary
        ORDER BY ano ASC
        """
        res = self.conn.execute(query).df().fillna(0.0)
        return res.to_dict(orient='records')
