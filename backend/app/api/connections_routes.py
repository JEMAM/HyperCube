"""
API Routes for ERP & Database Connections (Local & Cloud).
Endpoints for catalog listing, CRUD of connections, live handshake/ping test, and activation.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from backend.app.services.connections_service import connections_service

router = APIRouter(prefix="/connections", tags=["Conexões ERP & Bancos de Dados"])


class TestConnectionRequest(BaseModel):
    instrument_id: str
    config: Dict[str, Any]
    environment: Optional[str] = "cloud"


class SaveConnectionRequest(BaseModel):
    id: Optional[str] = None
    instrument_id: str
    name: str
    environment: Optional[str] = "cloud"
    config: Dict[str, Any] = {}
    is_active: Optional[bool] = False


class ActivateConnectionRequest(BaseModel):
    connection_id: str


@router.get("/catalog")
def get_instruments_catalog():
    """Returns the complete catalog of all supported ERPs, Databases, and Cloud Warehouses."""
    return connections_service.get_catalog()


@router.get("")
def list_connections():
    """Returns all saved connections configured by the user."""
    return connections_service.get_all_connections()


@router.get("/active")
def get_active_connection():
    """Returns the currently active connection supplying data to all screens."""
    active = connections_service.get_active_connection()
    return {"active_connection": active}


@router.post("")
def save_connection(req: SaveConnectionRequest):
    """Saves or updates an ERP/Database connection configuration."""
    saved = connections_service.save_connection(req.model_dump())
    return {"status": "success", "connection": saved}


@router.post("/test")
def test_connection(req: TestConnectionRequest):
    """
    Executes a real handshake / ping test against the chosen ERP or Database instrument.
    Measures latency in milliseconds, checks driver availability, and verifies connectivity.
    """
    res = connections_service.test_connection(
        instrument_id=req.instrument_id,
        config=req.config,
        environment=req.environment or "cloud"
    )
    if not res["success"]:
        return res
    return res


@router.post("/activate")
def activate_connection(req: ActivateConnectionRequest):
    """
    Activates the specified connection as the official HyperCube data source,
    propagating the connected status and data to all application screens.
    """
    try:
        res = connections_service.activate_connection(req.connection_id)
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ativar conexão: {str(e)}")


@router.post("/disconnect")
@router.post("/deactivate")
def disconnect_connection():
    """
    Deactivates any active ERP connection and returns the system to standalone baseline mode.
    """
    return connections_service.deactivate_connection()


@router.get("/sandbox-sample/{instrument_id}")
def get_sandbox_sample(instrument_id: str):
    """
    Returns visual sample accounting entries for the selected ERP/Database instrument.
    """
    entries = connections_service.get_sample_entries(instrument_id)
    return {"instrument_id": instrument_id, "sample_entries": entries, "total_simulated": len(entries)}


@router.delete("/{connection_id}")
def delete_connection(connection_id: str):
    """Deletes a saved connection."""
    success = connections_service.delete_connection(connection_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conexão não encontrada.")
    return {"status": "success", "message": f"Conexão '{connection_id}' removida com sucesso."}
