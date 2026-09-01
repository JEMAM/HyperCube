import asyncio
import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

from backend.app.agents.economic_agent import AgnoEconomicAgent

logger = logging.getLogger("macro_sync_agent")
logger.setLevel(logging.INFO)

CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
CACHE_FILE = os.path.join(CACHE_DIR, "macro_sync_state.json")

class MacroDailySyncAgent:
    """
    Autonomous Background Worker Agent responsible for daily synchronization of all
    macroeconomic series (BCB SGS, Focus Market Expectations & IBGE IPP/SIDRA).
    Ensures all numbers are updated daily and precision standard (2 decimal places) is maintained.
    """

    def __init__(self):
        self._is_running = False
        self._task: Optional[asyncio.Task] = None
        self._last_sync_time: Optional[datetime] = None
        self._status: str = "initialized"
        self._series_count: int = 0
        self._sync_logs: list = []
        self._agent = AgnoEconomicAgent()
        self._load_persisted_state()

    def _load_persisted_state(self):
        try:
            if os.path.exists(CACHE_FILE):
                with open(CACHE_FILE, "r", encoding="utf-8") as f:
                    state = json.load(f)
                    if state.get("last_sync_time"):
                        self._last_sync_time = datetime.fromisoformat(state["last_sync_time"])
                    self._status = state.get("status", "ready")
                    self._series_count = state.get("series_count", 13)
        except Exception as e:
            logger.warning(f"Could not load macro sync state: {e}")

    def _save_persisted_state(self):
        try:
            os.makedirs(CACHE_DIR, exist_ok=True)
            with open(CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump({
                    "last_sync_time": self._last_sync_time.isoformat() if self._last_sync_time else None,
                    "last_sync_formatted": self._last_sync_time.strftime("%d/%m/%Y %H:%M:%S") if self._last_sync_time else "-",
                    "status": self._status,
                    "series_count": self._series_count,
                    "frequency": "Diária (24h)",
                    "agent_name": "Agente IA Agno Macro Sync (SGS & Focus)"
                }, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.warning(f"Could not save macro sync state: {e}")

    async def start(self):
        """Starts the daily background synchronization worker loop."""
        if self._is_running:
            return
        self._is_running = True
        self._task = asyncio.create_task(self._sync_loop())
        logger.info("MacroDailySyncAgent worker started.")

    async def stop(self):
        """Stops the background worker loop gracefully."""
        self._is_running = False
        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("MacroDailySyncAgent worker stopped.")

    async def _sync_loop(self):
        """Continuous async loop executing daily synchronization."""
        # Initial brief sleep to let FastAPI finish binding port
        await asyncio.sleep(1)
        try:
            await self.execute_sync()
        except Exception as e:
            logger.warning(f"Initial macro sync warning: {e}")

        while self._is_running:
            try:
                # Sleep for 6 hours before next automatic scheduled check (4 times daily)
                await asyncio.sleep(6 * 3600)
                if self._is_running:
                    await self.execute_sync()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in macro sync loop: {e}")
                await asyncio.sleep(300)

    async def execute_sync(self) -> Dict[str, Any]:
        """Executes a full synchronization of BCB SGS, Focus and IBGE IPP series."""
        start_time = datetime.now()
        self._status = "syncing"
        try:
            # Force cache invalidation in economic agent
            import backend.app.agents.economic_agent as ea
            ea._cache_data = {}
            ea._cache_timestamp = None

            # Fetch fresh data
            loop = asyncio.get_event_loop()
            data = await loop.run_in_executor(None, self._agent.get_all_economic_data)

            self._last_sync_time = datetime.now()
            self._status = "success"
            self._series_count = len(data.get("table", []))

            duration = (datetime.now() - start_time).total_seconds()
            log_entry = {
                "timestamp": self._last_sync_time.strftime("%d/%m/%Y %H:%M:%S"),
                "duration_seconds": round(duration, 2),
                "status": "success",
                "indicators_synced": self._series_count,
                "focus_weeks_synced": len(data.get("focus_survey", {}).get("survey_weeks", []))
            }
            self._sync_logs.insert(0, log_entry)
            self._sync_logs = self._sync_logs[:10]  # Keep last 10

            self._save_persisted_state()
            logger.info(f"Macro sync completed successfully in {duration:.2f}s.")
            return {
                "status": "success",
                "message": "Sincronização macroeconômica concluída com sucesso.",
                "last_sync": self._last_sync_time.strftime("%d/%m/%Y %H:%M:%S"),
                "duration_s": round(duration, 2),
                "series_count": self._series_count
            }
        except Exception as e:
            self._status = "error"
            logger.error(f"Failed to synchronize macro data: {e}")
            return {
                "status": "error",
                "message": f"Erro durante sincronização: {str(e)}",
                "last_sync": self._last_sync_time.strftime("%d/%m/%Y %H:%M:%S") if self._last_sync_time else "-"
            }

    def get_status(self) -> Dict[str, Any]:
        """Returns the current operational status of the Daily Macro Sync Agent."""
        next_sync = (self._last_sync_time + timedelta(hours=6)) if self._last_sync_time else None
        return {
            "agent_active": self._is_running,
            "status": self._status,
            "frequency": "Diária e Contínua (4x ao dia com agendamento e trigger manual)",
            "last_sync": self._last_sync_time.strftime("%d/%m/%Y %H:%M:%S") if self._last_sync_time else "Aguardando 1ª sincronização",
            "next_sync_estimated": next_sync.strftime("%d/%m/%Y %H:%M:%S") if next_sync else "Em breve",
            "series_count": self._series_count or 13,
            "history": self._sync_logs
        }

macro_sync_agent = MacroDailySyncAgent()
