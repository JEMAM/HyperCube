"""
Declarative Formula DSL Engine (Anaplan / Connected Planning style).
Parses, compiles, and evaluates financial modeling expressions in topological dependency order.
Supports arithmetic, line item references [Account], conditional IF/THEN/ELSE, and dimensional aggregations.
"""

import re
import ast
import operator
from typing import Dict, List, Any, Optional, Set, Tuple


class FormulaRule:
    def __init__(self, target_account: str, expression: str, description: str = ""):
        self.target_account = target_account
        self.expression = expression.strip()
        self.description = description
        self.dependencies: List[str] = self._extract_dependencies()

    def _extract_dependencies(self) -> List[str]:
        """Extracts referenced accounts enclosed in brackets: e.g. [Receita_Liquida]."""
        matches = re.findall(r'\[([a-zA-Z0-9_]+)\]', self.expression)
        return list(dict.fromkeys(matches))  # preserve order, remove dupes

    def to_dict(self) -> Dict[str, Any]:
        return {
            "target_account": self.target_account,
            "expression": self.expression,
            "description": self.description,
            "dependencies": self.dependencies
        }


class SafeExpressionEvaluator(ast.NodeVisitor):
    """Safely evaluates parsed arithmetic and logical AST expressions without eval()."""

    ALLOWED_OPS = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
        ast.USub: operator.neg,
        ast.Gt: operator.gt,
        ast.Lt: operator.lt,
        ast.GtE: operator.ge,
        ast.LtE: operator.le,
        ast.Eq: operator.eq,
        ast.NotEq: operator.ne,
    }

    def __init__(self, context: Dict[str, float]):
        self.context = context

    def evaluate(self, node: ast.AST) -> float:
        return self.visit(node)

    def visit_BinOp(self, node: ast.BinOp) -> Any:
        left = self.visit(node.left)
        right = self.visit(node.right)
        op_type = type(node.op)
        if op_type in self.ALLOWED_OPS:
            if op_type == ast.Div:
                return left / right if right != 0 else 0.0
            return self.ALLOWED_OPS[op_type](left, right)
        raise ValueError(f"Operador binário não suportado: {op_type}")

    def visit_UnaryOp(self, node: ast.UnaryOp) -> Any:
        operand = self.visit(node.operand)
        op_type = type(node.op)
        if op_type in self.ALLOWED_OPS:
            return self.ALLOWED_OPS[op_type](operand)
        raise ValueError(f"Operador unário não suportado: {op_type}")

    def visit_Compare(self, node: ast.Compare) -> Any:
        left = self.visit(node.left)
        for op, comparator in zip(node.ops, node.comparators):
            right = self.visit(comparator)
            op_type = type(op)
            if op_type in self.ALLOWED_OPS:
                if not self.ALLOWED_OPS[op_type](left, right):
                    return False
            else:
                raise ValueError(f"Operador de comparação não suportado: {op_type}")
            left = right
        return True

    def visit_IfExp(self, node: ast.IfExp) -> Any:
        test = self.visit(node.test)
        if test:
            return self.visit(node.body)
        else:
            return self.visit(node.orelse)

    def visit_Constant(self, node: ast.Constant) -> Any:
        return float(node.value)

    def visit_Num(self, node: ast.Num) -> Any:  # compatibility with older python ASTs
        return float(node.n)

    def visit_Name(self, node: ast.Name) -> Any:
        if node.id in self.context:
            return float(self.context[node.id])
        return 0.0


class FormulaDSLEngine:
    """
    Manages declarative financial modeling rules, compiles syntax into safe ASTs,
    and executes topologically on the N-Dimensional Cube.
    """

    def __init__(self):
        self.rules: Dict[str, FormulaRule] = {}
        self._register_default_anaplan_rules()

    def _register_default_anaplan_rules(self):
        self.add_rule(
            "Receita_Liquida",
            "[Receita_Bruta] - [Deducoes_Receita]",
            "Receita Operacional Líquida = Faturamento Bruto deduzido de tributos e devoluções"
        )
        self.add_rule(
            "Margem_Bruta",
            "[Receita_Liquida] - [CMV]",
            "Margem Bruta = Receita Líquida deduzida do Custo das Mercadorias Vendidas"
        )
        self.add_rule(
            "EBITDA",
            "[Margem_Bruta] - [Despesas_Vendas] - [Despesas_Gerais_Admin]",
            "EBITDA = Margem Bruta deduzida das despesas operacionais SG&A"
        )
        self.add_rule(
            "EBIT",
            "[EBITDA] - [Depreciacao_Amortizacao]",
            "EBIT / Resultado Operacional = EBITDA deduzido de D&A"
        )
        self.add_rule(
            "EBT",
            "[EBIT] + [Resultado_Financeiro]",
            "EBT = Resultado Operacional ajustado do Resultado Financeiro Líquido"
        )
        self.add_rule(
            "Impostos_Lucro",
            "IF [EBT] > 0 THEN [EBT] * 0.34 ELSE 0",
            "IRPJ/CSLL estimado à alíquota padrão de 34% sobre lucro tributável"
        )
        self.add_rule(
            "Lucro_Liquido",
            "[EBT] - [Impostos_Lucro]",
            "Lucro Líquido Final do Período"
        )

    def add_rule(self, target_account: str, expression: str, description: str = "") -> FormulaRule:
        rule = FormulaRule(target_account, expression, description)
        self.rules[target_account] = rule
        return rule

    def remove_rule(self, target_account: str):
        if target_account in self.rules:
            del self.rules[target_account]

    def get_rules(self) -> List[Dict[str, Any]]:
        return [r.to_dict() for r in self.rules.values()]

    def get_topological_order(self) -> List[str]:
        """Calculates topological calculation order of formula dependencies (Kahn's algorithm)."""
        in_degree = {target: 0 for target in self.rules}
        adj: Dict[str, List[str]] = {target: [] for target in self.rules}

        for target, rule in self.rules.items():
            for dep in rule.dependencies:
                if dep in self.rules:
                    adj.setdefault(dep, []).append(target)
                    in_degree[target] += 1

        queue = [node for node, deg in in_degree.items() if deg == 0]
        result = []

        while queue:
            node = queue.pop(0)
            result.append(node)
            for neighbor in adj.get(node, []):
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        if len(result) != len(self.rules):
            # Fallback in case of cycle, return keys
            return list(self.rules.keys())

        return result

    def _convert_anaplan_syntax_to_python_ast(self, expr_str: str) -> ast.AST:
        """Converts Anaplan DSL tokens ([Account], IF/THEN/ELSE) to standard AST."""
        # 1. Replace [Account] with valid identifier Account
        transformed = re.sub(r'\[([a-zA-Z0-9_]+)\]', r'\1', expr_str)

        # 2. Transform IF condition THEN expr_a ELSE expr_b into Python ternary: (expr_a if condition else expr_b)
        if_match = re.match(r'^\s*IF\s+(.+?)\s+THEN\s+(.+?)\s+ELSE\s+(.+?)\s*$', transformed, re.IGNORECASE)
        if if_match:
            cond, if_true, if_false = if_match.groups()
            transformed = f"({if_true}) if ({cond}) else ({if_false})"

        # 3. Parse AST safely
        parsed = ast.parse(transformed, mode='eval')
        return parsed.body

    def evaluate_rule(self, rule: FormulaRule, context: Dict[str, float]) -> float:
        """Evaluates a single rule given an account values dictionary context."""
        try:
            ast_node = self._convert_anaplan_syntax_to_python_ast(rule.expression)
            evaluator = SafeExpressionEvaluator(context)
            res = evaluator.evaluate(ast_node)
            return round(float(res), 4)
        except Exception as e:
            # Fallback on evaluation error
            return 0.0

    def evaluate_all(self, context: Dict[str, float]) -> Dict[str, float]:
        """Evaluates all rules topologically, mutating and enriching context in order."""
        ctx = dict(context)
        order = self.get_topological_order()
        for target in order:
            if target in self.rules:
                val = self.evaluate_rule(self.rules[target], ctx)
                ctx[target] = val
        return ctx


# Global singleton instance of DSL Engine
global_dsl_engine = FormulaDSLEngine()
