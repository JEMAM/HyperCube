import time
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.agent_tasks import AgentTaskManager

client = TestClient(app)

def test_agent_task_manager_direct():
    mgr = AgentTaskManager(max_workers=2)
    def dummy_job():
        time.sleep(0.1)
        return "Análise concluída com sucesso"

    task_id = mgr.submit_task("dre", "Qual a margem?", dummy_job, company_name="Empresa Teste")
    assert task_id.startswith("task_")
    
    # Check running or completed
    task = mgr.get_task(task_id)
    assert task is not None
    assert task["agent_type"] == "dre"
    assert task["company_name"] == "Empresa Teste"

    # Wait for completion
    time.sleep(0.3)
    completed_task = mgr.get_task(task_id)
    assert completed_task["status"] == "completed"
    assert completed_task["answer"] == "Análise concluída com sucesso"

def test_agent_task_api_endpoints():
    # Submit task via API
    res = client.post("/api/agent/task/submit", json={
        "agent_type": "dre",
        "question": "Qual o lucro da empresa?"
    })
    assert res.status_code == 200
    data = res.json()
    assert "task_id" in data
    assert data["status"] == "running"
    task_id = data["task_id"]

    # Check status endpoint
    res_status = client.get(f"/api/agent/task/status/{task_id}")
    assert res_status.status_code == 200
    status_data = res_status.json()
    assert status_data["task_id"] == task_id
    assert status_data["status"] in ["running", "completed"]

    # Check active tasks list
    res_active = client.get("/api/agent/task/active")
    assert res_active.status_code == 200
    assert isinstance(res_active.json(), list)
