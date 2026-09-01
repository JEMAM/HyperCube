"""
Write-Back & Breakback (Top-Down Spread / Roll-Up) Engine.
Enables real-time cell-level editing with automatic proportional/equal allocation across consolidated hierarchies,
followed by topological DAG recalculation of all derived financial statement line items.
"""

from typing import Dict, List, Any, Optional, Tuple
import time
from backend.app.engine.multidim_cube import NDimensionalCube, global_cube
from backend.app.engine.formula_dsl import FormulaDSLEngine, global_dsl_engine


class WriteBackEngine:
    def __init__(self, cube: NDimensionalCube = None, dsl_engine: FormulaDSLEngine = None):
        self.cube = cube or global_cube
        self.dsl_engine = dsl_engine or global_dsl_engine

    def write_cell(
        self,
        time_id: str,
        version_id: str,
        scenario_id: str,
        entity_id: str,
        account_id: str,
        product_id: str,
        new_value: float,
        spread_method: str = "proportional",  # "proportional", "equal", "leaf_only"
        user: str = "Analyst"
    ) -> Dict[str, Any]:
        """
        Performs a write-back transaction to the N-Dimensional Cube.
        If coordinates target leaf members, updates directly.
        If coordinates target consolidated members, executes Breakback (Top-down spread).
        Then, recalculates downstream formula rules topologically across all affected slices.
        """
        start_t = time.perf_counter()

        time_leaves = self.cube.dimensions["time"].get_leaves(time_id)
        entity_leaves = self.cube.dimensions["entity"].get_leaves(entity_id)
        product_leaves = self.cube.dimensions["product"].get_leaves(product_id)

        is_consolidated = (len(time_leaves) > 1 or len(entity_leaves) > 1 or len(product_leaves) > 1)
        affected_leaves: List[Tuple[str, str, str]] = []

        for t in time_leaves:
            for e in entity_leaves:
                for p in product_leaves:
                    affected_leaves.append((t, e, p))

        current_total = self.cube.get_cell(time_id, version_id, scenario_id, entity_id, account_id, product_id)
        updated_cells_count = len(affected_leaves)

        if not is_consolidated or spread_method == "leaf_only":
            # 1. Direct leaf assignment
            t, e, p = affected_leaves[0] if affected_leaves else (time_id, entity_id, product_id)
            self.cube.set_cell(t, version_id, scenario_id, e, account_id, p, new_value)
            self._recalculate_leaf_slice(t, version_id, scenario_id, e, p)

        elif spread_method == "equal":
            # 2. Equal distribution across all child leaves
            each_val = new_value / len(affected_leaves) if affected_leaves else new_value
            for (t, e, p) in affected_leaves:
                self.cube.set_cell(t, version_id, scenario_id, e, account_id, p, each_val)
                self._recalculate_leaf_slice(t, version_id, scenario_id, e, p)

        else:  # "proportional" (default Breakback)
            # 3. Proportional Breakback based on previous ratio
            if abs(current_total) > 0.0001:
                ratio = new_value / current_total
                for (t, e, p) in affected_leaves:
                    prev_val = self.cube.get_cell(t, version_id, scenario_id, e, account_id, p)
                    self.cube.set_cell(t, version_id, scenario_id, e, account_id, p, prev_val * ratio)
                    self._recalculate_leaf_slice(t, version_id, scenario_id, e, p)
            else:
                # If previously 0, fallback to equal distribution
                each_val = new_value / len(affected_leaves)
                for (t, e, p) in affected_leaves:
                    self.cube.set_cell(t, version_id, scenario_id, e, account_id, p, each_val)
                    self._recalculate_leaf_slice(t, version_id, scenario_id, e, p)

        elapsed_ms = round((time.perf_counter() - start_t) * 1000, 4)

        # Get updated consolidated value
        recalculated_val = self.cube.get_cell(time_id, version_id, scenario_id, entity_id, account_id, product_id)

        return {
            "success": True,
            "target": {
                "time": time_id,
                "version": version_id,
                "scenario": scenario_id,
                "entity": entity_id,
                "account": account_id,
                "product": product_id
            },
            "old_value": current_total,
            "new_value": recalculated_val,
            "is_consolidated": is_consolidated,
            "spread_method": spread_method,
            "leaves_updated": updated_cells_count,
            "elapsed_ms": elapsed_ms,
            "user": user
        }

    def _recalculate_leaf_slice(self, time_id: str, version_id: str, scenario_id: str, entity_id: str, product_id: str):
        """Runs the DSL formula engine topologically for a given leaf slice."""
        context: Dict[str, float] = {}
        for acc_id in self.cube.dimensions["account"].members:
            context[acc_id] = self.cube.get_cell(time_id, version_id, scenario_id, entity_id, acc_id, product_id)

        # Evaluate rules in topological order
        recomputed = self.dsl_engine.evaluate_all(context)

        # Store recomputed calculated items back to cube
        for target_acc, val in recomputed.items():
            if target_acc in self.dsl_engine.rules:
                self.cube.set_cell(time_id, version_id, scenario_id, entity_id, target_acc, product_id, val, is_calculated=True)


# Global singleton instance of WriteBack engine
global_writeback_engine = WriteBackEngine()
