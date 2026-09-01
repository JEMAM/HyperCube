from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.routes import router
from backend.app.api.multidim_routes import router as multidim_router
from backend.app.api.cvm_routes import router as cvm_router
from backend.app.api.valuation_routes import router as valuation_router
from backend.app.api.bp_routes import router as bp_router
from backend.app.api.statements_routes import router as statements_router
from backend.app.api.connections_routes import router as connections_router
from backend.app.api.auth_routes import router as auth_router
from backend.app.api.three_statement_routes import router as three_statement_router
from backend.app.api.driver_planning_routes import router as driver_planning_router
from backend.app.api.forecast_routes import router as forecast_router
from backend.app.api.governance_routes import router as governance_router
from backend.app.services.macro_sync_agent import macro_sync_agent
from backend.app.cvm.watchdog import cvm_watchdog


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start the background daily macro synchronization worker & initialize CVM
    await macro_sync_agent.start()
    try:
        import asyncio
        asyncio.create_task(cvm_watchdog.run_detection_cycle())
    except Exception:
        pass
    yield
    # Shutdown: Stop the background worker cleanly
    await macro_sync_agent.stop()

app = FastAPI(
    title="Hyperblock Engine API — Multi-Setorial (DRE, DFC & BP)",
    description="Motor de cálculo multidimensional reativo e simulador What-If para qualquer setor",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
app.include_router(multidim_router)
app.include_router(cvm_router, prefix="/api")
app.include_router(cvm_router)
app.include_router(valuation_router, prefix="/api")
app.include_router(valuation_router)
app.include_router(bp_router, prefix="/api")
app.include_router(bp_router)
app.include_router(statements_router, prefix="/api")
app.include_router(statements_router)
app.include_router(connections_router, prefix="/api")
app.include_router(connections_router)
app.include_router(auth_router, prefix="/api")
app.include_router(auth_router)
app.include_router(three_statement_router, prefix="/api")
app.include_router(three_statement_router)
app.include_router(driver_planning_router, prefix="/api")
app.include_router(driver_planning_router)
app.include_router(forecast_router, prefix="/api")
app.include_router(forecast_router)
app.include_router(governance_router, prefix="/api")
app.include_router(governance_router)


@app.get("/")
def root():
    return {"message": "Hyperblock Engine API (Multi-Setorial DRE & DFC) is running", "docs": "/docs"}

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "2.0.0", "service": "hypercube-backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
