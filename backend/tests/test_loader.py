import pytest
from backend.app.data.loader import load_dre_data

def test_loader_canonical_schema_and_quarters():
    df = load_dre_data()
    assert df.shape[0] >= 90
    assert "lucro_liquido" in df.columns
    assert "resultado_antes_da_tributacao" in df.columns
    assert "produto_da_intermediacao_financeira" in df.columns
    assert df["ano"].min() == 2002
    assert df["ano"].max() == 2025
