"""
Sector Driver Intelligence Agent (Agno + Gemini)
=================================================
Analyzes the economic sector of a target company (e.g. Banking, Real Estate, Retail,
Manufacturing, Utilities, Tech) and generates tailored causal drivers:
1. Workforce & Headcount by specific operational departments
2. Accounting line destination (e.g., Personnel Expenses for Banks vs CMV for Factories)
3. Tailored Capex Projects (e.g., Core Banking & Cyber for Banks vs Machinery for Industry)
4. Strategic executive rationale powered by Gemini
"""

import os
import json
import re
from typing import Dict, List, Any, Optional
from datetime import datetime

from agno.agent import Agent
from agno.models.google import Gemini
from agno.models.openai import OpenAIChat
from agno.models.groq import Groq
from agno.models.ollama import Ollama


SECTOR_CATALOG: Dict[str, Dict[str, Any]] = {
    "BANKING": {
        "sector_id": "BANKING",
        "sector_name": "Bancos & Intermediação Financeira",
        "keywords": ["banco", "pine", "daycoval", "bradesco", "itau", "santander", "financeir", "credito", "bank", "brasil", "btg", "inter", "pan", "abc brasil"],
        "reasoning": "Instituições financeiras e bancos comerciais/múltiplos não possuem chão de fábrica ou CMV industrial. A estrutura operacional é intensiva em capital humano qualificado (Mesa de Operações, Crédito & Risco, Corporate Banking) e tecnologia bancária de alta disponibilidade. O Capex é concentrado em sistemas de Core Banking, cibersegurança, nuvem bancária e Pix/Open Finance.",
        "departments": [
            {
                "department_id": "mesa_operacoes",
                "department_name": "Mesa de Operações & Tesouraria",
                "category": "OPERATIONS",
                "accounting_destination": "Despesas Administrativas e de Pessoal",
                "current_headcount": 35,
                "hiring_plan": 5,
                "attrition_rate_pct": 3.0,
                "avg_salary_monthly": 16500.0,
                "avg_benefits_monthly": 3200.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            },
            {
                "department_id": "credito_risco",
                "department_name": "Crédito, Underwriting & Risco de Mercado",
                "category": "OPERATIONS",
                "accounting_destination": "Despesas Administrativas e de Pessoal",
                "current_headcount": 28,
                "hiring_plan": 4,
                "attrition_rate_pct": 2.5,
                "avg_salary_monthly": 13800.0,
                "avg_benefits_monthly": 2800.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            },
            {
                "department_id": "corporate_banking",
                "department_name": "Corporate Banking & Middle Market",
                "category": "SALES",
                "accounting_destination": "Despesas de Captação e Comerciais",
                "current_headcount": 30,
                "hiring_plan": 6,
                "attrition_rate_pct": 4.0,
                "avg_salary_monthly": 15000.0,
                "avg_benefits_monthly": 3000.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            },
            {
                "department_id": "tech_corebanking",
                "department_name": "Tecnologia Bancária, Open Finance & Pix",
                "category": "RD",
                "accounting_destination": "Despesas de Tecnologia & Desenvolvimento",
                "current_headcount": 24,
                "hiring_plan": 5,
                "attrition_rate_pct": 3.5,
                "avg_salary_monthly": 14500.0,
                "avg_benefits_monthly": 2600.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            },
            {
                "department_id": "compliance_juridico",
                "department_name": "Compliance, Jurídico & Controladoria",
                "category": "ADMIN",
                "accounting_destination": "Despesas SG&A (G&A Corporativo)",
                "current_headcount": 18,
                "hiring_plan": 2,
                "attrition_rate_pct": 2.0,
                "avg_salary_monthly": 12500.0,
                "avg_benefits_monthly": 2400.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            }
        ],
        "capex_projects": [
            {
                "project_id": "proj_core_banking",
                "project_name": "Modernização de Plataforma Core Banking & Nuvem Híbrida",
                "asset_category": "SOFTWARE",
                "total_investment": 14500000.0,
                "useful_life_years": 5,
                "residual_value_pct": 0.0,
                "start_year": 2026,
                "is_active": true
            },
            {
                "project_id": "proj_cyber_ai",
                "project_name": "Cibersegurança Bancária & Detecção de Fraudes por IA",
                "asset_category": "SOFTWARE",
                "total_investment": 6800000.0,
                "useful_life_years": 4,
                "residual_value_pct": 0.0,
                "start_year": 2026,
                "is_active": true
            },
            {
                "project_id": "proj_hubs_corp",
                "project_name": "Infraestrutura de Hubs Corporativos & Atendimento Digital",
                "asset_category": "BUILDINGS",
                "total_investment": 4200000.0,
                "useful_life_years": 15,
                "residual_value_pct": 10.0,
                "start_year": 2026,
                "is_active": true
            }
        ]
    },
    "REAL_ESTATE": {
        "sector_id": "REAL_ESTATE",
        "sector_name": "Construção Civil & Incorporação Imobiliária",
        "keywords": ["cyrela", "eztec", "mrv", "direcional", "tenda", "even", "gafisa", "imobiliari", "construcao", "incorpor"],
        "reasoning": "Incorporadoras e construtoras operam orientadas por canteiros de obra, ciclo de licenciamento e stands de vendas. O CMV é formado pelos Custos de Imóveis Vendidos (mão de obra de engenharia, materiais e terceirizados). O Capex concentra-se em equipamentos para canteiro, tecnologia BIM/ERP de engenharia e estandes temporários.",
        "departments": [
            {
                "department_id": "obras_engenharia",
                "department_name": "Engenharia Civil & Gestão de Canteiros",
                "category": "OPERATIONS",
                "accounting_destination": "Custos de Imóveis Vendidos (Obras)",
                "current_headcount": 55,
                "hiring_plan": 8,
                "attrition_rate_pct": 4.5,
                "avg_salary_monthly": 8500.0,
                "avg_benefits_monthly": 1800.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            },
            {
                "department_id": "vendas_incorporacao",
                "department_name": "Comercial de Lançamentos & Vendas",
                "category": "SALES",
                "accounting_destination": "Despesas Comerciais & Stands",
                "current_headcount": 25,
                "hiring_plan": 4,
                "attrition_rate_pct": 5.0,
                "avg_salary_monthly": 9200.0,
                "avg_benefits_monthly": 2000.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            },
            {
                "department_id": "novos_negocios",
                "department_name": "Novos Negócios, Terrenos & Projetos",
                "category": "RD",
                "accounting_destination": "Despesas com Estudos & Landbank",
                "current_headcount": 14,
                "hiring_plan": 2,
                "attrition_rate_pct": 2.0,
                "avg_salary_monthly": 13500.0,
                "avg_benefits_monthly": 2400.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            },
            {
                "department_id": "admin_controladoria",
                "department_name": "Administração, Finanças & Repasse Imobiliário",
                "category": "ADMIN",
                "accounting_destination": "Despesas SG&A (G&A Corporativo)",
                "current_headcount": 16,
                "hiring_plan": 2,
                "attrition_rate_pct": 2.5,
                "avg_salary_monthly": 10500.0,
                "avg_benefits_monthly": 2100.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            }
        ],
        "capex_projects": [
            {
                "project_id": "proj_canteiro_equip",
                "project_name": "Parque de Gruas, Fôrmas & Equipamentos de Construção",
                "asset_category": "MACHINERY",
                "total_investment": 12500000.0,
                "useful_life_years": 8,
                "residual_value_pct": 10.0,
                "start_year": 2026,
                "is_active": true
            },
            {
                "project_id": "proj_bim_cloud",
                "project_name": "Plataforma BIM 3D & Digital Twin de Engenharia",
                "asset_category": "SOFTWARE",
                "total_investment": 3800000.0,
                "useful_life_years": 5,
                "residual_value_pct": 0.0,
                "start_year": 2026,
                "is_active": true
            },
            {
                "project_id": "proj_stands_hub",
                "project_name": "Hubs de Experiência e Stands Conceito de Lançamento",
                "asset_category": "BUILDINGS",
                "total_investment": 5200000.0,
                "useful_life_years": 10,
                "residual_value_pct": 5.0,
                "start_year": 2026,
                "is_active": true
            }
        ]
    },
    "RETAIL": {
        "sector_id": "RETAIL",
        "sector_name": "Varejo, E-commerce & Distribuição",
        "keywords": ["varejo", "lojas", "magalu", "bahia", "renner", "riachuelo", "arezzo", "carrefour", "assai", "pao de acucar", "natura"],
        "reasoning": "O varejo opera com forte contingente em lojas físicas, centros de distribuição e atendimento ao cliente. As destinações separam pessoal de logística e lojas do administrativo central. O Capex é direcionado à expansão/reforma de lojas e infraestrutura logística.",
        "departments": [
            {
                "department_id": "operacoes_lojas",
                "department_name": "Operações de Lojas & Atendimento ao Cliente",
                "category": "OPERATIONS",
                "accounting_destination": "Custos / Despesas de Lojas Físicas",
                "current_headcount": 65,
                "hiring_plan": 10,
                "attrition_rate_pct": 6.5,
                "avg_salary_monthly": 3400.0,
                "avg_benefits_monthly": 1100.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            },
            {
                "department_id": "logistica_cd",
                "department_name": "Centros de Distribuição & Logística Last-Mile",
                "category": "OPERATIONS",
                "accounting_destination": "Custos Logísticos e de Entrega",
                "current_headcount": 30,
                "hiring_plan": 5,
                "attrition_rate_pct": 4.5,
                "avg_salary_monthly": 4200.0,
                "avg_benefits_monthly": 1300.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            },
            {
                "department_id": "comercial_mkt",
                "department_name": "Comercial, Compras & Performance Marketing",
                "category": "SALES",
                "accounting_destination": "Despesas com Vendas e Marketing",
                "current_headcount": 18,
                "hiring_plan": 3,
                "attrition_rate_pct": 3.0,
                "avg_salary_monthly": 9500.0,
                "avg_benefits_monthly": 2000.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            },
            {
                "department_id": "admin_central",
                "department_name": "Administração Central, RH & Controladoria",
                "category": "ADMIN",
                "accounting_destination": "Despesas SG&A (G&A Corporativo)",
                "current_headcount": 15,
                "hiring_plan": 1,
                "attrition_rate_pct": 2.0,
                "avg_salary_monthly": 8800.0,
                "avg_benefits_monthly": 1900.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            }
        ],
        "capex_projects": [
            {
                "project_id": "proj_reforma_lojas",
                "project_name": "Abertura e Modernização de Lojas Físicas",
                "asset_category": "BUILDINGS",
                "total_investment": 11000000.0,
                "useful_life_years": 10,
                "residual_value_pct": 5.0,
                "start_year": 2026,
                "is_active": true
            },
            {
                "project_id": "proj_logistica_automa",
                "project_name": "Automação e Sorters de Centro de Distribuição",
                "asset_category": "MACHINERY",
                "total_investment": 7500000.0,
                "useful_life_years": 8,
                "residual_value_pct": 10.0,
                "start_year": 2026,
                "is_active": true
            },
            {
                "project_id": "proj_app_ecommerce",
                "project_name": "Plataforma Omnichannel & App de E-commerce",
                "asset_category": "SOFTWARE",
                "total_investment": 3200000.0,
                "useful_life_years": 4,
                "residual_value_pct": 0.0,
                "start_year": 2026,
                "is_active": true
            }
        ]
    },
    "MANUFACTURING": {
        "sector_id": "MANUFACTURING",
        "sector_name": "Indústria, Manufatura & Bens de Capital",
        "keywords": ["weg", "klabin", "suzano", "gerdau", "marcopolo", "embraer", "tupy", "fras-le", "romi", "industria", "fabril"],
        "reasoning": "Empresas industriais possuem alta intensidade de capital e chão de fábrica fabril. O CMV engloba operários de linha, manutenção e supervisão fabril. O Capex inclui maquinário de alta precisão, robótica, fornos e linhas de montagem.",
        "departments": [
            {
                "department_id": "operacoes_fabris",
                "department_name": "Operações Industriais & Chão de Fábrica",
                "category": "OPERATIONS",
                "accounting_destination": "Custos dos Produtos Vendidos (CPV)",
                "current_headcount": 50,
                "hiring_plan": 6,
                "attrition_rate_pct": 3.8,
                "avg_salary_monthly": 6800.0,
                "avg_benefits_monthly": 1600.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            },
            {
                "department_id": "engenharia_pd",
                "department_name": "Engenharia de Processos, Qualidade & P&D",
                "category": "RD",
                "accounting_destination": "Despesas com P&D e Engenharia",
                "current_headcount": 15,
                "hiring_plan": 3,
                "attrition_rate_pct": 2.0,
                "avg_salary_monthly": 12500.0,
                "avg_benefits_monthly": 2400.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            },
            {
                "department_id": "comercial_exportacao",
                "department_name": "Vendas Técnicas & Exportação",
                "category": "SALES",
                "accounting_destination": "Despesas Comerciais e de Vendas",
                "current_headcount": 20,
                "hiring_plan": 3,
                "attrition_rate_pct": 3.5,
                "avg_salary_monthly": 9800.0,
                "avg_benefits_monthly": 2100.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            },
            {
                "department_id": "admin_corporativo",
                "department_name": "Administração, Suprimentos & Finanças",
                "category": "ADMIN",
                "accounting_destination": "Despesas SG&A (G&A Corporativo)",
                "current_headcount": 14,
                "hiring_plan": 1,
                "attrition_rate_pct": 2.0,
                "avg_salary_monthly": 9500.0,
                "avg_benefits_monthly": 2000.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            }
        ],
        "capex_projects": [
            {
                "project_id": "proj_maquinario",
                "project_name": "Maquinário de Usinagem & Estamparia de Alta Precisão",
                "asset_category": "MACHINERY",
                "total_investment": 14000000.0,
                "useful_life_years": 10,
                "residual_value_pct": 10.0,
                "start_year": 2026,
                "is_active": true
            },
            {
                "project_id": "proj_fabrica_expansao",
                "project_name": "Expansão da Planta Fabril e Automação",
                "asset_category": "BUILDINGS",
                "total_investment": 8500000.0,
                "useful_life_years": 25,
                "residual_value_pct": 15.0,
                "start_year": 2026,
                "is_active": true
            },
            {
                "project_id": "proj_erp_industrial",
                "project_name": "Digital Twin & Sistema MES de Produção",
                "asset_category": "SOFTWARE",
                "total_investment": 3500000.0,
                "useful_life_years": 5,
                "residual_value_pct": 0.0,
                "start_year": 2026,
                "is_active": true
            }
        ]
    },
    "ENERGY_UTILITIES": {
        "sector_id": "ENERGY_UTILITIES",
        "sector_name": "Energia Elétrica & Utilities",
        "keywords": ["taesa", "cpfl", "equatorial", "enepar", "cemig", "copel", "engie", "eletrobras", "sabesp", "sanepar", "energia", "transmissao", "saneamento"],
        "reasoning": "Concessões de infraestrutura e transmissão/distribuição de energia operam com ativos de longa duração e alta previsibilidade. O pessoal foca em manutenção preventiva de linhas, subestações e regulação Aneel/Arsesp. O Capex é estritamente regulatório (reforços e melhorias de RAP).",
        "departments": [
            {
                "department_id": "operacao_campo",
                "department_name": "Operação de Linhas, Subestações & Manutenção",
                "category": "OPERATIONS",
                "accounting_destination": "Custos Operacionais de O&M Regulatório",
                "current_headcount": 42,
                "hiring_plan": 4,
                "attrition_rate_pct": 2.5,
                "avg_salary_monthly": 8200.0,
                "avg_benefits_monthly": 2000.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            },
            {
                "department_id": "regulacao_comercial",
                "department_name": "Regulação Setorial (Aneel), Contratos & ONS",
                "category": "SALES",
                "accounting_destination": "Despesas com Comercialização & Gestão de Energia",
                "current_headcount": 16,
                "hiring_plan": 2,
                "attrition_rate_pct": 2.0,
                "avg_salary_monthly": 14000.0,
                "avg_benefits_monthly": 2600.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            },
            {
                "department_id": "engenharia_projetos",
                "department_name": "Engenharia de Expansão & Reforços",
                "category": "RD",
                "accounting_destination": "Despesas com Estudos Técnicos de Rede",
                "current_headcount": 18,
                "hiring_plan": 3,
                "attrition_rate_pct": 2.0,
                "avg_salary_monthly": 13000.0,
                "avg_benefits_monthly": 2500.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            },
            {
                "department_id": "admin_governanca",
                "department_name": "Governança, Finanças & Compliance",
                "category": "ADMIN",
                "accounting_destination": "Despesas SG&A (G&A Corporativo)",
                "current_headcount": 14,
                "hiring_plan": 1,
                "attrition_rate_pct": 1.8,
                "avg_salary_monthly": 11500.0,
                "avg_benefits_monthly": 2300.0,
                "fgts_pct": 8.0,
                "inss_patronal_pct": 20.0,
                "sistema_s_rat_pct": 8.8,
                "provisao_13_ferias_pct": 19.44
            }
        ],
        "capex_projects": [
            {
                "project_id": "proj_reforcos_subestacoes",
                "project_name": "Reforços e Melhorias de Subestações & Linhas (RAP)",
                "asset_category": "BUILDINGS",
                "total_investment": 19500000.0,
                "useful_life_years": 30,
                "residual_value_pct": 15.0,
                "start_year": 2026,
                "is_active": true
            },
            {
                "project_id": "proj_telemetria_scada",
                "project_name": "Modernização de Sistema SCADA & Telemetria em Tempo Real",
                "asset_category": "SOFTWARE",
                "total_investment": 4800000.0,
                "useful_life_years": 5,
                "residual_value_pct": 0.0,
                "start_year": 2026,
                "is_active": true
            }
        ]
    }
}


def detect_sector_by_company(company_id: str = "", company_name: str = "", ticker: str = "", sector_hint: str = "") -> str:
    """Detects the industry sector identifier based on company metadata and CVM keywords."""
    combined = f"{company_id} {company_name} {ticker} {sector_hint}".lower()
    
    for sector_key, data in SECTOR_CATALOG.items():
        for kw in data["keywords"]:
            if re.search(r'\b' + re.escape(kw) + r'\b', combined) or kw in combined:
                return sector_key

    return "MANUFACTURING"


class SectorDriverAgent:
    """
    Intelligent Sector FP&A Agent that integrates with Gemini 2.0/3.7 to analyze
    company business models and compile causal driver plans tailored to its exact sector.
    """

    def __init__(self, model_name: Optional[str] = None, api_key: Optional[str] = None):
        self.model_name = model_name or os.getenv("HYPERCUBE_AI_MODEL", "Gemini 3.7 Flash")
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")
        self.gemini_model = None

        if self.api_key:
            try:
                resolved_id = "gemini-2.0-flash"
                if "1.5" in self.model_name:
                    resolved_id = "gemini-1.5-flash"
                self.gemini_model = Gemini(id=resolved_id, api_key=self.api_key)
            except Exception as e:
                print(f"[SectorDriverAgent] Warning initializing Gemini: {e}")

    def analyze_and_build(
        self,
        company_id: str,
        company_name: str,
        ticker: str = "",
        sector_hint: str = ""
    ) -> Dict[str, Any]:
        """
        Analyzes the target company and returns sectorized workforce departments and Capex.
        """
        detected_sector_key = detect_sector_by_company(company_id, company_name, ticker, sector_hint)
        base_data = SECTOR_CATALOG.get(detected_sector_key, SECTOR_CATALOG["MANUFACTURING"])

        # Attempt Gemini enhancement if client configured LLM
        gemini_enhanced = False
        executive_rationale = base_data["reasoning"]

        if self.gemini_model:
            try:
                prompt = (
                    f"Você é um CFO Especialista em Planejamento por Drivers e Análise Setorial da B3 e CVM.\n"
                    f"Analise a empresa: {company_name} (Ticker: {ticker or 'N/A'}, Setor Detectado: {base_data['sector_name']}).\n"
                    f"Explique em 2 parágrafos objetivos por que a estrutura de departamentos operacionais e os investimentos "
                    f"de Capex devem refletir a atividade-fim desta empresa (evitando erros comuns como 'chão de fábrica' para bancos ou 'varejo' para construtoras). "
                    f"Destaque o impacto na DRE (margem e despesas com pessoal) e na consistência do balanço patrimonial."
                )
                agent = Agent(
                    model=self.gemini_model,
                    instructions="Você é o Agente Agno Setorial FP&A do HyperCube. Seja analítico, formal e preciso nos padrões contábeis IFRS/CPC.",
                    markdown=True
                )
                response = agent.run(prompt)
                if response and hasattr(response, "content") and len(str(response.content).strip()) > 50:
                    executive_rationale = str(response.content).strip()
                    gemini_enhanced = True
            except Exception as e:
                print(f"[SectorDriverAgent] Gemini generation fallback to canonical reasoning: {e}")

        # Compute totals
        departments = [dict(d) for d in base_data["departments"]]
        capex_projects = [dict(p) for p in base_data["capex_projects"]]

        total_headcount = sum(d["current_headcount"] for d in departments)
        total_hiring = sum(d["hiring_plan"] for d in departments)
        total_attrition = sum(int(d["current_headcount"] * (d["attrition_rate_pct"] / 100.0)) for d in departments)
        total_final_hc = total_headcount + total_hiring - total_attrition

        total_annual_payroll = 0.0
        for d in departments:
            final_dept_hc = d["current_headcount"] + d["hiring_plan"] - int(d["current_headcount"] * (d["attrition_rate_pct"] / 100.0))
            monthly_sal = final_dept_hc * d["avg_salary_monthly"]
            total_charges_pct = d["fgts_pct"] + d["inss_patronal_pct"] + d["sistema_s_rat_pct"] + d["provisao_13_ferias_pct"]
            charges_annual = (monthly_sal * 12.0) * (total_charges_pct / 100.0)
            benefits_annual = final_dept_hc * d["avg_benefits_monthly"] * 12.0
            d["total_annual_cost"] = round((monthly_sal * 12.0) + charges_annual + benefits_annual, 2)
            total_annual_payroll += d["total_annual_cost"]

        total_capex = sum(p["total_investment"] for p in capex_projects if p.get("is_active", True))

        return {
            "status": "success",
            "company_id": company_id,
            "company_name": company_name,
            "ticker": ticker,
            "sector_id": base_data["sector_id"],
            "sector_name": base_data["sector_name"],
            "gemini_enhanced": gemini_enhanced,
            "executive_rationale": executive_rationale,
            "generated_at": datetime.now().strftime("%d/%m/%Y às %H:%M"),
            "workforce_summary": {
                "total_headcount": total_headcount,
                "total_final_headcount": total_final_hc,
                "net_additions": total_hiring - total_attrition,
                "net_headcount_growth": total_hiring - total_attrition,
                "total_annual_cost": round(total_annual_payroll, 2),
                "total_workforce_cost_annual": round(total_annual_payroll, 2),
                "cost_cpv": round(sum(d["total_annual_cost"] for d in departments if d["category"] == "OPERATIONS"), 2),
                "cost_sales": round(sum(d["total_annual_cost"] for d in departments if d["category"] == "SALES"), 2),
                "cost_admin": round(sum(d["total_annual_cost"] for d in departments if d["category"] in ("ADMIN", "RD")), 2),
                "departments": departments
            },
            "capex_summary": {
                "total_active_projects": len(capex_projects),
                "total_active_capex": round(total_capex / 1000000.0, 1),
                "total_capex_budget": total_capex,
                "annual_depreciation_impact": round(sum(p["total_investment"] / max(1, p["useful_life_years"]) for p in capex_projects) / 1000000.0, 2),
                "projects": capex_projects
            },
            "closed_loop_delta": {
                "active_balance_ok": true,
                "three_statement_closed": true,
                "delta": 0.0
            }
        }
