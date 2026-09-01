"""
Calculation Trace & Cell Audit Trail Engine (Anaplan-grade observability).
Enables inspecting any cell in the N-Dimensional Cube to view:
1. Exact calculation lineage (Formula, AST dependencies, Precedent values).
2. Hierarchical roll-up contributions from child leaves.
3. User audit history (who edited what, when, old value vs new value).
"""

import time
from typing import Dict, List, Any, Optional
from datetime import datetime
from backend.app.engine.multidim_cube import NDimensionalCube, global_cube
from backend.app.engine.formula_dsl import FormulaDSLEngine, global_dsl_engine


class AuditEvent:
    def __init__(self, user: str, coords: Dict[str, str], old_val: float, new_val: float, spread_method: str):
        self.timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.user = user
        self.coords = coords
        self.old_val = old_val
        self.new_val = new_val
        self.spread_method = spread_method

    def to_dict(self) -> Dict[str, Any]:
        return {
            "timestamp": self.timestamp,
            "user": self.user,
            "coords": self.coords,
            "old_val": self.old_val,
            "new_val": self.new_val,
            "spread_method": self.spread_method
        }


class AuditTracer:
    def __init__(self, cube: NDimensionalCube = None, dsl_engine: FormulaDSLEngine = None):
        self.cube = cube or global_cube
        self.dsl_engine = dsl_engine or global_dsl_engine
        self.history: List[AuditEvent] = []

    def record_edit(self, user: str, coords: Dict[str, str], old_val: float, new_val: float, spread_method: str):
        self.history.insert(0, AuditEvent(user, coords, old_val, new_val, spread_method))
        if len(self.history) > 1000:
            self.history.pop()

    def get_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        return [e.to_dict() for e in self.history[:limit]]

    def trace_cell(
        self,
        time_id: str,
        version_id: str,
        scenario_id: str,
        entity_id: str,
        account_id: str,
        product_id: str
    ) -> Dict[str, Any]:
        """
        Builds a comprehensive Calculation Trace for any cell coordinate.
        Returns:
        - Current evaluated value
        - Cell classification (Leaf Input, Derived Formula, or Hierarchical Consolidation)
        - Precedent line items & their values
        - Child leaf breakdown if consolidated
        """
        val = self.cube.get_cell(time_id, version_id, scenario_id, entity_id, account_id, product_id)

        time_leaves = self.cube.dimensions["time"].get_leaves(time_id)
        entity_leaves = self.cube.dimensions["entity"].get_leaves(entity_id)
        product_leaves = self.cube.dimensions["product"].get_leaves(product_id)

        is_consolidated = (len(time_leaves) > 1 or len(entity_leaves) > 1 or len(product_leaves) > 1)
        is_calculated = account_id in self.dsl_engine.rules

        trace_type = "Consolidação Hierárquica" if is_consolidated else ("Fórmula Calculada" if is_calculated else "Premissa / Input Direto")

        precedents = []
        formula_info = None

        if is_calculated:
            rule = self.dsl_engine.rules[account_id]
            formula_info = {
                "expression": rule.expression,
                "description": rule.description
            }
            for dep in rule.dependencies:
                dep_val = self.cube.get_cell(time_id, version_id, scenario_id, entity_id, dep, product_id)
                dep_meta = self.cube.dimensions["account"].members.get(dep)
                precedents.append({
                    "account_id": dep,
                    "label": dep_meta.label if dep_meta else dep,
                    "value": dep_val
                })

        contributions = []
        if is_consolidated:
            for t in time_leaves:
                for e in entity_leaves:
                    for p in product_leaves:
                        leaf_val = self.cube.get_cell(t, version_id, scenario_id, e, account_id, p)
                        if abs(leaf_val) > 0.0001:
                            t_lbl = self.cube.dimensions["time"].members[t].label
                            e_lbl = self.cube.dimensions["entity"].members[e].label
                            p_lbl = self.cube.dimensions["product"].members[p].label
                            contributions.append({
                                "coordinates": f"{t_lbl} | {e_lbl} | {p_lbl}",
                                "value": leaf_val,
                                "share_pct": round((leaf_val / val * 100), 2) if abs(val) > 0.001 else 0.0
                            })

        return {
            "target": {
                "time": time_id,
                "version": version_id,
                "scenario": scenario_id,
                "entity": entity_id,
                "account": account_id,
                "product": product_id,
                "account_label": self.cube.dimensions["account"].members[account_id].label
            },
            "value": val,
            "type": trace_type,
            "is_calculated": is_calculated,
            "is_consolidated": is_consolidated,
            "formula": formula_info,
            "precedents": precedents,
            "contributions_count": len(contributions),
            "contributions": contributions[:20]  # top 20 items
        }


# Global singleton instance of AuditTracer
global_audit_tracer = AuditTracer()
