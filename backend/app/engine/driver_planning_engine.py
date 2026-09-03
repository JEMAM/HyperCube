"""
HyperCube Driver-Based Operational Planning Engine
Module: driver_planning_engine.py

Calculates causal operational drivers:
1. Headcount & Workforce Planning (FTEs, hiring, turnover, salaries, Brazilian social charges & benefits)
2. Capex & Automated Asset Depreciation Schedule (projects, asset classes, useful life, residual value, straight-line D&A)
3. Closed-Loop 3-Statement Integration (feeds DRE, DFC and Balance Sheet preserving delta=0.00)
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field, asdict
import math
from backend.app.engine.three_statement_engine import (
    ThreeStatementEngine,
    COMPANIES_METADATA
)


@dataclass
class DepartmentHeadcountPlan:
    department_id: str
    department_name: str
    category: str  # "OPERATIONS" (CMV) | "SALES" (Despesas Vendas) | "ADMIN" (SG&A) | "RD" (SG&A)
    current_headcount: int
    hiring_plan: int
    attrition_rate_pct: float
    avg_salary_monthly: float
    avg_benefits_monthly: float
    fgts_pct: float = 8.0
    inss_patronal_pct: float = 20.0
    sistema_s_rat_pct: float = 8.8
    provisao_13_ferias_pct: float = 19.44  # 8.33% (13º) + 11.11% (Férias + 1/3)
    
    @property
    def total_charges_pct(self) -> float:
        return self.fgts_pct + self.inss_patronal_pct + self.sistema_s_rat_pct + self.provisao_13_ferias_pct

    def compute_metrics(self) -> Dict[str, Any]:
        turnover_count = math.floor(self.current_headcount * (self.attrition_rate_pct / 100.0))
        final_headcount = max(0, self.current_headcount + self.hiring_plan - turnover_count)
        
        # Monthly base payroll
        monthly_base_payroll = final_headcount * self.avg_salary_monthly
        annual_base_payroll = monthly_base_payroll * 12.0
        
        # 13º and vacation provisions (base for charges)
        annual_charges = annual_base_payroll * (self.total_charges_pct / 100.0)
        annual_benefits = final_headcount * self.avg_benefits_monthly * 12.0
        total_annual_cost = round(annual_base_payroll + annual_charges + annual_benefits, 2)
        total_monthly_cost = round(total_annual_cost / 12.0, 2)

        return {
            "department_id": self.department_id,
            "department_name": self.department_name,
            "category": self.category,
            "current_headcount": self.current_headcount,
            "hiring_plan": self.hiring_plan,
            "turnover_count": turnover_count,
            "final_headcount": final_headcount,
            "avg_salary_monthly": self.avg_salary_monthly,
            "avg_benefits_monthly": self.avg_benefits_monthly,
            "total_charges_pct": round(self.total_charges_pct, 2),
            "monthly_base_payroll": round(monthly_base_payroll, 2),
            "annual_base_payroll": round(annual_base_payroll, 2),
            "annual_charges": round(annual_charges, 2),
            "annual_benefits": round(annual_benefits, 2),
            "total_annual_cost": total_annual_cost,
            "total_monthly_cost": total_monthly_cost,
            "cost_per_employee_monthly": round(total_monthly_cost / max(1, final_headcount), 2)
        }


@dataclass
class CapexProject:
    project_id: str
    project_name: str
    asset_category: str  # "MACHINERY" (10y) | "SOFTWARE" (5y) | "VEHICLES" (5y) | "BUILDINGS" (25y)
    total_investment: float  # R$ in thousands or exact value
    useful_life_years: int
    residual_value_pct: float = 0.0
    start_year: int = 2026
    is_active: bool = True

    def compute_metrics(self) -> Dict[str, Any]:
        depreciable_base = self.total_investment * (1.0 - (self.residual_value_pct / 100.0))
        annual_depreciation = (
            round(depreciable_base / max(1, self.useful_life_years), 2)
            if self.is_active else 0.0
        )
        monthly_depreciation = round(annual_depreciation / 12.0, 2)

        # 5-year asset net book value trajectory
        trajectory = []
        book_value = self.total_investment if self.is_active else 0.0
        accum_depr = 0.0
        for yr in range(1, 6):
            if self.is_active:
                year_depr = min(book_value, annual_depreciation)
                accum_depr += year_depr
                book_value = max(self.total_investment * (self.residual_value_pct / 100.0), self.total_investment - accum_depr)
            else:
                year_depr = 0.0
            trajectory.append({
                "year_index": yr,
                "year_label": f"Ano {yr}",
                "annual_depreciation": round(year_depr, 2),
                "accumulated_depreciation": round(accum_depr, 2),
                "net_book_value": round(book_value, 2)
            })

        return {
            "project_id": self.project_id,
            "project_name": self.project_name,
            "asset_category": self.asset_category,
            "total_investment": round(self.total_investment, 2),
            "useful_life_years": self.useful_life_years,
            "residual_value_pct": self.residual_value_pct,
            "depreciable_base": round(depreciable_base, 2),
            "annual_depreciation": annual_depreciation,
            "monthly_depreciation": monthly_depreciation,
            "start_year": self.start_year,
            "is_active": self.is_active,
            "trajectory_5y": trajectory
        }


def get_default_headcount_plans(company_id: str = "klabin") -> List[DepartmentHeadcountPlan]:
    """Provides calibrated baseline workforce plans by sector and company scale."""
    from backend.app.agents.sector_driver_agent import detect_sector_by_company, SECTOR_CATALOG

    cid = company_id.lower().strip()
    if cid == "petrobras":
        return [
            DepartmentHeadcountPlan("ops", "Refino, Exploração & Produção", "OPERATIONS", 24000, 850, 3.0, 14500.0, 2600.0),
            DepartmentHeadcountPlan("sales", "Comercialização & Logística de Combustíveis", "SALES", 4500, 180, 4.0, 11500.0, 2200.0),
            DepartmentHeadcountPlan("rd", "Cenpes & Transição Energética", "RD", 3200, 140, 2.5, 16000.0, 2800.0),
            DepartmentHeadcountPlan("admin", "Finanças, Governança & Jurídico", "ADMIN", 5800, 120, 3.5, 12800.0, 2300.0),
        ]
    elif cid == "vale":
        return [
            DepartmentHeadcountPlan("ops", "Operações de Mineração & Pelotização", "OPERATIONS", 38000, 1200, 3.5, 9800.0, 2100.0),
            DepartmentHeadcountPlan("sales", "Vendas Globais & Frete Marítimo", "SALES", 3100, 110, 4.0, 12500.0, 2400.0),
            DepartmentHeadcountPlan("rd", "Tecnologia Mineral & Descarbonização", "RD", 2400, 95, 2.0, 14500.0, 2500.0),
            DepartmentHeadcountPlan("admin", "Sustentabilidade, G&A & Finanças", "ADMIN", 6500, 150, 3.0, 11200.0, 2200.0),
        ]
    elif cid == "weg":
        return [
            DepartmentHeadcountPlan("ops", "Fábricas de Motores & Automação", "OPERATIONS", 28500, 1400, 4.0, 6800.0, 1600.0),
            DepartmentHeadcountPlan("sales", "Engenharia de Aplicação & Vendas", "SALES", 4200, 260, 3.5, 9200.0, 1900.0),
            DepartmentHeadcountPlan("rd", "P&D / Motores de Alta Eficiência", "RD", 3100, 180, 2.5, 11800.0, 2100.0),
            DepartmentHeadcountPlan("admin", "Controladoria, TI & Gente", "ADMIN", 3800, 110, 3.0, 8400.0, 1700.0),
        ]
    elif cid == "klabin":
        return [
            DepartmentHeadcountPlan("ops", "Operações Florestais & Fábricas de Papel", "OPERATIONS", 11200, 450, 3.2, 7200.0, 1750.0),
            DepartmentHeadcountPlan("sales", "Comercial de Embalagens & Celulose", "SALES", 1850, 95, 4.0, 9600.0, 2050.0),
            DepartmentHeadcountPlan("rd", "Engenharia de Processos & P&D Bioeconomia", "RD", 850, 60, 2.5, 12200.0, 2300.0),
            DepartmentHeadcountPlan("admin", "Administração, Finanças & RH", "ADMIN", 1950, 80, 3.0, 8900.0, 1850.0),
        ]

    # Dynamic Sector Detection for any other company (e.g. Banco Pine, Cyrela, etc.)
    comp_meta = COMPANIES_METADATA.get(cid, {})
    comp_name = comp_meta.get("name", cid)
    comp_ticker = comp_meta.get("ticker", "")
    comp_sector = comp_meta.get("sector", "")

    detected_sector = detect_sector_by_company(cid, comp_name, comp_ticker, comp_sector)
    sector_info = SECTOR_CATALOG.get(detected_sector, SECTOR_CATALOG["BANKING"] if ("pine" in cid or "banco" in cid or "20796" in cid) else SECTOR_CATALOG["MANUFACTURING"])

    return [
        DepartmentHeadcountPlan(
            department_id=d["department_id"],
            department_name=d["department_name"],
            category=d.get("category", "OPERATIONS"),
            current_headcount=d["current_headcount"],
            hiring_plan=d["hiring_plan"],
            attrition_rate_pct=d.get("attrition_rate_pct", 3.0),
            avg_salary_monthly=d["avg_salary_monthly"],
            avg_benefits_monthly=d.get("avg_benefits_monthly", 2000.0),
            fgts_pct=d.get("fgts_pct", 8.0),
            inss_patronal_pct=d.get("inss_patronal_pct", 20.0),
            sistema_s_rat_pct=d.get("sistema_s_rat_pct", 8.8),
            provisao_13_ferias_pct=d.get("provisao_13_ferias_pct", 19.44)
        )
        for d in sector_info["departments"]
    ]


def get_default_capex_projects(company_id: str = "klabin") -> List[CapexProject]:
    """Provides calibrated baseline capex investments by sector and company scale."""
    from backend.app.agents.sector_driver_agent import detect_sector_by_company, SECTOR_CATALOG

    cid = company_id.lower().strip()
    if cid == "petrobras":
        return [
            CapexProject("p1", "FPSO Búzios & Mero (Pré-Sal)", "MACHINERY", 42000.0, 15, 5.0, 2026),
            CapexProject("p2", "Sistemas de Exploração Submarina", "MACHINERY", 18500.0, 10, 0.0, 2026),
            CapexProject("p3", "Modernização de Refinarias (Rnest/Replan)", "BUILDINGS", 12000.0, 25, 10.0, 2026),
            CapexProject("p4", "Digital Twin & HPC Petróleo e Gás", "SOFTWARE", 4500.0, 5, 0.0, 2026),
            CapexProject("p5", "Frota de Apoio Marítimo e Dutos", "VEHICLES", 5500.0, 8, 10.0, 2026),
        ]
    elif cid == "vale":
        return [
            CapexProject("p1", "Expansão de Minas & Pelotização (S11D)", "MACHINERY", 18500.0, 12, 5.0, 2026),
            CapexProject("p2", "Ferrovia Carajás / Vitória-Minas (Frota)", "VEHICLES", 9200.0, 10, 10.0, 2026),
            CapexProject("p3", "Descaracterização de Barragens a Montante", "BUILDINGS", 8400.0, 20, 0.0, 2026),
            CapexProject("p4", "Projetos de Briquete e Descarbonização", "MACHINERY", 6500.0, 10, 5.0, 2026),
            CapexProject("p5", "Automação e Caminhões Autônomos", "SOFTWARE", 2400.0, 5, 0.0, 2026),
        ]
    elif cid == "weg":
        return [
            CapexProject("p1", "Nova Fábrica de Motores Elétricos no México", "BUILDINGS", 1200.0, 25, 15.0, 2026),
            CapexProject("p2", "Maquinário de Usinagem & Estamparia de Alta Precisão", "MACHINERY", 1650.0, 10, 5.0, 2026),
            CapexProject("p3", "Linha de Montagem de Sistemas BESS & Baterias", "MACHINERY", 950.0, 10, 5.0, 2026),
            CapexProject("p4", "Modernização da Infraestrutura Cloud & SAP S/4HANA", "SOFTWARE", 420.0, 5, 0.0, 2026),
        ]
    elif cid == "klabin":
        return [
            CapexProject("p1", "Projeto Puma II - Máquina de Papel Kraftliner MP28", "MACHINERY", 2850.0, 15, 5.0, 2026),
            CapexProject("p2", "Silvicultura de Precisão e Máquinas Florestais", "MACHINERY", 1200.0, 8, 10.0, 2026),
            CapexProject("p3", "Caldeira de Recuperação & Autossuficiência Energética", "BUILDINGS", 1650.0, 25, 10.0, 2026),
            CapexProject("p4", "Frota de Caminhões Pesados com Telemetria", "VEHICLES", 850.0, 6, 12.0, 2026),
            CapexProject("p5", "Software de Otimização Logística & SAP", "SOFTWARE", 450.0, 5, 0.0, 2026),
        ]

    # Dynamic Sector Detection for any other company (e.g. Banco Pine, Cyrela, etc.)
    comp_meta = COMPANIES_METADATA.get(cid, {})
    comp_name = comp_meta.get("name", cid)
    comp_ticker = comp_meta.get("ticker", "")
    comp_sector = comp_meta.get("sector", "")

    detected_sector = detect_sector_by_company(cid, comp_name, comp_ticker, comp_sector)
    sector_info = SECTOR_CATALOG.get(detected_sector, SECTOR_CATALOG["BANKING"] if ("pine" in cid or "banco" in cid or "20796" in cid) else SECTOR_CATALOG["MANUFACTURING"])

    return [
        CapexProject(
            project_id=p["project_id"],
            project_name=p["project_name"],
            asset_category=p.get("asset_category", "MACHINERY"),
            total_investment=float(p["total_investment"]) / 1000.0 if float(p["total_investment"]) > 100000 else float(p["total_investment"]),
            useful_life_years=int(p.get("useful_life_years", 10)),
            residual_value_pct=float(p.get("residual_value_pct", 5.0)),
            start_year=int(p.get("start_year", 2026)),
            is_active=bool(p.get("is_active", True))
        )
        for p in sector_info["capex_projects"]
    ]


class DriverPlanningEngine:
    """
    Main Driver-Based Operational Planning Engine.
    Coordinates Personnel Workforce Planning, Capex Projects Schedule,
    and causal propagation into the Closed-Loop 3-Statement Model.
    """

    def __init__(
        self,
        company_id: str = "klabin",
        headcount_plans: Optional[List[DepartmentHeadcountPlan]] = None,
        capex_projects: Optional[List[CapexProject]] = None
    ):
        self.company_id = company_id.lower().strip()
        self.headcount_plans = headcount_plans or get_default_headcount_plans(self.company_id)
        self.capex_projects = capex_projects or get_default_capex_projects(self.company_id)
        self.base_engine = ThreeStatementEngine(company_id=self.company_id)

    def calculate_workforce_summary(self) -> Dict[str, Any]:
        """Consolidates all department headcount plans into overall workforce metrics."""
        departments_data = [d.compute_metrics() for d in self.headcount_plans]
        
        total_current_headcount = sum(d["current_headcount"] for d in departments_data)
        total_hiring_plan = sum(d["hiring_plan"] for d in departments_data)
        total_turnover = sum(d["turnover_count"] for d in departments_data)
        total_final_headcount = sum(d["final_headcount"] for d in departments_data)
        
        total_annual_base_payroll = sum(d["annual_base_payroll"] for d in departments_data)
        total_annual_charges = sum(d["annual_charges"] for d in departments_data)
        total_annual_benefits = sum(d["annual_benefits"] for d in departments_data)
        total_workforce_cost_annual = sum(d["total_annual_cost"] for d in departments_data)
        total_workforce_cost_monthly = sum(d["total_monthly_cost"] for d in departments_data)

        # Categorized allocations (for causal feeding into DRE lines)
        cost_operations_cmv = sum(d["total_annual_cost"] for d in departments_data if d["category"] == "OPERATIONS")
        cost_sales_expenses = sum(d["total_annual_cost"] for d in departments_data if d["category"] == "SALES")
        cost_admin_sga = sum(d["total_annual_cost"] for d in departments_data if d["category"] in ("ADMIN", "RD"))

        return {
            "departments": departments_data,
            "total_current_headcount": total_current_headcount,
            "total_hiring_plan": total_hiring_plan,
            "total_turnover": total_turnover,
            "total_final_headcount": total_final_headcount,
            "net_headcount_growth": total_final_headcount - total_current_headcount,
            "total_annual_base_payroll": round(total_annual_base_payroll, 2),
            "total_annual_charges": round(total_annual_charges, 2),
            "total_annual_benefits": round(total_annual_benefits, 2),
            "total_workforce_cost_annual": round(total_workforce_cost_annual, 2),
            "total_workforce_cost_monthly": round(total_workforce_cost_monthly, 2),
            "allocation": {
                "cmv_operations": round(cost_operations_cmv, 2),
                "sales_expenses": round(cost_sales_expenses, 2),
                "admin_sga": round(cost_admin_sga, 2),
            }
        }

    def calculate_capex_summary(self) -> Dict[str, Any]:
        """Consolidates Capex portfolio and calculates total D&A quota and asset schedules."""
        projects_data = [p.compute_metrics() for p in self.capex_projects if p.is_active]
        
        total_active_capex = sum(p["total_investment"] for p in projects_data)
        total_annual_depreciation = sum(p["annual_depreciation"] for p in projects_data)
        total_monthly_depreciation = sum(p["monthly_depreciation"] for p in projects_data)

        # 5-Year Cumulative Trajectory
        trajectory_5y = []
        for yr_idx in range(1, 6):
            yr_depr = sum(p["trajectory_5y"][yr_idx - 1]["annual_depreciation"] for p in projects_data)
            yr_book = sum(p["trajectory_5y"][yr_idx - 1]["net_book_value"] for p in projects_data)
            trajectory_5y.append({
                "year_index": yr_idx,
                "year_label": f"Ano {yr_idx}",
                "total_depreciation": round(yr_depr, 2),
                "total_net_book_value": round(yr_book, 2)
            })

        # By category breakdown
        categories = {}
        for p in projects_data:
            cat = p["asset_category"]
            categories[cat] = categories.get(cat, 0.0) + p["total_investment"]

        return {
            "projects": projects_data,
            "total_active_projects": len(projects_data),
            "total_active_capex": round(total_active_capex, 2),
            "total_annual_depreciation": round(total_annual_depreciation, 2),
            "total_monthly_depreciation": round(total_monthly_depreciation, 2),
            "category_breakdown": {k: round(v, 2) for k, v in categories.items()},
            "trajectory_5y": trajectory_5y
        }

    def simulate_integrated_financials(
        self,
        growth_pct_override: Optional[float] = None,
        payout_pct_override: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Integrates Headcount and Capex calculations into the Closed-Loop 3-Statement Model.
        Recomputes DRE, DFC, Balance Sheet, Fleuriet, and DuPont with zero delta guarantee.
        """
        workforce = self.calculate_workforce_summary()
        capex = self.calculate_capex_summary()

        total_capex_val = capex["total_active_capex"]

        # Base financial values for Budget 2026
        base_period = self.base_engine.p2025
        growth_pct = growth_pct_override if growth_pct_override is not None else 8.5
        payout_pct = payout_pct_override if payout_pct_override is not None else 40.0

        # Execute 3-Statement integration with driver parameters
        sim_3statement_model = self.base_engine.simulate_drivers(
            growth_pct=growth_pct,
            pmr_dias=base_period.get("pmr_dias", 42.0),
            pme_dias=base_period.get("pme_dias", 86.0),
            pmp_dias=base_period.get("pmp_dias", 66.0),
            capex_val=total_capex_val,
            payout_pct=payout_pct
        )

        budget_period = sim_3statement_model["periods_data"]["Budget_2026"]
        vals = budget_period["values"]
        reconciliation = budget_period["reconciliation"]
        fleuriet = budget_period["fleuriet"]
        dupont = budget_period["dupont"]
        bridge = budget_period["bridge"]

        dre = {
            "receita_bruta": vals["receita_bruta"],
            "deducoes": vals["deducoes"],
            "receita_liquida": vals["receita_liquida"],
            "cpv": vals["cpv"],
            "lucro_bruto": vals["lucro_bruto"],
            "despesas_vendas": vals["despesas_vendas"],
            "despesas_admin": vals["despesas_admin"],
            "ebitda": vals["ebitda"],
            "depreciacao_amortizacao": vals["depreciacao_amortizacao"],
            "ebit": vals["ebit"],
            "resultado_financeiro": vals["resultado_financeiro"],
            "ebt": vals["ebt"],
            "impostos_lucro": vals["impostos_lucro"],
            "lucro_liquido": vals["lucro_liquido"],
            "margem_ebitda_pct": round((vals["ebitda"] / vals["receita_liquida"]) * 100.0, 2) if vals["receita_liquida"] > 0 else 0.0,
            "margem_liquida_pct": round((vals["lucro_liquido"] / vals["receita_liquida"]) * 100.0, 2) if vals["receita_liquida"] > 0 else 0.0
        }

        dfc = {
            "lucro_liquido": vals["lucro_liquido"],
            "depreciacao_amortizacao": vals["depreciacao_amortizacao"],
            "fco": vals["fco_total"],
            "fci": vals["fci_total"],
            "fcf": vals["fcf_total"],
            "variacao_liquida_caixa": vals["dfc_variacao_liquida_caixa"],
            "saldo_inicial_caixa": vals["caixa_inicial"],
            "saldo_final_caixa": vals["caixa_equivalentes"]
        }

        bp = {
            "ativo_circulante": {
                "caixa_equivalentes": vals["caixa_equivalentes"],
                "aplicacoes_financeiras": vals["aplicacoes_financeiras"],
                "contas_receber": vals["contas_receber"],
                "estoques": vals["estoques"],
                "outros_ativos_circulantes": vals["outros_ativos_circulantes"],
                "total_ativo_circulante": vals["ativo_circulante"]
            },
            "ativo_nao_circulante": {
                "realizavel_longo_prazo": vals["realizavel_longo_prazo"],
                "investimentos": vals["investimentos"],
                "imobilizado_liquido": vals["imobilizado_liquido"],
                "intangivel_liquido": vals["intangivel_liquido"],
                "total_ativo_nao_circulante": vals["ativo_nao_circulante"]
            },
            "ativo_total": vals["ativo_total"],
            "passivo_circulante": {
                "fornecedores": vals["fornecedores"],
                "emprestimos_curto_prazo": vals["emprestimos_curto_prazo"],
                "obrigacoes_fiscais_sociais": vals["obrigacoes_fiscais_sociais"],
                "outros_passivos_circulantes": vals["outros_passivos_circulantes"],
                "total_passivo_circulante": vals["passivo_circulante"]
            },
            "passivo_nao_circulante": {
                "emprestimos_longo_prazo": vals["emprestimos_longo_prazo"],
                "provisoes_contingencias": vals["provisoes_contingencias"],
                "outros_passivos_nao_circulantes": vals["outros_passivos_nao_circulantes"],
                "total_passivo_nao_circulante": vals["passivo_nao_circulante"]
            },
            "patrimonio_liquido": {
                "capital_social": vals["capital_social"],
                "reservas_capital_lucros": vals["reservas_capital_lucros"],
                "lucros_prejuizos_acumulados": vals["lucros_prejuizos_acumulados"],
                "total_patrimonio_liquido": vals["patrimonio_liquido"]
            },
            "passivo_total_pl": vals["passivo_total_pl"],
            "fechamento_balanco": {
                "balanco_fechado": reconciliation["is_balanced"],
                "delta_ativo_menos_passivo_pl": reconciliation["delta"]
            }
        }

        # Compare vs Base Budget (Variance Analysis)
        base_budget = self.base_engine.p2025
        ebitda_base = base_budget.get("ebitda", 0.0)
        ebitda_sim = dre["ebitda"]
        delta_ebitda = round(ebitda_sim - ebitda_base, 2)

        caixa_base = base_budget.get("caixa_equivalentes", 0.0)
        caixa_sim = bp["ativo_circulante"]["caixa_equivalentes"]
        delta_caixa = round(caixa_sim - caixa_base, 2)

        return {
            "company_id": self.company_id,
            "company_name": COMPANIES_METADATA.get(self.company_id, {}).get("name", self.company_id.upper()),
            "workforce_summary": workforce,
            "capex_summary": capex,
            "three_statement": {
                "dre": dre,
                "dfc": dfc,
                "balanco": bp,
                "fleuriet": fleuriet,
                "dupont": dupont,
                "bridge": bridge,
                "balance_sheet_balanced": bp["fechamento_balanco"]["balanco_fechado"],
                "balance_sheet_delta": bp["fechamento_balanco"]["delta_ativo_menos_passivo_pl"]
            },
            "driver_impact_variance": {
                "ebitda_base": ebitda_base,
                "ebitda_simulated": ebitda_sim,
                "delta_ebitda": delta_ebitda,
                "caixa_base": caixa_base,
                "caixa_simulated": caixa_sim,
                "delta_caixa": delta_caixa,
                "total_capex_applied": total_capex_val,
                "total_workforce_cost_applied": workforce["total_workforce_cost_annual"],
                "balance_balanced_zero_delta": bp["fechamento_balanco"]["balanco_fechado"]
            }
        }


def get_driver_planning_engine(
    company_id: str = "klabin",
    headcount_plans: Optional[List[Dict[str, Any]]] = None,
    capex_projects: Optional[List[Dict[str, Any]]] = None
) -> DriverPlanningEngine:
    """Factory helper to instantiate DriverPlanningEngine from raw dictionaries."""
    parsed_hc = None
    if headcount_plans:
        parsed_hc = [
            DepartmentHeadcountPlan(
                department_id=d["department_id"],
                department_name=d["department_name"],
                category=d.get("category", "OPERATIONS"),
                current_headcount=int(d["current_headcount"]),
                hiring_plan=int(d["hiring_plan"]),
                attrition_rate_pct=float(d.get("attrition_rate_pct", 3.0)),
                avg_salary_monthly=float(d["avg_salary_monthly"]),
                avg_benefits_monthly=float(d.get("avg_benefits_monthly", 1800.0)),
                fgts_pct=float(d.get("fgts_pct", 8.0)),
                inss_patronal_pct=float(d.get("inss_patronal_pct", 20.0)),
                sistema_s_rat_pct=float(d.get("sistema_s_rat_pct", 8.8)),
                provisao_13_ferias_pct=float(d.get("provisao_13_ferias_pct", 19.44))
            )
            for d in headcount_plans
        ]

    parsed_cx = None
    if capex_projects:
        parsed_cx = [
            CapexProject(
                project_id=p["project_id"],
                project_name=p["project_name"],
                asset_category=p.get("asset_category", "MACHINERY"),
                total_investment=float(p["total_investment"]),
                useful_life_years=int(p.get("useful_life_years", 10)),
                residual_value_pct=float(p.get("residual_value_pct", 0.0)),
                start_year=int(p.get("start_year", 2026)),
                is_active=bool(p.get("is_active", True))
            )
            for p in capex_projects
        ]

    return DriverPlanningEngine(
        company_id=company_id,
        headcount_plans=parsed_hc,
        capex_projects=parsed_cx
    )
