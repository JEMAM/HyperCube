"""
Unit and Integration Tests for Covenant Monitoring Engine & Board Advisor Agent
==============================================================================
Validates debt covenant compliance, EBITDA/debt headroom calculations,
early warning detection, executive board memorandum generation, and REST endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.engine.covenant_monitor_engine import CovenantMonitorEngine, CovenantRule
from backend.app.agents.board_advisor_agent import BoardAdvisorAgent


@pytest.fixture
def client():
    return TestClient(app)


class TestCovenantRule:
    def test_covenant_rule_safe_evaluation(self):
        rule = CovenantRule(
            covenant_id="test_leverage",
            name="Max Leverage",
            description="Test leverage rule",
            operator="<=",
            threshold=3.5,
            unit="x",
            category="Alavancagem"
        )
        res = rule.evaluate(2.1)
        assert res["is_compliant"] is True
        assert res["status"] == "SAFE"
        assert res["buffer_pct"] > 15.0

    def test_covenant_rule_warning_evaluation(self):
        rule = CovenantRule(
            covenant_id="test_leverage",
            name="Max Leverage",
            description="Test leverage rule",
            operator="<=",
            threshold=3.5,
            unit="x",
            category="Alavancagem"
        )
        # Value 3.3 is within 15% of 3.5 (buffer is ~5.7%)
        res = rule.evaluate(3.3)
        assert res["is_compliant"] is True
        assert res["status"] == "WARNING"

    def test_covenant_rule_breach_evaluation(self):
        rule = CovenantRule(
            covenant_id="test_leverage",
            name="Max Leverage",
            description="Test leverage rule",
            operator="<=",
            threshold=3.5,
            unit="x",
            category="Alavancagem"
        )
        res = rule.evaluate(3.8)
        assert res["is_compliant"] is False
        assert res["status"] == "BREACH"


class TestCovenantMonitorEngine:
    def test_engine_evaluates_four_covenants(self):
        engine = CovenantMonitorEngine(company_id="klabin")
        res = engine.evaluate_covenants()

        assert res["company_id"] == "klabin"
        assert "covenants" in res
        assert len(res["covenants"]) == 4

        cov_ids = [c["covenant_id"] for c in res["covenants"]]
        assert "net_debt_ebitda" in cov_ids
        assert "interest_coverage_ratio" in cov_ids
        assert "current_ratio" in cov_ids
        assert "equity_to_assets" in cov_ids

    def test_financial_headroom_math(self):
        engine = CovenantMonitorEngine(company_id="klabin")
        res = engine.evaluate_covenants()
        headrooms = res["headrooms"]

        assert "ebitda_headroom_brl" in headrooms
        assert "debt_headroom_brl" in headrooms
        assert headrooms["current_ebitda"] > 0
        assert headrooms["current_cash"] > 0

    def test_covenant_override(self):
        engine = CovenantMonitorEngine(company_id="vale")
        # Strict override: 1.0x leverage
        res = engine.evaluate_covenants(covenants_override={"net_debt_ebitda": 1.0})
        lev_cov = next(c for c in res["covenants"] if c["covenant_id"] == "net_debt_ebitda")
        assert lev_cov["threshold"] == 1.0

    def test_rolling_timeline_covenants(self):
        engine = CovenantMonitorEngine(company_id="petrobras")
        res = engine.evaluate_covenants()
        timeline = res["timeline"]

        assert len(timeline) == 8
        for q in timeline:
            assert "leverage_ratio" in q
            assert "debt_headroom_brl" in q
            assert "is_compliant" in q


class TestBoardAdvisorAgent:
    def test_board_memo_generation_structure(self):
        agent = BoardAdvisorAgent(company_id="klabin")
        memo = agent.generate_board_memo()

        assert memo["company_id"] == "klabin"
        assert "memo_markdown" in memo
        assert len(memo["memo_markdown"]) > 300
        assert "metrics" in memo

        md_upper = memo["memo_markdown"].upper()
        # Check required governance memo sections
        assert "SUMÁRIO EXECUTIVO" in md_upper or "PARECER" in md_upper or "MEMORANDO" in md_upper
        assert "COVENANT" in md_upper
        assert "FLEURIET" in md_upper or "LIQUIDEZ" in md_upper


class TestGovernanceAPIRoutes:
    def test_get_covenants_endpoint(self, client):
        response = client.get("/api/governance/covenants?company_id=klabin")
        assert response.status_code == 200
        data = response.json()
        assert data["company_id"] == "klabin"
        assert len(data["covenants"]) == 4
        assert "headrooms" in data

    def test_post_board_memo_endpoint(self, client):
        response = client.post("/api/governance/board-memo", json={"company_id": "klabin"})
        assert response.status_code == 200
        data = response.json()
        assert data["company_id"] == "klabin"
        assert "memo_markdown" in data

    def test_get_board_pack_endpoint(self, client):
        response = client.get("/api/governance/board-pack?company_id=klabin")
        assert response.status_code == 200
        data = response.json()
        assert data["company_id"] == "klabin"
        assert "covenants" in data
        assert "memo" in data
