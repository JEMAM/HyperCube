import pytest
from backend.app.data.loader import load_dre_data
from backend.app.engine.hyperblock_engine import PolarsHyperblockEngine

def test_quarterly_reactive_engine():
    df = load_dre_data()
    engine = PolarsHyperblockEngine(df)

    initial_profit = float(engine.get_dataframe()["lucro_liquido"].sum())
    metrics = engine.apply_assumption_change("despesas_de_captacao", 10.0, start_year=2024, end_year=2025)
    updated_profit = float(engine.get_dataframe()["lucro_liquido"].sum())

    assert metrics["recalculated_nodes_count"] == 4
    assert updated_profit != initial_profit
