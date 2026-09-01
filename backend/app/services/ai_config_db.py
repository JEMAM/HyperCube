"""
Local Database persistence for AI credentials and active model configurations.
Stores API keys and selected models in a local SQLite database (backend/app/data/ai_settings.db)
allowing seamless switching between AI models without re-entering keys.
"""

import os
import sqlite3
from pathlib import Path
from typing import Dict, Any, Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "app" / "data"
DB_PATH = DATA_DIR / "ai_settings.db"


class AIConfigDatabase:
    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = db_path or DB_PATH
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path), timeout=10.0)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Initializes tables for credentials and active model state, seeding existing env keys if present."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ai_credentials (
                    provider TEXT PRIMARY KEY,
                    api_key TEXT NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ai_active_config (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    provider TEXT NOT NULL,
                    model TEXT NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            # Seed default active config if table is empty
            cursor.execute("SELECT provider, model FROM ai_active_config WHERE id = 1;")
            row = cursor.fetchone()
            if not row:
                cursor.execute("""
                    INSERT INTO ai_active_config (id, provider, model)
                    VALUES (1, 'groq', 'llama-3.3-70b-versatile');
                """)

            # Seed any existing environment keys if not yet saved in database
            env_mappings = {
                "groq": os.environ.get("GROQ_API_KEY", ""),
                "gemini": os.environ.get("GEMINI_API_KEY", "") or os.environ.get("GOOGLE_API_KEY", ""),
                "anthropic": os.environ.get("ANTHROPIC_API_KEY", "") or os.environ.get("CLAUDE_API_KEY", ""),
                "openai": os.environ.get("OPENAI_API_KEY", ""),
                "ollama": os.environ.get("OLLAMA_ENDPOINT", "http://localhost:11434"),
            }

            for prov, key in env_mappings.items():
                if key and key.strip():
                    cursor.execute("SELECT api_key FROM ai_credentials WHERE provider = ?;", (prov,))
                    if not cursor.fetchone():
                        cursor.execute("""
                            INSERT INTO ai_credentials (provider, api_key)
                            VALUES (?, ?);
                        """, (prov, key.strip()))

            conn.commit()

    def get_credential(self, provider: str) -> str:
        """Retrieves stored API key or endpoint for a given provider."""
        provider = (provider or "").lower().strip()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT api_key FROM ai_credentials WHERE provider = ?;", (provider,))
            row = cursor.fetchone()
            return row["api_key"] if row else ""

    def get_all_credentials(self) -> Dict[str, str]:
        """Returns a dictionary of all saved provider keys."""
        creds = {
            "groq": "",
            "gemini": "",
            "anthropic": "",
            "openai": "",
            "ollama": "http://localhost:11434",
        }
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT provider, api_key FROM ai_credentials;")
            for row in cursor.fetchall():
                creds[row["provider"]] = row["api_key"]
        return creds

    def save_credential(self, provider: str, api_key: str):
        """Saves or updates API key for a provider in the local database and environment."""
        provider = (provider or "").lower().strip()
        clean_key = (api_key or "").strip()

        with self._get_connection() as conn:
            cursor = conn.cursor()
            if clean_key:
                cursor.execute("""
                    INSERT INTO ai_credentials (provider, api_key, updated_at)
                    VALUES (?, ?, CURRENT_TIMESTAMP)
                    ON CONFLICT(provider) DO UPDATE SET
                        api_key = excluded.api_key,
                        updated_at = CURRENT_TIMESTAMP;
                """, (provider, clean_key))
            else:
                cursor.execute("DELETE FROM ai_credentials WHERE provider = ?;", (provider,))
            conn.commit()

        self._sync_env_var(provider, clean_key)

    def _sync_env_var(self, provider: str, key: str):
        """Synchronizes environment variables for active libraries."""
        prov = provider.lower()
        if key:
            if prov == "groq":
                os.environ["GROQ_API_KEY"] = key
            elif prov == "gemini":
                os.environ["GEMINI_API_KEY"] = key
                os.environ["GOOGLE_API_KEY"] = key
            elif prov == "anthropic":
                os.environ["ANTHROPIC_API_KEY"] = key
                os.environ["CLAUDE_API_KEY"] = key
            elif prov == "openai":
                os.environ["OPENAI_API_KEY"] = key
            elif prov == "ollama":
                os.environ["OLLAMA_ENDPOINT"] = key
        else:
            if prov == "groq":
                os.environ.pop("GROQ_API_KEY", None)
            elif prov == "gemini":
                os.environ.pop("GEMINI_API_KEY", None)
                os.environ.pop("GOOGLE_API_KEY", None)
            elif prov == "anthropic":
                os.environ.pop("ANTHROPIC_API_KEY", None)
                os.environ.pop("CLAUDE_API_KEY", None)
            elif prov == "openai":
                os.environ.pop("OPENAI_API_KEY", None)

    def get_active_config(self) -> Dict[str, Any]:
        """Retrieves active provider, model, current key, and all saved credentials."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT provider, model FROM ai_active_config WHERE id = 1;")
            row = cursor.fetchone()
            if row:
                provider = row["provider"]
                model = row["model"]
            else:
                provider = "groq"
                model = "llama-3.3-70b-versatile"

        saved_keys = self.get_all_credentials()
        current_key = saved_keys.get(provider, "")
        if current_key:
            self._sync_env_var(provider, current_key)

        return {
            "provider": provider,
            "model": model,
            "api_key": current_key,
            "saved_keys": saved_keys,
        }

    def set_active_config(self, provider: str, model: str, api_key: Optional[str] = None) -> Dict[str, Any]:
        """
        Updates the active AI model and provider in the local database.
        If api_key is provided and not empty, it is saved in ai_credentials.
        If api_key is omitted or empty, the existing key for this provider is loaded from ai_credentials.
        """
        provider = (provider or "groq").lower().strip()
        model = (model or "").strip()

        # If a new key was provided, persist it in the database
        if api_key is not None and api_key.strip():
            self.save_credential(provider, api_key.strip())

        # Load the effective key stored in DB for this provider
        effective_key = self.get_credential(provider)
        self._sync_env_var(provider, effective_key)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO ai_active_config (id, provider, model, updated_at)
                VALUES (1, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id) DO UPDATE SET
                    provider = excluded.provider,
                    model = excluded.model,
                    updated_at = CURRENT_TIMESTAMP;
            """, (provider, model))
            conn.commit()

        return {
            "provider": provider,
            "model": model,
            "api_key": effective_key,
            "saved_keys": self.get_all_credentials(),
        }


# Global singleton instance
ai_config_db = AIConfigDatabase()
