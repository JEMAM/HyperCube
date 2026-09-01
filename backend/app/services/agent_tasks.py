import time
import uuid
import logging
import threading
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, Optional, List

logger = logging.getLogger("agent_tasks")
logger.setLevel(logging.INFO)

class AgentTaskManager:
    """
    Manages long-running AI Agent tasks in background worker threads.
    Guarantees that agent inference continues to completion even if the user
    navigates away, switches tabs, or closes the client connection.
    """
    def __init__(self, max_workers: int = 4):
        self._executor = ThreadPoolExecutor(max_workers=max_workers, thread_name_prefix="AgentTaskWorker")
        self._tasks: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()

    def submit_task(
        self,
        agent_type: str,
        question: str,
        execution_fn,
        company_name: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        task_id = f"task_{int(time.time())}_{uuid.uuid4().hex[:8]}"
        task_record = {
            "task_id": task_id,
            "agent_type": agent_type,
            "question": question,
            "company_name": company_name or "Modelo Consolidado",
            "status": "running",
            "answer": None,
            "error_message": None,
            "created_at": time.time(),
            "completed_at": None,
            "metadata": metadata or {}
        }

        with self._lock:
            self._tasks[task_id] = task_record
            # Clean up old tasks if dictionary grows too large
            if len(self._tasks) > 200:
                sorted_keys = sorted(self._tasks.keys(), key=lambda k: self._tasks[k]["created_at"])
                for old_key in sorted_keys[:50]:
                    del self._tasks[old_key]

        logger.info(f"Submitting background agent task {task_id} for agent '{agent_type}'")
        self._executor.submit(self._run_task, task_id, execution_fn)
        return task_id

    def _run_task(self, task_id: str, execution_fn):
        try:
            logger.info(f"Starting execution of background task {task_id}")
            answer = execution_fn()
            with self._lock:
                if task_id in self._tasks:
                    self._tasks[task_id]["status"] = "completed"
                    self._tasks[task_id]["answer"] = str(answer) if answer is not None else ""
                    self._tasks[task_id]["completed_at"] = time.time()
            logger.info(f"Task {task_id} completed successfully.")
        except Exception as e:
            logger.exception(f"Error executing task {task_id}: {e}")
            with self._lock:
                if task_id in self._tasks:
                    self._tasks[task_id]["status"] = "error"
                    self._tasks[task_id]["error_message"] = str(e)
                    self._tasks[task_id]["completed_at"] = time.time()

    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            task = self._tasks.get(task_id)
            return dict(task) if task else None

    def list_active_tasks(self) -> List[Dict[str, Any]]:
        with self._lock:
            return [
                dict(t) for t in self._tasks.values()
                if t["status"] == "running"
            ]

    def list_recent_tasks(self, limit: int = 20) -> List[Dict[str, Any]]:
        with self._lock:
            sorted_tasks = sorted(
                self._tasks.values(),
                key=lambda x: x["created_at"],
                reverse=True
            )
            return [dict(t) for t in sorted_tasks[:limit]]

# Global singleton
agent_task_manager = AgentTaskManager(max_workers=4)
