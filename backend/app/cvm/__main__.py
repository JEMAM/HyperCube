"""
CLI Entrypoint for CVM Watchdog.
Usage:
    python -m backend.app.cvm --run-once
    python -m backend.app.cvm.watchdog --run-once
"""
import asyncio
from backend.app.cvm.watchdog import cvm_watchdog

def main():
    print("[CVM Watchdog] Initiating manual watchdog execution cycle...", flush=True)
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        result = loop.run_until_complete(cvm_watchdog.run_detection_cycle())
        print(f"[CVM Watchdog] Execution Completed Successfully: {result}", flush=True)
    finally:
        loop.close()

if __name__ == "__main__":
    main()
