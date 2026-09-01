from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_get_catalog():
    res = client.get("/api/connections/catalog")
    assert res.status_code == 200
    catalog = res.json()
    assert isinstance(catalog, list)
    assert len(catalog) >= 10
    # Check SAP, Oracle, TOTVS, Snowflake
    instrument_ids = [inst["id"] for inst in catalog]
    assert "sap_s4hana" in instrument_ids
    assert "totvs_protheus" in instrument_ids
    assert "oracle_database" in instrument_ids
    assert "snowflake_dw" in instrument_ids

def test_list_and_save_connection():
    res_list = client.get("/api/connections")
    assert res_list.status_code == 200
    conns = res_list.json()
    assert isinstance(conns, list)

    # Save a test connection
    new_conn = {
        "instrument_id": "totvs_protheus",
        "name": "TOTVS Test Connection",
        "environment": "local",
        "config": {
            "host": "localhost",
            "port": 1433,
            "database": "TEST_DB",
            "company_branch": "01",
            "username": "sa",
            "password": "test_password"
        }
    }
    res_save = client.post("/api/connections", json=new_conn)
    assert res_save.status_code == 200
    saved = res_save.json()["connection"]
    assert saved["id"] is not None
    assert saved["name"] == "TOTVS Test Connection"

def test_test_connection_handshake():
    test_payload = {
        "instrument_id": "sap_s4hana",
        "environment": "cloud",
        "config": {
            "host": "sap-hana.corp.com",
            "port": 30015,
            "instance_number": "00",
            "client": "100",
            "database": "HDB_PRD",
            "username": "TEST_USER",
            "password": "SecretPassword123"
        }
    }
    res = client.post("/api/connections/test", json=test_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["latency_ms"] > 0
    assert "diagnostics" in data
    assert data["diagnostics"]["instrument"] == "SAP S/4HANA & ECC"

def test_activate_connection():
    res_list = client.get("/api/connections")
    conns = res_list.json()
    if conns:
        target_id = conns[0]["id"]
        res_act = client.post("/api/connections/activate", json={"connection_id": target_id})
        assert res_act.status_code == 200
        assert res_act.json()["success"] is True

        res_active = client.get("/api/connections/active")
        assert res_active.status_code == 200
        assert res_active.json()["active_connection"]["id"] == target_id

def test_sandbox_preset_test():
    # Test catalog contains sandbox_preset
    res = client.get("/api/connections/catalog")
    assert res.status_code == 200
    catalog = res.json()
    sap = next(item for item in catalog if item["id"] == "sap_s4hana")
    assert "sandbox_preset" in sap
    preset = sap["sandbox_preset"]
    assert "config" in preset
    assert preset["sample_records"] > 0

    # Test executing handshake with the sandbox preset
    test_payload = {
        "instrument_id": "sap_s4hana",
        "environment": preset["environment"],
        "config": preset["config"]
    }
    res_test = client.post("/api/connections/test", json=test_payload)
    assert res_test.status_code == 200
    data = res_test.json()
    assert data["success"] is True
    assert "🧪" in data["message"]
    assert data["diagnostics"]["sandbox_mode"] is True
    assert data["diagnostics"]["simulated_records_ready"] == preset["sample_records"]
