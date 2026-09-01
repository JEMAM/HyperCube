"""
Local SQLite database persistence for HyperCube authentication.
Stores registered users, emails, and passwords in a local SQLite database (backend/app/data/users.db).
Permits any user registration for testing and provides seeded demo accounts.
"""

import os
import sqlite3
import hashlib
from pathlib import Path
from typing import Dict, Any, Optional, List

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "app" / "data"
AUTH_DB_PATH = DATA_DIR / "users.db"


def hash_password(password: str) -> str:
    """Computes a secure SHA-256 hash with a fixed salt for local storage."""
    salt = "hypercube_salt_2026_"
    return hashlib.sha256(f"{salt}{password}".encode("utf-8")).hexdigest()


class AuthDatabase:
    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = db_path or AUTH_DB_PATH
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path), timeout=10.0)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Initializes the users table and seeds demo accounts if empty."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
                    password_hash TEXT NOT NULL,
                    company TEXT DEFAULT 'HyperCube Corp',
                    role TEXT DEFAULT 'FP&A Director',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            # Seed default test accounts if table is empty
            cursor.execute("SELECT COUNT(*) AS cnt FROM users;")
            row = cursor.fetchone()
            if row and row["cnt"] == 0:
                demo_users = [
                    (
                        "Administrador Demo",
                        "admin@hypercube.com",
                        hash_password("admin123"),
                        "HyperCube Matriz",
                        "Diretor de Planejamento (FP&A)"
                    ),
                    (
                        "Analista de Finanças",
                        "demo@hypercube.com",
                        hash_password("demo123"),
                        "Empresa de Demonstração S.A.",
                        "Analista Financeiro Sênior"
                    )
                ]
                cursor.executemany("""
                    INSERT INTO users (name, email, password_hash, company, role)
                    VALUES (?, ?, ?, ?, ?);
                """, demo_users)

            conn.commit()

    def register_user(
        self,
        name: str,
        email: str,
        password: str,
        company: Optional[str] = None,
        role: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Registers a new user into the local SQLite database.
        Allows any valid registration for testing. If the email already exists,
        updates the user credentials and info gracefully to allow re-testing.
        """
        name = (name or "").strip() or "Usuário de Teste"
        email = (email or "").strip().lower()
        if not email or "@" not in email:
            raise ValueError("Por favor, forneça um endereço de e-mail válido.")
        if not password or len(password) < 3:
            raise ValueError("A senha deve ter pelo menos 3 caracteres.")

        company = (company or "").strip() or "Empresa de Testes"
        role = (role or "").strip() or "Planejador FP&A"
        pwd_hash = hash_password(password)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            # Check if user already exists
            cursor.execute("SELECT id FROM users WHERE email = ?;", (email,))
            existing = cursor.fetchone()

            if existing:
                # Update existing user to facilitate seamless testing
                cursor.execute("""
                    UPDATE users
                    SET name = ?, password_hash = ?, company = ?, role = ?
                    WHERE email = ?;
                """, (name, pwd_hash, company, role, email))
                user_id = existing["id"]
            else:
                cursor.execute("""
                    INSERT INTO users (name, email, password_hash, company, role)
                    VALUES (?, ?, ?, ?, ?);
                """, (name, email, pwd_hash, company, role))
                user_id = cursor.lastrowid

            conn.commit()

        return {
            "id": user_id,
            "name": name,
            "email": email,
            "company": company,
            "role": role,
            "is_new": existing is None
        }

    def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Authenticates a user against local SQLite database.
        Returns user dictionary if credentials match, else None.
        """
        email = (email or "").strip().lower()
        if not email or not password:
            return None

        pwd_hash = hash_password(password)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, name, email, password_hash, company, role, created_at
                FROM users
                WHERE email = ?;
            """, (email,))
            row = cursor.fetchone()

            if not row:
                return None

            if row["password_hash"] == pwd_hash:
                return {
                    "id": row["id"],
                    "name": row["name"],
                    "email": row["email"],
                    "company": row["company"],
                    "role": row["role"],
                    "created_at": row["created_at"]
                }
            return None

    def list_users(self) -> List[Dict[str, Any]]:
        """Returns all registered users stored in local SQLite."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, name, email, company, role, created_at
                FROM users
                ORDER BY id ASC;
            """)
            rows = cursor.fetchall()
            return [
                {
                    "id": row["id"],
                    "name": row["name"],
                    "email": row["email"],
                    "company": row["company"],
                    "role": row["role"],
                    "created_at": row["created_at"]
                }
                for row in rows
            ]

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Finds user by email."""
        email = (email or "").strip().lower()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, name, email, company, role, created_at
                FROM users
                WHERE email = ?;
            """, (email,))
            row = cursor.fetchone()
            if row:
                return {
                    "id": row["id"],
                    "name": row["name"],
                    "email": row["email"],
                    "company": row["company"],
                    "role": row["role"],
                    "created_at": row["created_at"]
                }
            return None


# Global singleton instance
auth_db = AuthDatabase()
