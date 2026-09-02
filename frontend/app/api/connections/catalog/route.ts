import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const INSTRUMENTS_CATALOG = [
  {
    id: "sap_s4hana",
    name: "SAP S/4HANA & ECC",
    category: "ERP_ENTERPRISE",
    type: "ERP",
    supported_environments: ["local", "cloud"],
    default_port: 30015,
    default_schema: "SAPABAP1",
    default_table: "ACDOCA",
    driver_info: "SAP HANA In-Memory Driver (hdbcli) / NetWeaver RFC / OData v4",
    description: "Conexão de alta performance com a tabela unificada ACDOCA e plano de contas SKA1 do SAP Finance.",
    icon: "Layers",
    badge_color: "sky",
    sandbox_preset: {
      name: "SAP S/4HANA Finance (Sandbox Corporativo)",
      environment: "cloud",
      sample_records: 18450,
      mock_entity: "Braskem S.A. [SAP S/4HANA Sandbox]",
      config: {
        host: "sap-s4hana.sandbox.hypercube.internal",
        port: 30015,
        instance_number: "00",
        client: "100",
        database: "HDB_SANDBOX",
        schema: "SAPABAP1",
        table_mapping: "ACDOCA",
        username: "SAP_SANDBOX_USER",
        ssl_mode: "require"
      }
    },
    fields: [
      { key: "host", label: "Host / Servidor / Instância HANA", placeholder: "sap-hana.corp.internal", type: "text", required: true },
      { key: "port", label: "Porta Instância", type: "number", default: 30015, required: true },
      { key: "database", label: "Database / Tenant DB", placeholder: "HDB_PRD", type: "text", required: true },
      { key: "username", label: "Usuário Técnico / RFC", placeholder: "SAP_HYPERCUBE_USER", type: "text", required: true }
    ]
  },
  {
    id: "totvs_protheus",
    name: "TOTVS Protheus (ERP Nacional)",
    category: "ERP_NACIONAL",
    type: "ERP",
    supported_environments: ["local", "cloud"],
    default_port: 1433,
    default_schema: "dbo",
    default_table: "CT2010",
    driver_info: "MSSQL Native Client (pymssql/pyodbc) / DB2 / Oracle OCI",
    description: "Conexão direta com as tabelas de lançamentos contábeis (CT2010) e plano de contas (CT1010).",
    icon: "Building2",
    badge_color: "emerald",
    sandbox_preset: {
      name: "TOTVS Protheus (MSSQL Local ERP)",
      environment: "local",
      sample_records: 12890,
      mock_entity: "Braskem Petroquímica [Protheus ERP]",
      config: {
        host: "localhost",
        port: 1433,
        database: "PROTHEUS_PRD",
        company_branch: "01",
        table_mapping: "CT2010",
        username: "sa",
        ssl_mode: "prefer"
      }
    },
    fields: [
      { key: "host", label: "Servidor / IP", placeholder: "192.168.1.100 ou localhost", type: "text", default: "localhost", required: true },
      { key: "port", label: "Porta", type: "number", default: 1433, required: true },
      { key: "database", label: "Nome do Banco de Dados", placeholder: "PROTHEUS_PRD", type: "text", default: "PROTHEUS_PRD", required: true },
      { key: "username", label: "Usuário do Banco (sa / protheus)", placeholder: "sa", type: "text", default: "sa", required: true }
    ]
  },
  {
    id: "oracle_netsuite",
    name: "Oracle NetSuite ERP",
    category: "ERP_CLOUD",
    type: "ERP",
    supported_environments: ["cloud"],
    default_port: 443,
    driver_info: "SuiteTalk REST Web Services / SuiteQL Native Driver (OAuth 2.0 / TBA)",
    description: "Integração nativa via SuiteQL e SuiteAnalytics com plano de contas multidimensional (Subsidiary, Class, Dept).",
    icon: "Cloud",
    badge_color: "purple",
    sandbox_preset: {
      name: "Oracle NetSuite OneWorld (Cloud Multi-Entity)",
      environment: "cloud",
      sample_records: 9400,
      mock_entity: "Global Holding & Ventures [NetSuite OneWorld]",
      config: {
        account_id: "TSTDRV123456",
        consumer_key: "ns_mock_consumer_key_2026",
        token_id: "ns_mock_token_id_2026",
        base_currency: "BRL"
      }
    },
    fields: [
      { key: "account_id", label: "NetSuite Account ID (Realm)", placeholder: "1234567 ou TSTDRV123456", type: "text", required: true },
      { key: "consumer_key", label: "Consumer Key / Client ID", type: "text", required: true }
    ]
  },
  {
    id: "postgresql_db",
    name: "PostgreSQL Database",
    category: "DATABASE_SQL",
    type: "DATABASE",
    supported_environments: ["local", "cloud"],
    default_port: 5432,
    default_schema: "public",
    driver_info: "PostgreSQL Native Wire Protocol (psycopg2/asyncpg / Cloud SQL / RDS)",
    description: "Conexão SQL robusta com PostgreSQL compatível com AWS RDS, Supabase, Neon e instâncias on-premises.",
    icon: "Database",
    badge_color: "blue",
    sandbox_preset: {
      name: "PostgreSQL Analytics Warehouse (Local)",
      environment: "local",
      sample_records: 31200,
      mock_entity: "Fintech Core & Analytics [PostgreSQL]",
      config: {
        host: "localhost",
        port: 5432,
        database: "hypercube_dw",
        schema: "public",
        table_mapping: "fact_financial_transactions",
        username: "postgres",
        ssl_mode: "prefer"
      }
    },
    fields: [
      { key: "host", label: "Host / Endereço IP", placeholder: "localhost ou db.internal", type: "text", default: "localhost", required: true },
      { key: "port", label: "Porta", type: "number", default: 5432, required: true },
      { key: "database", label: "Nome do Banco de Dados", placeholder: "hypercube_dw", type: "text", required: true },
      { key: "username", label: "Usuário", placeholder: "postgres", type: "text", required: true }
    ]
  },
  {
    id: "snowflake_dw",
    name: "Snowflake Cloud Data Warehouse",
    category: "CLOUD_WAREHOUSE",
    type: "DATA_WAREHOUSE",
    supported_environments: ["cloud"],
    default_port: 443,
    driver_info: "Snowflake Native Connector (snowflake-connector-python) / Key Pair Auth",
    description: "Acesso de altíssima velocidade aos dados contábeis agregados no Snowflake para simulações What-If.",
    icon: "Sparkles",
    badge_color: "cyan",
    sandbox_preset: {
      name: "Snowflake Corporate DW (Production Finance)",
      environment: "cloud",
      sample_records: 125000,
      mock_entity: "Enterprise Holdings [Snowflake Cloud DW]",
      config: {
        account: "xy12345.sa-east-1.aws",
        warehouse: "COMPUTE_WH",
        database: "CORP_FINANCE",
        schema: "GL_REPORTING",
        role: "FINANCE_ANALYST",
        username: "HYPERCUBE_FPNA"
      }
    },
    fields: [
      { key: "account", label: "Identificador de Conta Snowflake", placeholder: "xy12345.sa-east-1.aws", type: "text", required: true },
      { key: "warehouse", label: "Warehouse de Execução", placeholder: "COMPUTE_WH", type: "text", default: "COMPUTE_WH", required: true },
      { key: "database", label: "Database", placeholder: "FINANCE_DB", type: "text", required: true },
      { key: "username", label: "Usuário", placeholder: "FPNA_USER", type: "text", required: true }
    ]
  }
];

export async function GET() {
  return NextResponse.json(INSTRUMENTS_CATALOG);
}
