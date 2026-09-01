import os
import sys
import uvicorn

# Ensure the HyperCube root directory is in sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

def main():
    app_dir = os.path.join(root_dir, "backend", "app")
    uvicorn.run(
        "backend.app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[app_dir],
        reload_excludes=[
            "*/data/*",
            "*data*",
            "*.duckdb*",
            "*.wal",
            "*.json",
            "*__pycache__*"
        ],
        app_dir=root_dir
    )

if __name__ == "__main__":
    main()
