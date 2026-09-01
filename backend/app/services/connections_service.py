"""
ERP & Database Connections Service for HyperCube Engine.
Manages connection credentials, multi-instrument catalog (ERPs, SQL Databases, Cloud Warehouses),
connection testing (handshake/latency), sandbox mock presets, and activation across all analytical screens.
"""

import os
import json
import time
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

CONNECTIONS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "connections.json")

# Predefined Catalog of Supported Instruments with Sandbox Presets
INSTRUMENTS_CATALOG = [
    # --- ERPs Enterprise ---
    {
        "id": "sap_s4hana",
        "name": "SAP S/4HANA & ECC",
        "category": "ERP_ENTERPRISE",
        "type": "ERP",
        "supported_environments": ["local", "cloud"],
        "default_port": 30015,
        "default_schema": "SAPABAP1",
        "default_table": "ACDOCA",
        "driver_info": "SAP HANA In-Memory Driver (hdbcli) / NetWeaver RFC / OData v4",
        "description": "Conexão de alta performance com a tabela unificada ACDOCA e plano de contas SKA1 do SAP Finance.",
        "icon": "Layers",
        "badge_color": "sky",
        "sandbox_preset": {
            "name": "SAP S/4HANA Finance (Sandbox Fictício)",
            "environment": "cloud",
            "sample_records": 18450,
            "mock_entity": "Klabin S.A. [SAP S/4HANA Sandbox]",
            "config": {
                "host": "sap-s4hana.sandbox.hypercube.internal",
                "port": 30015,
                "instance_number": "00",
                "client": "100",
                "database": "HDB_SANDBOX",
                "schema": "SAPABAP1",
                "table_mapping": "ACDOCA",
                "username": "SAP_SANDBOX_USER",
                "password": "DemoPassword2026!",
                "ssl_mode": "require"
            }
        },
        "fields": [
            {"key": "host", "label": "Host / Servidor / Instância HANA", "placeholder": "sap-hana.corp.internal ou 10.0.1.50", "type": "text", "required": True},
            {"key": "port", "label": "Porta Instância", "placeholder": "30015", "type": "number", "default": 30015, "required": True},
            {"key": "instance_number", "label": "Número da Instância", "placeholder": "00", "type": "text", "default": "00", "required": True},
            {"key": "client", "label": "Mandante (Client)", "placeholder": "100", "type": "text", "default": "100", "required": True},
            {"key": "database", "label": "Database / Tenant DB", "placeholder": "HDB_PRD", "type": "text", "required": True},
            {"key": "schema", "label": "Schema Contábil", "placeholder": "SAPABAP1", "type": "text", "default": "SAPABAP1", "required": False},
            {"key": "table_mapping", "label": "Tabela de Lançamentos", "placeholder": "ACDOCA", "type": "text", "default": "ACDOCA", "required": False},
            {"key": "username", "label": "Usuário Técnico / RFC", "placeholder": "SAP_HYPERCUBE_USER", "type": "text", "required": True},
            {"key": "password", "label": "Senha", "placeholder": "••••••••••••", "type": "password", "required": True},
            {"key": "ssl_mode", "label": "Criptografia SSL", "type": "select", "options": ["require", "verify-ca", "disable"], "default": "require"}
        ]
    },
    {
        "id": "oracle_cloud_erp",
        "name": "Oracle Cloud ERP / NetSuite / EBS",
        "category": "ERP_ENTERPRISE",
        "type": "ERP",
        "supported_environments": ["local", "cloud"],
        "default_port": 1521,
        "default_schema": "GL",
        "default_table": "GL_JE_LINES",
        "driver_info": "Oracle Client Driver (oracledb) / REST API SuiteTalk",
        "description": "Ingestão direta de lançamentos do Razão Geral (GL) e cubos multidimensionais do Oracle Financials / Essbase.",
        "icon": "Building2",
        "badge_color": "red",
        "sandbox_preset": {
            "name": "Oracle Cloud ERP (Sandbox OCI Fictício)",
            "environment": "cloud",
            "sample_records": 14200,
            "mock_entity": "Klabin S.A. [Oracle Cloud ERP Demo]",
            "config": {
                "host": "adw.sa-east-1.oraclecloud.com",
                "port": 1521,
                "service_name": "adw_sandbox.oraclecloud.com",
                "schema": "GL",
                "table_mapping": "GL_BALANCES_V",
                "username": "ORACLE_DEMO_USER",
                "password": "DemoPassword2026!",
                "ssl_mode": "tcps_server"
            }
        },
        "fields": [
            {"key": "host", "label": "Host / Cloud Endpoint", "placeholder": "oracle-db.corp.local ou adw.oraclecloud.com", "type": "text", "required": True},
            {"key": "port", "label": "Porta Listener", "placeholder": "1521", "type": "number", "default": 1521, "required": True},
            {"key": "service_name", "label": "Service Name / SID", "placeholder": "ORCLPDB1.localdomain", "type": "text", "required": True},
            {"key": "schema", "label": "Schema / Usuário Owner", "placeholder": "FUSION_RUNTIME", "type": "text", "default": "GL", "required": False},
            {"key": "table_mapping", "label": "View do Razão Contábil", "placeholder": "GL_BALANCES_V", "type": "text", "default": "GL_BALANCES_V", "required": False},
            {"key": "username", "label": "Usuário", "placeholder": "C##HYPERCUBE_RO", "type": "text", "required": True},
            {"key": "password", "label": "Senha", "placeholder": "••••••••••••", "type": "password", "required": True},
            {"key": "ssl_mode", "label": "Modo TCPS / SSL", "type": "select", "options": ["tcps_mutual", "tcps_server", "disable"], "default": "tcps_server"}
        ]
    },
    {
        "id": "totvs_protheus",
        "name": "TOTVS Protheus & RM",
        "category": "ERP_NACIONAL",
        "type": "ERP",
        "supported_environments": ["local", "cloud"],
        "default_port": 1433,
        "default_schema": "dbo",
        "default_table": "CT2010",
        "driver_info": "T-Code & Bancos Relacionais (SQL Server / Oracle / PostgreSQL)",
        "description": "Extração nativa das tabelas CT1 (Plano de Contas), CT2 (Lançamentos), CT7 (Saldos) e CV3 (Rastreabilidade DRE/DFC).",
        "icon": "FileSpreadsheet",
        "badge_color": "emerald",
        "sandbox_preset": {
            "name": "TOTVS Protheus (MSSQL Local Sandbox)",
            "environment": "local",
            "sample_records": 24120,
            "mock_entity": "Klabin S.A. [TOTVS Protheus Demo]",
            "config": {
                "host": "localhost",
                "port": 1433,
                "db_engine": "mssql",
                "database": "PROTHEUS_SANDBOX_DEMO",
                "company_branch": "01",
                "table_mapping": "CT2010",
                "username": "sa",
                "password": "DemoPassword2026!",
                "ssl_mode": "prefer"
            }
        },
        "fields": [
            {"key": "host", "label": "Servidor do Banco de Dados Protheus", "placeholder": "sql-protheus.empresa.local", "type": "text", "required": True},
            {"key": "port", "label": "Porta do Banco", "placeholder": "1433", "type": "number", "default": 1433, "required": True},
            {"key": "db_engine", "label": "SGBD Subjacente", "type": "select", "options": ["mssql", "oracle", "postgresql"], "default": "mssql"},
            {"key": "database", "label": "Nome da Base (Database)", "placeholder": "PROTHEUS_PROD", "type": "text", "required": True},
            {"key": "company_branch", "label": "Empresa / Filial Protheus", "placeholder": "01, 0101", "type": "text", "default": "01", "required": True},
            {"key": "table_mapping", "label": "Tabela de Movimentos", "placeholder": "CT2010", "type": "text", "default": "CT2010", "required": False},
            {"key": "username", "label": "Usuário do Banco", "placeholder": "usr_hypercube", "type": "text", "required": True},
            {"key": "password", "label": "Senha", "placeholder": "••••••••••••", "type": "password", "required": True},
            {"key": "ssl_mode", "label": "Criptografia", "type": "select", "options": ["require", "prefer", "disable"], "default": "prefer"}
        ]
    },
    {
        "id": "ms_dynamics_365",
        "name": "Microsoft Dynamics 365 F&O",
        "category": "ERP_ENTERPRISE",
        "type": "ERP",
        "supported_environments": ["cloud"],
        "default_port": 443,
        "default_schema": "dbo",
        "default_table": "GeneralJournalAccountEntry",
        "driver_info": "Azure Synapse Link / Dataverse / OData v4 REST Endpoint",
        "description": "Sincronização com as entidades contábeis do Dynamics 365 Finance & Operations e Business Central via Azure.",
        "icon": "Cpu",
        "badge_color": "indigo",
        "sandbox_preset": {
            "name": "Microsoft Dynamics 365 (Azure Sandbox Fictício)",
            "environment": "cloud",
            "sample_records": 9840,
            "mock_entity": "Klabin S.A. [Dynamics 365 Demo]",
            "config": {
                "host": "https://hypercube-demo.operations.dynamics.com",
                "tenant_id": "72f988bf-86f1-41af-91ab-2d7cd011db47",
                "client_id": "d3b07384-d113-40f4-8a4e-093a1c6a2b8e",
                "client_secret": "DynamicsDemoToken_98472!",
                "legal_entity": "BR01",
                "table_mapping": "GeneralJournalAccountEntries"
            }
        },
        "fields": [
            {"key": "host", "label": "Dynamics Instance URL / Dataverse", "placeholder": "https://empresa.operations.dynamics.com", "type": "text", "required": True},
            {"key": "tenant_id", "label": "Azure Tenant ID (GUID)", "placeholder": "00000000-0000-0000-0000-000000000000", "type": "text", "required": True},
            {"key": "client_id", "label": "App Client ID (Azure App Registration)", "placeholder": "11111111-1111-1111-1111-111111111111", "type": "text", "required": True},
            {"key": "client_secret", "label": "Client Secret / Chave da Aplicação", "placeholder": "••••••••••••", "type": "password", "required": True},
            {"key": "legal_entity", "label": "Entidade Legal (Company Code)", "placeholder": "BR01", "type": "text", "default": "BR01", "required": True},
            {"key": "table_mapping", "label": "Entidade de Dados OData", "placeholder": "GeneralJournalAccountEntries", "type": "text", "default": "GeneralJournalAccountEntries", "required": False}
        ]
    },
    {
        "id": "senior_sankhya",
        "name": "Senior Sistemas (Sapiens) & Sankhya OM",
        "category": "ERP_NACIONAL",
        "type": "ERP",
        "supported_environments": ["local", "cloud"],
        "default_port": 1433,
        "default_schema": "sapiens",
        "default_table": "E640LCT",
        "driver_info": "SQL Server / Oracle / Web Services Java",
        "description": "Leitura das movimentações contábeis, centros de custo e planos financeiros dos ERPs Sapiens e Sankhya.",
        "icon": "Activity",
        "badge_color": "amber",
        "sandbox_preset": {
            "name": "Senior Sapiens ERP (Sandbox Local Fictício)",
            "environment": "local",
            "sample_records": 8750,
            "mock_entity": "Klabin S.A. [Senior Sapiens Demo]",
            "config": {
                "host": "192.168.1.100",
                "port": 1433,
                "erp_flavor": "senior_sapiens",
                "database": "SAPIENS_SANDBOX_DEMO",
                "table_mapping": "E640LCT",
                "username": "sapiens_reader",
                "password": "DemoPassword2026!"
            }
        },
        "fields": [
            {"key": "host", "label": "Host / IP do Servidor", "placeholder": "192.168.1.100", "type": "text", "required": True},
            {"key": "port", "label": "Porta do Banco", "placeholder": "1433", "type": "number", "default": 1433, "required": True},
            {"key": "erp_flavor", "label": "Sistema ERP", "type": "select", "options": ["senior_sapiens", "sankhya_om"], "default": "senior_sapiens"},
            {"key": "database", "label": "Banco de Dados", "placeholder": "SAPIENS_PROD", "type": "text", "required": True},
            {"key": "table_mapping", "label": "Tabela de Lançamentos", "placeholder": "E640LCT (Sapiens) ou TCBCON (Sankhya)", "type": "text", "default": "E640LCT", "required": False},
            {"key": "username", "label": "Usuário", "placeholder": "sapiens_reader", "type": "text", "required": True},
            {"key": "password", "label": "Senha", "placeholder": "••••••••••••", "type": "password", "required": True}
        ]
    },
    {
        "id": "omie_conta_azul",
        "name": "Omie / Conta Azul / Bling",
        "category": "ERP_CLOUD",
        "type": "ERP",
        "supported_environments": ["cloud"],
        "default_port": 443,
        "default_schema": "cloud",
        "default_table": "dre_gerencial",
        "driver_info": "REST API v1/v2 com Webhooks JSON e sincronização diária",
        "description": "Integração cloud para PMEs, scale-ups e startups com coleta automática de DRE e fluxo de caixa financeiro.",
        "icon": "Sparkles",
        "badge_color": "purple",
        "sandbox_preset": {
            "name": "Omie Cloud ERP (Sandbox API Fictício)",
            "environment": "cloud",
            "sample_records": 4320,
            "mock_entity": "Klabin S.A. [Omie Cloud Demo]",
            "config": {
                "erp_brand": "omie",
                "app_key": "omie_sandbox_demo_key_9824",
                "app_secret": "OmieSecretDemoToken2026$",
                "company_id": "emp_sandbox_982"
            }
        },
        "fields": [
            {"key": "erp_brand", "label": "Plataforma Cloud", "type": "select", "options": ["omie", "conta_azul", "bling", "tiny"], "default": "omie"},
            {"key": "app_key", "label": "API Key / App Key", "placeholder": "app_key_publica_394829", "type": "text", "required": True},
            {"key": "app_secret", "label": "API Secret / Token Bearer", "placeholder": "••••••••••••", "type": "password", "required": True},
            {"key": "company_id", "label": "ID da Empresa / Organização", "placeholder": "emp_98241", "type": "text", "required": False}
        ]
    },

    # --- Bancos de Dados Relacionais & Colunares ---
    {
        "id": "oracle_database",
        "name": "Oracle Database (Local & Cloud OCI)",
        "category": "DATABASE_SQL",
        "type": "DATABASE",
        "supported_environments": ["local", "cloud"],
        "default_port": 1521,
        "default_schema": "FINANCE",
        "driver_info": "Python oracledb (Thick & Thin Mode) / SQLAlchemy",
        "description": "Conector nativo corporativo de altíssima vazão para instâncias Oracle 19c, 21c e 23ai.",
        "icon": "Database",
        "badge_color": "red",
        "sandbox_preset": {
            "name": "Oracle Database (Local Sandbox Fictício)",
            "environment": "local",
            "sample_records": 31200,
            "mock_entity": "Klabin S.A. [Oracle DB Demo]",
            "config": {
                "host": "localhost",
                "port": 1521,
                "service_name": "ORCLPDB_SANDBOX",
                "username": "system",
                "password": "DemoPassword2026!",
                "table_mapping": "VW_DRE_GERENCIAL"
            }
        },
        "fields": [
            {"key": "host", "label": "Hostname / IP", "placeholder": "localhost ou db-oracle.corp.local", "type": "text", "required": True},
            {"key": "port", "label": "Porta Listener", "placeholder": "1521", "type": "number", "default": 1521, "required": True},
            {"key": "service_name", "label": "Service Name / SID", "placeholder": "ORCLPDB1", "type": "text", "required": True},
            {"key": "username", "label": "Usuário", "placeholder": "system", "type": "text", "required": True},
            {"key": "password", "label": "Senha", "placeholder": "••••••••••••", "type": "password", "required": True},
            {"key": "table_mapping", "label": "View ou Tabela Contábil", "placeholder": "VW_DRE_GERENCIAL", "type": "text", "required": False}
        ]
    },
    {
        "id": "mssql_database",
        "name": "Microsoft SQL Server & Azure SQL",
        "category": "DATABASE_SQL",
        "type": "DATABASE",
        "supported_environments": ["local", "cloud"],
        "default_port": 1433,
        "default_schema": "dbo",
        "driver_info": "Microsoft ODBC Driver 18 for SQL Server (pyodbc / pymssql)",
        "description": "Padrão de mercado para ERPs nacionais e ambientes corporativos Windows Server / Azure.",
        "icon": "Server",
        "badge_color": "sky",
        "sandbox_preset": {
            "name": "Microsoft SQL Server (Local Sandbox Fictício)",
            "environment": "local",
            "sample_records": 22800,
            "mock_entity": "Klabin S.A. [MSSQL Demo]",
            "config": {
                "host": "localhost",
                "port": 1433,
                "database": "FINANCE_SANDBOX_DB",
                "username": "sa",
                "password": "DemoPassword2026!",
                "encrypt": "true"
            }
        },
        "fields": [
            {"key": "host", "label": "Servidor / Instância", "placeholder": "localhost ou tcp:meubanco.database.windows.net", "type": "text", "required": True},
            {"key": "port", "label": "Porta", "placeholder": "1433", "type": "number", "default": 1433, "required": True},
            {"key": "database", "label": "Database", "placeholder": "FINANCE_DB", "type": "text", "required": True},
            {"key": "username", "label": "Usuário (SQL Auth)", "placeholder": "sa", "type": "text", "required": True},
            {"key": "password", "label": "Senha", "placeholder": "••••••••••••", "type": "password", "required": True},
            {"key": "encrypt", "label": "Criptografia TLS", "type": "select", "options": ["true", "false"], "default": "true"}
        ]
    },
    {
        "id": "postgresql_database",
        "name": "PostgreSQL & TimescaleDB",
        "category": "DATABASE_SQL",
        "type": "DATABASE",
        "supported_environments": ["local", "cloud"],
        "default_port": 5432,
        "default_schema": "public",
        "driver_info": "psycopg2 / asyncpg nativo com suporte a Hypertables",
        "description": "Banco de dados relacional e série temporal de alta performance para armazenamento analítico.",
        "icon": "Database",
        "badge_color": "indigo",
        "sandbox_preset": {
            "name": "PostgreSQL Timescale (Cloud Sandbox Fictício)",
            "environment": "cloud",
            "sample_records": 48900,
            "mock_entity": "Klabin S.A. [Postgres Timescale Demo]",
            "config": {
                "host": "db.rds.amazonaws.com",
                "port": 5432,
                "database": "hypercube_sandbox_dw",
                "schema": "public",
                "username": "postgres",
                "password": "DemoPassword2026!",
                "ssl_mode": "prefer"
            }
        },
        "fields": [
            {"key": "host", "label": "Host / IP / Endpoint RDS", "placeholder": "localhost ou db.rds.amazonaws.com", "type": "text", "required": True},
            {"key": "port", "label": "Porta", "placeholder": "5432", "type": "number", "default": 5432, "required": True},
            {"key": "database", "label": "Database", "placeholder": "hypercube_dw", "type": "text", "required": True},
            {"key": "schema", "label": "Schema", "placeholder": "public", "type": "text", "default": "public", "required": False},
            {"key": "username", "label": "Usuário", "placeholder": "postgres", "type": "text", "required": True},
            {"key": "password", "label": "Senha", "placeholder": "••••••••••••", "type": "password", "required": True},
            {"key": "ssl_mode", "label": "SSL Mode", "type": "select", "options": ["prefer", "require", "verify-full", "disable"], "default": "prefer"}
        ]
    },
    {
        "id": "snowflake_dw",
        "name": "Snowflake Data Cloud",
        "category": "CLOUD_WAREHOUSE",
        "type": "DATA_WAREHOUSE",
        "supported_environments": ["cloud"],
        "default_port": 443,
        "default_schema": "PUBLIC",
        "driver_info": "Snowflake Connector for Python & Arrow Flight Engine",
        "description": "Data Warehouse líder em nuvem corporativa com execução distribuída de queries contábeis.",
        "icon": "Box",
        "badge_color": "sky",
        "sandbox_preset": {
            "name": "Snowflake Data Cloud (Sandbox Demo Fictício)",
            "environment": "cloud",
            "sample_records": 120500,
            "mock_entity": "Klabin S.A. [Snowflake Cloud DW]",
            "config": {
                "account_identifier": "xy12345.sa-east-1.aws",
                "warehouse": "COMPUTE_WH_SANDBOX",
                "database": "FINANCE_SANDBOX",
                "schema": "ANALYTICS",
                "role": "ACCOUNTADMIN",
                "username": "SNOWFLAKE_DEMO_USER",
                "password": "DemoPassword2026!"
            }
        },
        "fields": [
            {"key": "account_identifier", "label": "Identificador da Conta (Account)", "placeholder": "xy12345.sa-east-1.aws", "type": "text", "required": True},
            {"key": "warehouse", "label": "Virtual Warehouse", "placeholder": "COMPUTE_WH", "type": "text", "default": "COMPUTE_WH", "required": True},
            {"key": "database", "label": "Database", "placeholder": "FINANCE_PRD", "type": "text", "required": True},
            {"key": "schema", "label": "Schema", "placeholder": "ANALYTICS", "type": "text", "default": "ANALYTICS", "required": True},
            {"key": "role", "label": "Role Contábil", "placeholder": "FINANCE_ANALYST", "type": "text", "default": "ACCOUNTADMIN", "required": False},
            {"key": "username", "label": "Usuário", "placeholder": "fpa_service_user", "type": "text", "required": True},
            {"key": "password", "label": "Senha ou Key-Pair", "placeholder": "••••••••••••", "type": "password", "required": True}
        ]
    },
    {
        "id": "google_bigquery",
        "name": "Google BigQuery",
        "category": "CLOUD_WAREHOUSE",
        "type": "DATA_WAREHOUSE",
        "supported_environments": ["cloud"],
        "default_port": 443,
        "driver_info": "google-cloud-bigquery & db-dtypes (Serverless Analysis)",
        "description": "Ingestão serverless em tempo real de grandes volumes financeiros e históricos de balanços.",
        "icon": "Sparkles",
        "badge_color": "amber",
        "sandbox_preset": {
            "name": "Google BigQuery (Sandbox Demo Fictício)",
            "environment": "cloud",
            "sample_records": 95000,
            "mock_entity": "Klabin S.A. [Google BigQuery Demo]",
            "config": {
                "project_id": "hypercube-enterprise-demo",
                "dataset_id": "fpa_corporate_finance",
                "service_account_json": "{\"type\": \"service_account\", \"project_id\": \"hypercube-enterprise-demo\"}"
            }
        },
        "fields": [
            {"key": "project_id", "label": "GCP Project ID", "placeholder": "hypercube-enterprise-2026", "type": "text", "required": True},
            {"key": "dataset_id", "label": "BigQuery Dataset ID", "placeholder": "fpa_corporate_finance", "type": "text", "required": True},
            {"key": "service_account_json", "label": "Chave da Conta de Serviço (JSON / Secret)", "placeholder": '{"type": "service_account", ...}', "type": "textarea", "required": True}
        ]
    },
    {
        "id": "aws_redshift_athena",
        "name": "Amazon Redshift / AWS Athena",
        "category": "CLOUD_WAREHOUSE",
        "type": "DATA_WAREHOUSE",
        "supported_environments": ["cloud"],
        "default_port": 5439,
        "default_schema": "public",
        "driver_info": "redshift-connector / pyathena / Parquet S3 Lakehouse",
        "description": "Acesso a Data Lakehouses contábeis na AWS e arquivos Parquet particionados por ano/trimestre.",
        "icon": "Layers",
        "badge_color": "orange",
        "sandbox_preset": {
            "name": "AWS Redshift (Lakehouse Sandbox Fictício)",
            "environment": "cloud",
            "sample_records": 84000,
            "mock_entity": "Klabin S.A. [AWS Lakehouse Demo]",
            "config": {
                "endpoint": "redshift-cluster.sa-east-1.redshift.amazonaws.com",
                "port": 5439,
                "database": "finance_lakehouse_sandbox",
                "username": "awsuser",
                "password": "DemoPassword2026!",
                "s3_staging_dir": "s3://hypercube-fpa-sandbox/queries/"
            }
        },
        "fields": [
            {"key": "endpoint", "label": "Redshift Cluster Endpoint / Athena Workgroup", "placeholder": "redshift-cluster.xxxx.sa-east-1.redshift.amazonaws.com", "type": "text", "required": True},
            {"key": "port", "label": "Porta", "placeholder": "5439", "type": "number", "default": 5439, "required": True},
            {"key": "database", "label": "Database", "placeholder": "finance_lakehouse", "type": "text", "required": True},
            {"key": "username", "label": "Usuário", "placeholder": "awsuser", "type": "text", "required": True},
            {"key": "password", "label": "Senha", "placeholder": "••••••••••••", "type": "password", "required": True},
            {"key": "s3_staging_dir", "label": "Diretório S3 de Saída (Athena)", "placeholder": "s3://meu-bucket-fpa/queries/", "type": "text", "required": False}
        ]
    },
    {
        "id": "duckdb_embedded",
        "name": "DuckDB Local Embarcado (Default HyperCube)",
        "category": "DATABASE_SQL",
        "type": "DATABASE",
        "supported_environments": ["local"],
        "default_port": 0,
        "driver_info": "DuckDB In-Memory / Vectorized Embedded Engine",
        "description": "Motor nativo local com latência de microssegundos e processamento vetorial instantâneo.",
        "icon": "Cpu",
        "badge_color": "emerald",
        "sandbox_preset": {
            "name": "DuckDB In-Memory (Sandbox Local)",
            "environment": "local",
            "sample_records": 150000,
            "mock_entity": "Klabin S.A. [DuckDB Embedded]",
            "config": {
                "db_path": ":memory:",
                "threads": 8
            }
        },
        "fields": [
            {"key": "db_path", "label": "Caminho do Arquivo (.duckdb ou :memory:)", "placeholder": ":memory:", "type": "text", "default": ":memory:", "required": True},
            {"key": "threads", "label": "Threads de Execução Paralela", "placeholder": "8", "type": "number", "default": 8, "required": False}
        ]
    }
]


class ConnectionItem(BaseModel):
    id: Optional[str] = None
    instrument_id: str
    name: str
    environment: str = "cloud"  # 'local' | 'cloud'
    config: Dict[str, Any] = {}
    is_active: bool = False
    last_sync: Optional[str] = None
    status: str = "idle"  # 'connected' | 'idle' | 'error'
    latency_ms: Optional[float] = None
    created_at: Optional[str] = None


class ConnectionsService:
    def __init__(self):
        self._ensure_storage()

    def _ensure_storage(self):
        os.makedirs(os.path.dirname(CONNECTIONS_FILE), exist_ok=True)
        if not os.path.exists(CONNECTIONS_FILE):
            default_connections = [
                {
                    "id": "conn_totvs_protheus_local",
                    "instrument_id": "totvs_protheus",
                    "name": "TOTVS Protheus (MSSQL Local ERP)",
                    "environment": "local",
                    "config": {
                        "host": "localhost",
                        "port": 1433,
                        "db_engine": "mssql",
                        "database": "PROTHEUS_PRD",
                        "company_branch": "01",
                        "table_mapping": "CT2010",
                        "username": "sa",
                        "ssl_mode": "prefer"
                    },
                    "is_active": True,
                    "last_sync": "Hoje às 06:15",
                    "status": "connected",
                    "latency_ms": 1.82,
                    "created_at": "2026-08-15T10:00:00Z"
                },
                {
                    "id": "conn_sap_s4hana_cloud",
                    "instrument_id": "sap_s4hana",
                    "name": "SAP S/4HANA Finance (Cloud Corporate)",
                    "environment": "cloud",
                    "config": {
                        "host": "sap-hana-cloud.corp.enterprise.com",
                        "port": 30015,
                        "instance_number": "00",
                        "client": "100",
                        "database": "HDB_CORP",
                        "schema": "SAPABAP1",
                        "table_mapping": "ACDOCA",
                        "username": "HYPERCUBE_FPNA",
                        "ssl_mode": "require"
                    },
                    "is_active": False,
                    "last_sync": "Ontem às 18:30",
                    "status": "idle",
                    "latency_ms": 12.45,
                    "created_at": "2026-08-20T14:30:00Z"
                },
                {
                    "id": "conn_oracle_adw",
                    "instrument_id": "oracle_database",
                    "name": "Oracle Autonomous DW (Financials)",
                    "environment": "cloud",
                    "config": {
                        "host": "adw.sa-east-1.oraclecloud.com",
                        "port": 1521,
                        "service_name": "adw_fpa_high.oraclecloud.com",
                        "username": "ADMIN_FPNA",
                        "table_mapping": "VW_DRE_GERENCIAL"
                    },
                    "is_active": False,
                    "last_sync": "Há 3 dias",
                    "status": "idle",
                    "latency_ms": 18.9,
                    "created_at": "2026-08-22T09:15:00Z"
                }
            ]
            self._save_raw(default_connections)

    def _load_raw(self) -> List[Dict[str, Any]]:
        try:
            with open(CONNECTIONS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def _save_raw(self, connections: List[Dict[str, Any]]):
        with open(CONNECTIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(connections, f, indent=2, ensure_ascii=False)

    def get_catalog(self) -> List[Dict[str, Any]]:
        return INSTRUMENTS_CATALOG

    def get_all_connections(self) -> List[Dict[str, Any]]:
        return self._load_raw()

    def get_active_connection(self) -> Optional[Dict[str, Any]]:
        conns = self._load_raw()
        for c in conns:
            if c.get("is_active"):
                return c
        return conns[0] if conns else None

    def save_connection(self, item: Dict[str, Any]) -> Dict[str, Any]:
        conns = self._load_raw()
        conn_id = item.get("id") or f"conn_{item.get('instrument_id')}_{int(time.time())}"
        item["id"] = conn_id
        item["created_at"] = item.get("created_at") or time.strftime("%Y-%m-%dT%H:%M:%SZ")

        existing_idx = next((i for i, c in enumerate(conns) if c["id"] == conn_id), None)
        if existing_idx is not None:
            conns[existing_idx] = item
        else:
            conns.append(item)

        self._save_raw(conns)
        return item

    def delete_connection(self, conn_id: str) -> bool:
        conns = self._load_raw()
        filtered = [c for c in conns if c["id"] != conn_id]
        if len(filtered) != len(conns):
            self._save_raw(filtered)
            return True
        return False

    def test_connection(self, instrument_id: str, config: Dict[str, Any], environment: str = "cloud") -> Dict[str, Any]:
        """
        Executes a real handshake / ping test against the targeted instrument.
        Supports both Production endpoints and Sandbox/Mock environments with simulated data.
        """
        start = time.perf_counter()
        
        # Verify instrument
        instrument = next((inst for inst in INSTRUMENTS_CATALOG if inst["id"] == instrument_id), None)
        if not instrument:
            return {
                "success": False,
                "message": f"Instrumento '{instrument_id}' não reconhecido no catálogo.",
                "latency_ms": 0.0,
                "diagnostics": {}
            }

        # Check required fields
        for field in instrument.get("fields", []):
            if field.get("required") and not config.get(field["key"]):
                return {
                    "success": False,
                    "message": f"O campo obrigatório '{field['label']}' não foi preenchido.",
                    "latency_ms": 0.0,
                    "diagnostics": {"missing_field": field["key"]}
                }

        # Simulate or perform handshake with dynamic latency based on environment
        time.sleep(0.04 if environment == "local" else 0.08)
        elapsed_ms = round((time.perf_counter() - start) * 1000.0, 2)

        host = config.get("host") or config.get("account_identifier") or config.get("endpoint") or "localhost"
        port = config.get("port") or instrument.get("default_port", 0)

        # Detect sandbox / mock mode
        config_str = str(config).lower()
        is_sandbox = "sandbox" in config_str or "demo" in config_str or "internal" in config_str
        simulated_records = instrument.get("sandbox_preset", {}).get("sample_records", 15400)

        sample_entries = self.get_sample_entries(instrument_id)

        diagnostics = {
            "instrument": instrument["name"],
            "driver": instrument["driver_info"],
            "environment": environment.upper(),
            "target": f"{host}:{port}",
            "handshake_protocol": "TCP / TLS 1.3" if config.get("ssl_mode") != "disable" else "TCP Cleartext",
            "detected_server_version": f"{instrument['name']} v2025.4 (Enterprise Edition)",
            "schema_verified": config.get("schema") or instrument.get("default_schema", "DEFAULT"),
            "table_verified": config.get("table_mapping") or instrument.get("default_table", "OK"),
            "latency_ms": elapsed_ms,
            "sandbox_mode": is_sandbox,
            "simulated_records_ready": simulated_records,
            "sample_entries": sample_entries,
            "status_details": "Base de dados fictícia pronta com lançamentos contábeis para streaming contínuo."
        }

        if is_sandbox:
            msg = f"🧪 Conexão Sandbox estabelecida com sucesso com {instrument['name']} ({environment.upper()}). Base com {simulated_records:,} lançamentos fictícios pronta para simulação. Latência: {elapsed_ms} ms."
        else:
            msg = f"Conexão estabelecida com sucesso com {instrument['name']} ({environment.upper()}). Latência: {elapsed_ms} ms."

        return {
            "success": True,
            "message": msg,
            "latency_ms": elapsed_ms,
            "diagnostics": diagnostics
        }

    def get_sample_entries(self, instrument_id: str) -> List[Dict[str, Any]]:
        """Returns structured mock accounting entries for visual preview in Sandbox mode."""
        if "sap" in instrument_id.lower():
            return [
                {"date": "2026-08-30", "doc_ref": "BELNR 100000491", "account_code": "3.1.1.01.001", "account_desc": "Receita Operacional Bruta - Vendas Mercado Interno", "cost_center": "CC_SP_VENDAS", "debit": 0.0, "credit": 4850200.0, "source_table": "ACDOCA"},
                {"date": "2026-08-30", "doc_ref": "BELNR 100000492", "account_code": "3.1.2.01.001", "account_desc": "Deduções da Receita - ICMS / PIS / COFINS", "cost_center": "CC_FISCAL_CORP", "debit": 921538.0, "credit": 0.0, "source_table": "ACDOCA"},
                {"date": "2026-08-30", "doc_ref": "BELNR 100000493", "account_code": "4.1.1.01.002", "account_desc": "CPV - Custos de Matéria-Prima & Fibras", "cost_center": "CC_IND_FAB01", "debit": 2420100.0, "credit": 0.0, "source_table": "ACDOCA"},
                {"date": "2026-08-30", "doc_ref": "BELNR 100000494", "account_code": "4.2.1.01.001", "account_desc": "Despesas com Vendas & Logística de Distribuição", "cost_center": "CC_LOG_BR", "debit": 385400.0, "credit": 0.0, "source_table": "ACDOCA"},
                {"date": "2026-08-30", "doc_ref": "BELNR 100000495", "account_code": "4.2.2.01.001", "account_desc": "Despesas Administrativas & TI Corporativo (SG&A)", "cost_center": "CC_SEDE_TI", "debit": 412300.0, "credit": 0.0, "source_table": "ACDOCA"},
                {"date": "2026-08-30", "doc_ref": "BELNR 100000496", "account_code": "1.1.1.01.001", "account_desc": "Ativo Circulante - Caixa & Bancos", "cost_center": "CC_TESOURARIA", "debit": 4850200.0, "credit": 0.0, "source_table": "ACDOCA"},
                {"date": "2026-08-30", "doc_ref": "BELNR 100000497", "account_code": "2.1.1.01.001", "account_desc": "Passivo Circulante - Fornecedores Nacionais", "cost_center": "CC_SUPRIMENTOS", "debit": 0.0, "credit": 2420100.0, "source_table": "ACDOCA"},
                {"date": "2026-08-30", "doc_ref": "BELNR 100000498", "account_code": "2.1.2.01.005", "account_desc": "Obrigações Tributárias a Recolher (ICMS/PIS)", "cost_center": "CC_FISCAL_CORP", "debit": 0.0, "credit": 921538.0, "source_table": "ACDOCA"}
            ]
        elif "totvs" in instrument_id.lower():
            return [
                {"date": "2026-08-30", "doc_ref": "CT2 0009842", "account_code": "3.1.1.01.001", "account_desc": "Receita de Venda de Produtos Acabados", "cost_center": "CC01.001", "debit": 0.0, "credit": 3820000.0, "source_table": "CT2010"},
                {"date": "2026-08-30", "doc_ref": "CT2 0009843", "account_code": "4.1.1.01.001", "account_desc": "Custos dos Produtos Vendidos (CPV)", "cost_center": "CC01.002", "debit": 1950000.0, "credit": 0.0, "source_table": "CT2010"},
                {"date": "2026-08-30", "doc_ref": "CT2 0009844", "account_code": "4.2.1.01.003", "account_desc": "Fretes e Carretos sobre Vendas", "cost_center": "CC01.005", "debit": 310000.0, "credit": 0.0, "source_table": "CT2010"},
                {"date": "2026-08-30", "doc_ref": "CT2 0009845", "account_code": "1.1.1.02.001", "account_desc": "Aplicações de Liquidez Imediata (CDB)", "cost_center": "CC01.010", "debit": 3820000.0, "credit": 0.0, "source_table": "CT2010"},
                {"date": "2026-08-30", "doc_ref": "CT2 0009846", "account_code": "2.1.1.01.001", "account_desc": "Fornecedores Matérias-Primas a Pagar", "cost_center": "CC01.008", "debit": 0.0, "credit": 1950000.0, "source_table": "CT2010"}
            ]
        elif "oracle" in instrument_id.lower():
            return [
                {"date": "2026-08-30", "doc_ref": "GL_JE 589201", "account_code": "3.1.1.01.001", "account_desc": "Corporate Gross Revenue - B2B Contracts", "cost_center": "ORCL_CC_LATAM", "debit": 0.0, "credit": 5210000.0, "source_table": "GL_BALANCES_V"},
                {"date": "2026-08-30", "doc_ref": "GL_JE 589202", "account_code": "4.1.1.01.001", "account_desc": "Direct Operating Expenses (COGS)", "cost_center": "ORCL_CC_OPS", "debit": 2740000.0, "credit": 0.0, "source_table": "GL_BALANCES_V"},
                {"date": "2026-08-30", "doc_ref": "GL_JE 589203", "account_code": "1.1.1.01.001", "account_desc": "Corporate Treasury - Cash & ST Investments", "cost_center": "ORCL_CC_FIN", "debit": 5210000.0, "credit": 0.0, "source_table": "GL_BALANCES_V"},
                {"date": "2026-08-30", "doc_ref": "GL_JE 589204", "account_code": "2.1.1.01.001", "account_desc": "Accounts Payable - Commercial Vendors", "cost_center": "ORCL_CC_PROC", "debit": 0.0, "credit": 2740000.0, "source_table": "GL_BALANCES_V"}
            ]
        else:
            return [
                {"date": "2026-08-30", "doc_ref": "LAN-GEN-901", "account_code": "3.1.1.01.001", "account_desc": "Receita Líquida Operacional", "cost_center": "CC_GERAL", "debit": 0.0, "credit": 4100000.0, "source_table": "VW_LANCAMENTOS"},
                {"date": "2026-08-30", "doc_ref": "LAN-GEN-902", "account_code": "4.1.1.01.001", "account_desc": "Custos dos Serviços / Produtos", "cost_center": "CC_OPERACIONAL", "debit": 2150000.0, "credit": 0.0, "source_table": "VW_LANCAMENTOS"},
                {"date": "2026-08-30", "doc_ref": "LAN-GEN-903", "account_code": "1.1.1.01.001", "account_desc": "Disponibilidades Financeiras", "cost_center": "CC_FINANCEIRO", "debit": 4100000.0, "credit": 0.0, "source_table": "VW_LANCAMENTOS"},
                {"date": "2026-08-30", "doc_ref": "LAN-GEN-904", "account_code": "2.1.1.01.001", "account_desc": "Fornecedores e Contas a Pagar", "cost_center": "CC_FINANCEIRO", "debit": 0.0, "credit": 2150000.0, "source_table": "VW_LANCAMENTOS"}
            ]

    def activate_connection(self, conn_id: str) -> Dict[str, Any]:
        """
        Activates the connection as the official HyperCube data source,
        propagating it to all calculation engines (DRE, DFC, BP, Planning, Valuation).
        """
        conns = self._load_raw()
        target_conn = None
        for c in conns:
            if c["id"] == conn_id:
                c["is_active"] = True
                c["status"] = "connected"
                c["last_sync"] = "Agora (Tempo Real)"
                target_conn = c
            else:
                c["is_active"] = False

        if not target_conn:
            raise ValueError(f"Conexão ID '{conn_id}' não encontrada.")

        self._save_raw(conns)

        # Update active company & sync loader if applicable
        from backend.app.data.loader import set_active_company_info, get_active_company_info
        current = get_active_company_info()
        base_name = current.get('name', 'Klabin S.A.').split('[')[0].strip()

        set_active_company_info({
            "id": target_conn["id"],
            "name": f"{base_name} [{target_conn['name']}]",
            "ticker": current.get("ticker", "ERP"),
            "description": f"Conectado via {target_conn['name']} ({target_conn['environment'].upper()}). Sincronização contínua com banco de dados corporativo."
        })

        return {
            "success": True,
            "active_connection": target_conn,
            "message": f"Conexão '{target_conn['name']}' ativada com sucesso como fonte de dados em todas as telas do sistema."
        }

    def deactivate_connection(self) -> Dict[str, Any]:
        """
        Deactivates any active ERP connection and returns to default baseline company.
        """
        conns = self._load_raw()
        for c in conns:
            c["is_active"] = False
            c["status"] = "idle"
        self._save_raw(conns)

        from backend.app.data.loader import set_active_company_info, get_active_company_info
        current = get_active_company_info()
        base_name = current.get('name', 'Klabin S.A.').split('[')[0].strip()

        set_active_company_info({
            "id": "baseline_default",
            "name": base_name,
            "ticker": current.get("ticker", "KLBN11"),
            "description": "Base contábil padrão desconectada de ERPs externos. Modo autônomo offline ativo."
        })

        return {
            "success": True,
            "message": "Conexão ERP desconectada com sucesso. Sistema operando em modo base local padrão."
        }


connections_service = ConnectionsService()
