import networkx as nx
from typing import Dict, List, Any

try:
    import rustworkx as rx
    HAS_RUSTWORKX = True
except ImportError:
    HAS_RUSTWORKX = False

class CashFlowDAG:
    """
    Dependency tree mapping (DAG) for Statement of Cash Flows (DFC).
    Calculates Operating Cash Flow (FCO), Investment Cash Flow (FCI),
    Financing Cash Flow (FCF), Net Cash Variation, and Final Cash Balance.
    """
    def __init__(self):
        self.nx_graph = nx.DiGraph()
        self.node_metadata: Dict[str, Dict[str, Any]] = {}
        self._build_dfc_dag()

    def _build_dfc_dag(self):
        """Constructs the cash flow statement dependency graph."""
        nodes = [
            # 1. FCO Inputs
            ("recebimento_vendas", {"type": "input", "label": "(+) Recebimento de Vendas de Produtos / Serviços", "category": "FCO"}),
            ("pagamento_fornecedores", {"type": "input", "label": "(-) Pagamento a Fornecedores", "category": "FCO"}),
            ("pagamento_salarios", {"type": "input", "label": "(-) Pagamento de Salários e Encargos", "category": "FCO"}),
            ("pagamento_despesas_operacionais", {"type": "input", "label": "(-) Pagamento de Despesas Operacionais", "category": "FCO"}),
            ("pagamento_impostos", {"type": "input", "label": "(-) Pagamento de Impostos e Tributos", "category": "FCO"}),
            
            # 1. FCO Calculated
            ("fco_caixa_liquido", {
                "type": "calculated",
                "label": "(=) CAIXA LÍQUIDO GERADO NAS OPERAÇÕES (FCO)",
                "category": "FCO",
                "formula": "recebimento_vendas - pagamento_fornecedores - pagamento_salarios - pagamento_despesas_operacionais - pagamento_impostos"
            }),

            # 2. FCI Inputs
            ("aquisicao_ativos_imobilizados", {"type": "input", "label": "(-) Aquisição de Ativos Imobilizados", "category": "FCI"}),
            ("compra_imoveis_veiculos", {"type": "input", "label": "(-) Compra de Imóveis ou Veículos", "category": "FCI"}),
            ("venda_ativos_equipamentos", {"type": "input", "label": "(+) Venda de Ativos / Equipamentos", "category": "FCI"}),

            # 2. FCI Calculated
            ("fci_caixa_liquido", {
                "type": "calculated",
                "label": "(=) CAIXA LÍQUIDO CONSUMIDO EM INVESTIMENTOS (FCI)",
                "category": "FCI",
                "formula": "venda_ativos_equipamentos - aquisicao_ativos_imobilizados - compra_imoveis_veiculos"
            }),

            # 3. FCF Inputs
            ("aporte_capital", {"type": "input", "label": "(+) Aporte de Capital dos Sócios", "category": "FCF"}),
            ("captacao_emprestimos", {"type": "input", "label": "(+) Captação de Empréstimos/Financiamentos", "category": "FCF"}),
            ("amortizacao_dividas", {"type": "input", "label": "(-) Amortização de Dívidas", "category": "FCF"}),
            ("pagamento_dividendos_jcp", {"type": "input", "label": "(-) Pagamento de Dividendos / JCP", "category": "FCF"}),

            # 3. FCF Calculated
            ("fcf_caixa_liquido", {
                "type": "calculated",
                "label": "(=) CAIXA LÍQUIDO DAS ATIVIDADES DE FINANCIAMENTO (FCF)",
                "category": "FCF",
                "formula": "aporte_capital + captacao_emprestimos - amortizacao_dividas - pagamento_dividendos_jcp"
            }),

            # Global Totals
            ("variacao_liquida_caixa", {
                "type": "calculated",
                "label": "(=) VARIAÇÃO LÍQUIDA DO CAIXA NO PERÍODO",
                "category": "TOTAL",
                "formula": "fco_caixa_liquido + fci_caixa_liquido + fcf_caixa_liquido"
            }),
            ("saldo_inicial_caixa", {"type": "input", "label": "(+) Saldo Inicial de Caixa e Equivalentes", "category": "TOTAL"}),
            ("saldo_final_caixa", {
                "type": "target",
                "label": "(=) SALDO FINAL DE CAIXA E EQUIVALENTES",
                "category": "TOTAL",
                "formula": "variacao_liquida_caixa + saldo_inicial_caixa"
            })
        ]

        for name, meta in nodes:
            self.nx_graph.add_node(name, **meta)
            self.node_metadata[name] = meta

        edges = [
            # FCO edges
            ("recebimento_vendas", "fco_caixa_liquido"),
            ("pagamento_fornecedores", "fco_caixa_liquido"),
            ("pagamento_salarios", "fco_caixa_liquido"),
            ("pagamento_despesas_operacionais", "fco_caixa_liquido"),
            ("pagamento_impostos", "fco_caixa_liquido"),

            # FCI edges
            ("aquisicao_ativos_imobilizados", "fci_caixa_liquido"),
            ("compra_imoveis_veiculos", "fci_caixa_liquido"),
            ("venda_ativos_equipamentos", "fci_caixa_liquido"),

            # FCF edges
            ("aporte_capital", "fcf_caixa_liquido"),
            ("captacao_emprestimos", "fcf_caixa_liquido"),
            ("amortizacao_dividas", "fcf_caixa_liquido"),
            ("pagamento_dividendos_jcp", "fcf_caixa_liquido"),

            # Totals edges
            ("fco_caixa_liquido", "variacao_liquida_caixa"),
            ("fci_caixa_liquido", "variacao_liquida_caixa"),
            ("fcf_caixa_liquido", "variacao_liquida_caixa"),
            ("variacao_liquida_caixa", "saldo_final_caixa"),
            ("saldo_inicial_caixa", "saldo_final_caixa")
        ]

        for u, v in edges:
            self.nx_graph.add_edge(u, v)

    def get_topological_sort(self) -> List[str]:
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
        if modified_node not in self.nx_graph:
            return []
        descendants = nx.descendants(self.nx_graph, modified_node)
        topo_order = self.get_topological_sort()
        return [node for node in topo_order if node in descendants or node == modified_node]

    def to_dict(self) -> Dict[str, Any]:
        """Returns JSON schema for ReactFlow rendering in the UI."""
        nodes_list = []
        for n, data in self.nx_graph.nodes(data=True):
            nodes_list.append({
                "id": n,
                "label": data.get("label", n),
                "type": data.get("type", "intermediate"),
                "category": data.get("category", ""),
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

    def to_cytoscape_elements(self) -> List[Dict[str, Any]]:
        elements = []
        for node, data in self.nx_graph.nodes(data=True):
            elements.append({
                "data": {
                    "id": node,
                    "label": data.get("label", node),
                    "type": data.get("type", "input"),
                    "category": data.get("category", "")
                }
            })
        for u, v in self.nx_graph.edges():
            elements.append({
                "data": {
                    "id": f"{u}->{v}",
                    "source": u,
                    "target": v
                }
            })
        return elements
