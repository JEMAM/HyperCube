import networkx as nx
from typing import Dict, List, Any

try:
    import rustworkx as rx
    HAS_RUSTWORKX = True
except ImportError:
    HAS_RUSTWORKX = False

class UniversalFinancialDAG:
    """
    Dependency tree mapping (DAG) for DRE financial accounts across all sectors.
    Calculates key operational, financial, pre-tax, and net income (lucro_liquido) metrics.
    Dynamically adapts node definitions and formulas to the loaded company dataset.
    """
    def __init__(self, company_id: str = "casas_bahia"):
        self.company_id = company_id
        self.nx_graph = nx.DiGraph()
        self.node_metadata: Dict[str, Dict[str, Any]] = {}
        self._build_universal_dag(company_id)

    def set_company(self, company_id: str):
        self.company_id = company_id
        self._build_universal_dag(company_id)

    def _build_universal_dag(self, company_id: str = "casas_bahia"):
        """Constructs the canonical FP&A calculation dependency graph tailored to the company."""
        self.nx_graph.clear()
        self.node_metadata.clear()

        cid = str(company_id).lower()
        is_bank = (
            cid in ["banco_do_brasil", "bb", "bbas3", "daycoval", "banco_daycoval"]
            or "banco" in cid
            or "bank" in cid
            or "daycoval" in cid
            or "abc" in cid
            or "itau" in cid
            or "bradesco" in cid
            or "santander" in cid
            or "btg" in cid
            or "safra" in cid
            or "inter" in cid
            or "pan" in cid
            or "pine" in cid
            or "bmg" in cid
            or "20796" in cid
            or "20958" in cid
        )

        if is_bank:
            nodes = [
                ("receita_com_operacoes_de_credito_e_repasses", {"type": "input", "label": "(+) Receitas da Intermediação Financeira"}),
                ("despesas_de_captacao", {"type": "input", "label": "(-) Despesas da Intermediação (Captações)"}),
                ("provisao_para_risco_de_credito_prc", {"type": "input", "label": "(-) Provisão para Perdas com Crédito (PCLD / PDD)"}),
                ("despesas_pessoal_e_administrativas", {"type": "input", "label": "(-) Despesas com Pessoal e Administrativas"}),
                ("resultado_com_participacoes_societarias", {"type": "input", "label": "(+) Resultado de Participações Societárias"}),
                ("despesas_tributarias", {"type": "input", "label": "(-) Despesas Tributárias"}),
                ("outras_despesas_liquidas", {"type": "input", "label": "(-/+) Outras Despesas & Receitas Operacionais"}),
                ("tributos_sobre_o_lucro", {"type": "input", "label": "(-) Impostos sobre o Lucro (IR/CSLL)"}),
                ("participacao_nos_lucros", {"type": "input", "label": "(-) PLR & Participação Não Controladores"}),

                ("produto_da_intermediacao_financeira", {
                    "type": "calculated",
                    "label": "(=) Resultado Bruto da Intermediação Financeira",
                    "formula": "Receitas Intermediação - Despesas Captação"
                }),
                ("resultado_da_intermediacao_financeira", {
                    "type": "calculated",
                    "label": "(=) Resultado da Intermediação Líquido de PDD",
                    "formula": "Resultado Bruto - PDD/PRC"
                }),
                ("resultado_antes_da_tributacao", {
                    "type": "calculated",
                    "label": "(=) Resultado Antes dos Tributos (LAIR / EBT)",
                    "formula": "Resultado Intermediação - SG&A + Participações - Tributos - Provisões"
                }),
                ("lucro_liquido", {
                    "type": "target",
                    "label": "(=) Lucro Líquido do Exercício",
                    "formula": "EBT - IR/CSLL - PLR - Não Controladores"
                })
            ]
            edges = [
                ("receita_com_operacoes_de_credito_e_repasses", "produto_da_intermediacao_financeira"),
                ("despesas_de_captacao", "produto_da_intermediacao_financeira"),
                ("produto_da_intermediacao_financeira", "resultado_da_intermediacao_financeira"),
                ("provisao_para_risco_de_credito_prc", "resultado_da_intermediacao_financeira"),
                ("resultado_da_intermediacao_financeira", "resultado_antes_da_tributacao"),
                ("despesas_pessoal_e_administrativas", "resultado_antes_da_tributacao"),
                ("resultado_com_participacoes_societarias", "resultado_antes_da_tributacao"),
                ("despesas_tributarias", "resultado_antes_da_tributacao"),
                ("outras_despesas_liquidas", "resultado_antes_da_tributacao"),
                ("resultado_antes_da_tributacao", "lucro_liquido"),
                ("tributos_sobre_o_lucro", "lucro_liquido"),
                ("participacao_nos_lucros", "lucro_liquido")
            ]
        elif company_id == "casas_bahia":
            nodes = [
                ("receita_com_operacoes_de_credito_e_repasses", {"type": "input", "label": "Receita Líquida de Vendas (R$ 7.416 M)"}),
                ("despesas_de_captacao", {"type": "input", "label": "(-) Custo das Mercadorias Vendidas (CMV: R$ 5.169 M)"}),
                ("despesas_pessoal_e_administrativas", {"type": "input", "label": "(-) Despesas com Vendas (SG&A: R$ 1.442 M)"}),
                ("provisao_para_risco_de_credito_prc", {"type": "input", "label": "(-) Despesas Gerais e Administrativas (R$ 262 M)"}),
                ("participacao_nos_lucros", {"type": "input", "label": "(-) Outras Despesas Operacionais (R$ 88 M)"}),
                ("resultado_com_participacoes_societarias", {"type": "input", "label": "(+/-) Resultado Financeiro Líquido (-R$ 1.171 M)"}),
                ("tributos_sobre_o_lucro", {"type": "input", "label": "(-) Imposto de Renda e CSLL (R$ 143 M)"}),

                ("produto_da_intermediacao_financeira", {
                    "type": "calculated",
                    "label": "(=) Lucro Bruto (R$ 2.247 M — Margem: 30,3%)",
                    "formula": "Receita Líquida - CMV"
                }),
                ("resultado_da_intermediacao_financeira", {
                    "type": "calculated",
                    "label": "(=) Lucro Operacional EBIT (R$ 250 M)",
                    "formula": "Lucro Bruto - Despesas Vendas - SG&A - Outras Desp"
                }),
                ("resultado_antes_da_tributacao", {
                    "type": "calculated",
                    "label": "(=) Lucro Antes dos Tributos LAIR / EBT (-R$ 921 M)",
                    "formula": "EBIT + Resultado Financeiro Líquido"
                }),
                ("lucro_liquido", {
                    "type": "target",
                    "label": "(=) Lucro / Prejuízo Líquido (-R$ 1.064 M)",
                    "formula": "EBT - IR/CSLL"
                })
            ]
            edges = [
                ("receita_com_operacoes_de_credito_e_repasses", "produto_da_intermediacao_financeira"),
                ("despesas_de_captacao", "produto_da_intermediacao_financeira"),
                ("produto_da_intermediacao_financeira", "resultado_da_intermediacao_financeira"),
                ("despesas_pessoal_e_administrativas", "resultado_da_intermediacao_financeira"),
                ("provisao_para_risco_de_credito_prc", "resultado_da_intermediacao_financeira"),
                ("participacao_nos_lucros", "resultado_da_intermediacao_financeira"),
                ("resultado_da_intermediacao_financeira", "resultado_antes_da_tributacao"),
                ("resultado_com_participacoes_societarias", "resultado_antes_da_tributacao"),
                ("resultado_antes_da_tributacao", "lucro_liquido"),
                ("tributos_sobre_o_lucro", "lucro_liquido")
            ]
        elif company_id == "vale":
            nodes = [
                ("receita_com_operacoes_de_credito_e_repasses", {"type": "input", "label": "Receita Líquida de Vendas (US$ 39.840 M)"}),
                ("despesas_de_captacao", {"type": "input", "label": "(-) Custo dos Produtos Vendidos (CPV: US$ 25.120 M)"}),
                ("despesas_pessoal_e_administrativas", {"type": "input", "label": "(-) Despesas Comerciais e Logística (US$ 3.890 M)"}),
                ("provisao_para_risco_de_credito_prc", {"type": "input", "label": "(-) Despesas Administrativas & Outras (US$ 1.250 M)"}),
                ("participacao_nos_lucros", {"type": "input", "label": "(-) Provisões Brumadinho / Samarco (US$ 2.450 M)"}),
                ("resultado_com_participacoes_societarias", {"type": "input", "label": "(+/-) Resultado Financeiro Líquido (-US$ 1.840 M)"}),
                ("tributos_sobre_o_lucro", {"type": "input", "label": "(-) Imposto de Renda e CSLL (US$ 1.150 M)"}),

                ("produto_da_intermediacao_financeira", {
                    "type": "calculated",
                    "label": "(=) Lucro Bruto (US$ 14.720 M — Margem: 37,0%)",
                    "formula": "Receita Líquida - CPV"
                }),
                ("resultado_da_intermediacao_financeira", {
                    "type": "calculated",
                    "label": "(=) Lucro Operacional EBIT (US$ 7.130 M)",
                    "formula": "Lucro Bruto - Despesas Operacionais - Provisões"
                }),
                ("resultado_antes_da_tributacao", {
                    "type": "calculated",
                    "label": "(=) Lucro Antes dos Tributos EBT (US$ 5.290 M)",
                    "formula": "EBIT + Resultado Financeiro Líquido"
                }),
                ("lucro_liquido", {
                    "type": "target",
                    "label": "(=) Lucro Líquido do Exercício (US$ 4.140 M)",
                    "formula": "EBT - IR/CSLL"
                })
            ]
            edges = [
                ("receita_com_operacoes_de_credito_e_repasses", "produto_da_intermediacao_financeira"),
                ("despesas_de_captacao", "produto_da_intermediacao_financeira"),
                ("produto_da_intermediacao_financeira", "resultado_da_intermediacao_financeira"),
                ("despesas_pessoal_e_administrativas", "resultado_da_intermediacao_financeira"),
                ("provisao_para_risco_de_credito_prc", "resultado_da_intermediacao_financeira"),
                ("participacao_nos_lucros", "resultado_da_intermediacao_financeira"),
                ("resultado_da_intermediacao_financeira", "resultado_antes_da_tributacao"),
                ("resultado_com_participacoes_societarias", "resultado_antes_da_tributacao"),
                ("resultado_antes_da_tributacao", "lucro_liquido"),
                ("tributos_sobre_o_lucro", "lucro_liquido")
            ]
        else: # Ambev or default
            nodes = [
                ("receita_com_operacoes_de_credito_e_repasses", {"type": "input", "label": "Receita Líquida Consolidada (R$ 82.553 M)"}),
                ("despesas_de_captacao", {"type": "input", "label": "(-) Custo dos Produtos Vendidos (CPV: R$ 41.280 M)"}),
                ("despesas_pessoal_e_administrativas", {"type": "input", "label": "(-) Despesas com Vendas e Marketing (R$ 16.420 M)"}),
                ("provisao_para_risco_de_credito_prc", {"type": "input", "label": "(-) Despesas Gerais e Administrativas (R$ 4.150 M)"}),
                ("resultado_com_participacoes_societarias", {"type": "input", "label": "(+/-) Resultado Financeiro Líquido (-R$ 3.820 M)"}),
                ("tributos_sobre_o_lucro", {"type": "input", "label": "(-) Imposto de Renda e Contribuição Social (R$ 2.450 M)"}),

                ("produto_da_intermediacao_financeira", {
                    "type": "calculated",
                    "label": "(=) Lucro Bruto (R$ 41.273 M — Margem: 50,0%)",
                    "formula": "Receita Líquida - CPV"
                }),
                ("resultado_da_intermediacao_financeira", {
                    "type": "calculated",
                    "label": "(=) Lucro Operacional EBIT (R$ 20.703 M)",
                    "formula": "Lucro Bruto - SG&A"
                }),
                ("resultado_antes_da_tributacao", {
                    "type": "calculated",
                    "label": "(=) Lucro Antes dos Tributos LAIR (R$ 16.883 M)",
                    "formula": "EBIT + Resultado Financeiro"
                }),
                ("lucro_liquido", {
                    "type": "target",
                    "label": "(=) Lucro Líquido Consolidado (R$ 14.433 M)",
                    "formula": "LAIR - Tributos"
                })
            ]
            edges = [
                ("receita_com_operacoes_de_credito_e_repasses", "produto_da_intermediacao_financeira"),
                ("despesas_de_captacao", "produto_da_intermediacao_financeira"),
                ("produto_da_intermediacao_financeira", "resultado_da_intermediacao_financeira"),
                ("despesas_pessoal_e_administrativas", "resultado_da_intermediacao_financeira"),
                ("provisao_para_risco_de_credito_prc", "resultado_da_intermediacao_financeira"),
                ("resultado_da_intermediacao_financeira", "resultado_antes_da_tributacao"),
                ("resultado_com_participacoes_societarias", "resultado_antes_da_tributacao"),
                ("resultado_antes_da_tributacao", "lucro_liquido"),
                ("tributos_sobre_o_lucro", "lucro_liquido")
            ]

        for node_id, meta in nodes:
            self.nx_graph.add_node(node_id, **meta)
            self.node_metadata[node_id] = meta

        for u, v in edges:
            self.nx_graph.add_edge(u, v)

    def to_dict(self) -> Dict[str, Any]:
        """Returns JSON schema for ReactFlow rendering in the UI."""
        nodes_list = []
        for n, data in self.nx_graph.nodes(data=True):
            nodes_list.append({
                "id": n,
                "label": data.get("label", n),
                "type": data.get("type", "intermediate"),
                "formula": data.get("formula", "")
            })

        edges_list = []
        for u, v in self.nx_graph.edges():
            edges_list.append({
                "id": f"e-{u}-{v}",
                "source": u,
                "target": v
            })

        return {
            "nodes": nodes_list,
            "edges": edges_list
        }

    def get_topological_sort(self) -> List[str]:
        """Returns the calculation execution order."""
        return list(nx.topological_sort(self.nx_graph))

    def get_affected_nodes(self, changed_nodes: List[str]) -> List[str]:
        """Returns all descendant nodes affected by changes in topological order."""
        affected = set(changed_nodes)
        for node in changed_nodes:
            if node in self.nx_graph:
                affected.update(nx.descendants(self.nx_graph, node))
        topo_order = self.get_topological_sort()
        return [n for n in topo_order if n in affected]

    def get_downstream_impact(self, modified_node: str) -> List[str]:
        """Returns downstream nodes impacted by a single node modification."""
        if modified_node not in self.nx_graph:
            return []
        descendants = nx.descendants(self.nx_graph, modified_node)
        topo_order = self.get_topological_sort()
        return [node for node in topo_order if node in descendants or node == modified_node]


# Backward compatibility alias
BankingFinancialDAG = UniversalFinancialDAG
