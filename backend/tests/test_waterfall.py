"""
Tests for WaterfallDecomposer and EBITDA/Revenue variance bridge.
Ensures mathematical consistency: Base + sum(step.delta) == Target
"""

import pytest
from backend.app.engine.multidim_cube import MultiDimCube
from backend.app.engine.waterfall_decomposer import WaterfallDecomposer


def test_waterfall_ebitda_bridge_closure():
    cube = MultiDimCube()
    decomposer = WaterfallDecomposer(cube)

    res = decomposer.compute_bridge(
        base_version="Actuals",
        target_version="Actuals",
        metric="EBITDA",
        filters={"base_time": "2025_Q4", "target_time": "2026_Q4"}
    )

    assert res["metric"] == "EBITDA"
    assert "steps" in res
    assert len(res["steps"]) >= 3

    # Check that the first step is start and last is target
    start_step = res["steps"][0]
    target_step = res["steps"][-1]
    assert start_step["category"] == "total"
    assert target_step["category"] == "total"

    # Check mathematical closure: Base + sum(intermediate deltas) == Target
    intermediate_steps = [s for s in res["steps"] if s["category"] == "step"]
    sum_deltas = sum(s["delta"] for s in intermediate_steps)

    expected_target = round(start_step["delta"] + sum_deltas, 2)
    assert abs(expected_target - target_step["delta"]) < 0.05, (
        f"Waterfall does not close: Base({start_step['delta']}) + Sum({sum_deltas}) = {expected_target} != Target({target_step['delta']})"
    )


def test_waterfall_revenue_bridge_closure():
    cube = MultiDimCube()
    decomposer = WaterfallDecomposer(cube)

    res = decomposer.compute_bridge(
        base_version="Actuals",
        target_version="Actuals",
        metric="Receita_Liquida",
        filters={"base_time": "2025_Q3", "target_time": "2026_Q3"}
    )

    assert res["metric"] == "Receita_Liquida"
    start_step = res["steps"][0]
    target_step = res["steps"][-1]
    intermediate_steps = [s for s in res["steps"] if s["category"] == "step"]
    sum_deltas = sum(s["delta"] for s in intermediate_steps)

    expected_target = round(start_step["delta"] + sum_deltas, 2)
    assert abs(expected_target - target_step["delta"]) < 0.05


def test_waterfall_net_income_bridge_closure():
    cube = MultiDimCube()
    decomposer = WaterfallDecomposer(cube)

    res = decomposer.compute_bridge(
        base_version="Actuals",
        target_version="Actuals",
        metric="Lucro_Liquido",
        filters={"base_time": "2025_Q2", "target_time": "2026_Q2"}
    )

    assert res["metric"] == "Lucro_Liquido"
    start_step = res["steps"][0]
    target_step = res["steps"][-1]
    intermediate_steps = [s for s in res["steps"] if s["category"] == "step"]
    sum_deltas = sum(s["delta"] for s in intermediate_steps)

    expected_target = round(start_step["delta"] + sum_deltas, 2)
    assert abs(expected_target - target_step["delta"]) < 0.05
