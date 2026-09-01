"""
Version & Scenario Lifecycle Manager for Enterprise Connected Planning.
Provides Version Branching, Snapshot Isolation, and Variance Analysis (4T24 vs 4T25, Budget vs Actuals, Deltas & % Var).
"""

from typing import Dict, List, Any, Optional
import duckdb
from backend.app.engine.multidim_cube import NDimensionalCube, global_cube


class VersionManager:
    def __init__(self, cube: NDimensionalCube = None):
        self.cube = cube or global_cube
        self.con = duckdb.connect(database=":memory:")
        self._init_duckdb_storage()

    def _init_duckdb_storage(self):
        self.con.execute("""
            CREATE TABLE IF NOT EXISTS version_snapshots (
                snapshot_id VARCHAR,
                version_id VARCHAR,
                created_at TIMESTAMP,
                author VARCHAR,
                description VARCHAR,
                cell_count INTEGER
            )
        """)

    def list_versions(self) -> List[Dict[str, Any]]:
        return [m.to_dict() for m in self.cube.dimensions["version"].members.values()]

    def list_scenarios(self) -> List[Dict[str, Any]]:
        return [m.to_dict() for m in self.cube.dimensions["scenario"].members.values()]

    def create_version(self, version_id: str, label: str) -> Dict[str, Any]:
        self.cube.dimensions["version"].add_member(version_id, label)
        return {"id": version_id, "label": label}

    def clone_version(
        self,
        source_version_id: str,
        new_version_id: str,
        new_label: str,
        growth_factor: float = 1.0,
        author: str = "Finance Team"
    ) -> Dict[str, Any]:
        """Clones all cells from a source version into a new branch version with optional adjustment multiplier."""
        self.create_version(new_version_id, new_label)

        cells_to_copy = [
            (t, s, e, a, p, val)
            for (t, v, s, e, a, p), val in self.cube.cells.items()
            if v == source_version_id
        ]

        copied_count = 0
        for (t, s, e, a, p, val) in cells_to_copy:
            new_val = val * growth_factor
            is_calc = (t, source_version_id, s, e, a, p) in self.cube.calculated_cells
            self.cube.set_cell(t, new_version_id, s, e, a, p, new_val, is_calculated=is_calc)
            copied_count += 1

        self.con.execute(
            "INSERT INTO version_snapshots VALUES (?, ?, current_timestamp, ?, ?, ?)",
            [f"snap_{new_version_id}", new_version_id, author, f"Cloned from {source_version_id} (Growth: {growth_factor})", copied_count]
        )

        return {
            "success": True,
            "source_version": source_version_id,
            "new_version": new_version_id,
            "label": new_label,
            "cells_cloned": copied_count,
            "growth_factor": growth_factor
        }

    def compute_variance(
        self,
        base_version: str,
        target_version: str,
        filters: Dict[str, str]
    ) -> Dict[str, Any]:
        """
        Computes side-by-side Variance Analysis:
        Supports comparing two periods (e.g. 4T24 vs 4T25) or two versions (e.g. Budget vs Actuals).
        Calculates Value_Base, Value_Target, Delta ($), and Variance (%).
        """
        account_members = list(self.cube.dimensions["account"].members.keys())
        time_members = [tm.id for tm in self.cube.dimensions["time"].members.values() if tm.id != "Budget_2026"]
        default_base = time_members[1] if len(time_members) > 1 else (time_members[0] if time_members else "1T25")
        default_target = time_members[0] if time_members else "1T26"
        
        base_time = filters.get("base_time") or filters.get("time") or default_base
        target_time = filters.get("target_time") or filters.get("time") or default_target
        if not base_time or base_time not in self.cube.dimensions["time"].members:
            base_time = default_base
        if not target_time or target_time not in self.cube.dimensions["time"].members:
            target_time = default_target
        
        scenario_id = filters.get("scenario", "Base")
        entity_id = filters.get("entity", "Total_Company")
        product_id = filters.get("product", "Total_Products")

        rows = []
        for acc_id in account_members:
            acc_meta = self.cube.dimensions["account"].members[acc_id]
            val_base = self.cube.get_cell(base_time, base_version, scenario_id, entity_id, acc_id, product_id)
            val_target = self.cube.get_cell(target_time, target_version, scenario_id, entity_id, acc_id, product_id)

            delta = round(val_target - val_base, 2)
            pct_var = round((delta / abs(val_base) * 100), 2) if abs(val_base) > 0.001 else 0.0

            # Classification: Positive delta on Revenue / Profit / EBITDA is favorable.
            # Negative delta on Expense / Cost / CPV is favorable.
            is_cost_or_expense = any(k in acc_id for k in ["CMV", "Despesas", "Impostos"])
            if is_cost_or_expense:
                status = "favorable" if delta <= 0 else "unfavorable"
            else:
                status = "favorable" if delta >= 0 else "unfavorable"

            rows.append({
                "account_id": acc_id,
                "label": acc_meta.label,
                "base_version": base_version,
                "target_version": target_version,
                "base_time": base_time,
                "target_time": target_time,
                "val_base": val_base,
                "val_target": val_target,
                "delta": delta,
                "variance_pct": pct_var,
                "status": status
            })

        return {
            "base_version": base_version,
            "target_version": target_version,
            "base_time": base_time,
            "target_time": target_time,
            "filters": {
                "base_time": base_time,
                "target_time": target_time,
                "scenario": scenario_id,
                "entity": entity_id,
                "product": product_id
            },
            "rows": rows
        }


# Global singleton instance of VersionManager
global_version_manager = VersionManager()
