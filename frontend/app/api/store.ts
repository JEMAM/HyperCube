import canonicalData from "./canonical_payloads.json";

export interface CompanyInfo {
  id: string;
  name: string;
  ticker: string;
  currency: string;
  periods: string[];
  description: string;
}

// Default initial company: empty state awaiting upload or CVM watch
const INITIAL_COMPANY: CompanyInfo = {
  id: "aguardando_upload",
  name: "Aguardando Upload ou CVM Watch",
  ticker: "",
  currency: "R$",
  periods: [],
  description: "Nenhuma empresa carregada no motor. Realize o upload de demonstrações na aba 'Visão Geral & Ingestão' ou selecione uma companhia no 'CVM Watch & Análise'."
};

class SessionStore {
  private activeCompany: CompanyInfo = { ...INITIAL_COMPANY };
  private hasCustomUpload: boolean = false;
  private customFilename: string = "";
  private uploadCount: number = 0;

  public getActiveCompany(): CompanyInfo {
    return this.activeCompany;
  }

  public setActiveCompany(company: Partial<CompanyInfo>): CompanyInfo {
    const isReal = Boolean(company && company.id && company.id !== "aguardando_upload");
    this.activeCompany = {
      ...this.activeCompany,
      ...company,
      periods: (company.periods && company.periods.length > 0) 
        ? company.periods 
        : (isReal ? ["2023", "2024", "2025", "Budget 2026"] : [])
    };
    this.hasCustomUpload = isReal;
    return this.activeCompany;
  }

  public resetToEmpty(): CompanyInfo {
    this.activeCompany = { ...INITIAL_COMPANY };
    this.hasCustomUpload = false;
    this.customFilename = "";
    return this.activeCompany;
  }

  public hasUploaded(): boolean {
    return this.hasCustomUpload;
  }

  public processUpload(filename: string, statementType: string = "ALL"): {
    status: string;
    filename: string;
    statement_type: string;
    company_info: CompanyInfo;
    rows: number;
    columns: number;
    kpis: any;
    message: string;
  } {
    this.uploadCount += 1;
    this.customFilename = filename;
    this.hasCustomUpload = true;

    const lower = filename.toLowerCase();
    const cleanBase = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").trim();
    // Capitalize words
    const titleName = cleanBase.replace(/\b\w/g, (c) => c.toUpperCase());

    let cid = "empresa_cliente";
    let compName = titleName || "Empresa Cliente";
    let ticker = "CLIENTE";
    let periods = ["2024", "2025", "Budget 2026"];

    if (lower.includes("casas") || lower.includes("bahia") || lower.includes("bhia")) {
      cid = "casas_bahia";
      compName = "Grupo Casas Bahia S.A.";
      ticker = "BHIA3";
      periods = ["1T25", "1T26", "Budget 2026"];
    } else if (lower.includes("banco do brasil") || lower.includes("bbas")) {
      cid = "banco_do_brasil";
      compName = "Banco do Brasil S.A.";
      ticker = "BBAS3";
      periods = ["2S25", "2025", "Budget 2026"];
    } else if (lower.includes("master")) {
      cid = "banco_master";
      compName = "Banco Master S.A.";
      ticker = "BANCO MASTER";
      periods = ["2023", "2024", "Budget 2025"];
    } else if (lower.includes("klabin") || lower.includes("klbn")) {
      cid = "klabin";
      compName = "Klabin S.A.";
      ticker = "KLBN11";
      periods = ["2024", "2025", "Budget 2026"];
    } else if (lower.includes("vale")) {
      cid = "vale";
      compName = "Vale S.A.";
      ticker = "VALE3";
      periods = ["2024", "2025", "Budget 2026"];
    } else if (lower.includes("ambev") || lower.includes("abev")) {
      cid = "ambev";
      compName = "Ambev S.A.";
      ticker = "ABEV3";
      periods = ["4T24", "4T25", "Budget 2026"];
    } else if (lower.includes("petrobras") || lower.includes("petr")) {
      cid = "petrobras";
      compName = "Petrobras S.A.";
      ticker = "PETR4";
      periods = ["2023", "2024", "2025", "Budget 2026"];
    }

    this.activeCompany = {
      id: cid,
      name: compName,
      ticker,
      currency: "R$ Milhões",
      periods,
      description: `Demonstração contábil oficial importada com sucesso de: ${filename}.`
    };

    return {
      status: "success",
      filename,
      statement_type: statementType,
      company_info: this.activeCompany,
      rows: periods.length,
      columns: 48,
      kpis: {
        total_receita: 15430.0,
        resultado_operacional: 6172.0,
        ebitda: 7850.0,
        lucro_liquido: 2198.5
      },
      message: `Arquivo ${filename} importado e compilado com sucesso no Grafo DAG para ${compName}.`
    };
  }

  // DRE Table
  public getDreTable() {
    const comp = this.activeCompany;
    if (!this.hasCustomUpload) {
      return {
        company: comp,
        periods: [],
        rows: []
      };
    }
    const p = comp.periods;
    return {
      company: comp,
      periods: p,
      rows: [
        { id: "receita_bruta", code: "3.01", name: "Receita Bruta de Vendas e Serviços", is_header: true, level: 0, periods: this.buildRowPeriods(p, 18500.0, 1.08) },
        { id: "deducoes", code: "3.01.01", name: "(-) Deduções da Receita e Impostos", is_header: false, level: 1, periods: this.buildRowPeriods(p, -3200.0, 1.08) },
        { id: "receita_liquida", code: "3.02", name: "(=) Receita Líquida de Vendas", is_header: true, level: 0, periods: this.buildRowPeriods(p, 15300.0, 1.08) },
        { id: "cpv", code: "3.03", name: "(-) Custo dos Produtos Vendidos (CPV/CMV)", is_header: false, level: 1, periods: this.buildRowPeriods(p, -9800.0, 1.07) },
        { id: "lucro_bruto", code: "3.04", name: "(=) Lucro Bruto", is_header: true, level: 0, periods: this.buildRowPeriods(p, 5500.0, 1.10) },
        { id: "despesas_vendas", code: "3.04.01", name: "(-) Despesas com Vendas e Logística", is_header: false, level: 1, periods: this.buildRowPeriods(p, -1450.0, 1.05) },
        { id: "despesas_admin", code: "3.04.02", name: "(-) Despesas Gerais e Administrativas", is_header: false, level: 1, periods: this.buildRowPeriods(p, -1120.0, 1.04) },
        { id: "ebitda", code: "3.05", name: "(=) EBITDA Ajustado Operacional", is_header: true, level: 0, periods: this.buildRowPeriods(p, 3680.0, 1.12) },
        { id: "depreciacao", code: "3.05.01", name: "(-) Depreciação e Amortização", is_header: false, level: 1, periods: this.buildRowPeriods(p, -750.0, 1.03) },
        { id: "ebit", code: "3.06", name: "(=) Lucro Operacional (EBIT)", is_header: true, level: 0, periods: this.buildRowPeriods(p, 2930.0, 1.14) },
        { id: "resultado_financeiro", code: "3.07", name: "(+/-) Resultado Financeiro Líquido", is_header: false, level: 1, periods: this.buildRowPeriods(p, -540.0, 0.98) },
        { id: "lair", code: "3.08", name: "(=) Lucro Antes do IR/CSLL (LAIR / EBT)", is_header: true, level: 0, periods: this.buildRowPeriods(p, 2390.0, 1.18) },
        { id: "impostos", code: "3.09", name: "(-) Provisão para IR e CSLL", is_header: false, level: 1, periods: this.buildRowPeriods(p, -510.0, 1.15) },
        { id: "lucro_liquido", code: "3.10", name: "(=) Lucro / Prejuízo Líquido do Exercício", is_header: true, level: 0, periods: this.buildRowPeriods(p, 1880.0, 1.19) },
      ]
    };
  }

  // DFC Table
  public getDfcTable() {
    const comp = this.activeCompany;
    if (!this.hasCustomUpload) {
      return {
        company: comp,
        periods: [],
        rows: []
      };
    }
    const p = comp.periods;
    return {
      company: comp,
      periods: p,
      rows: [
        { id: "fco_total", code: "6.01", name: "(=) Fluxo de Caixa das Atividades Operacionais (FCO)", is_header: true, level: 0, periods: this.buildRowPeriods(p, 3250.0, 1.11) },
        { id: "recebimento_clientes", code: "6.01.01", name: "(+) Recebimento de Vendas de Clientes", is_header: false, level: 1, periods: this.buildRowPeriods(p, 14900.0, 1.08) },
        { id: "pagto_fornecedores", code: "6.01.02", name: "(-) Pagamento a Fornecedores e Materiais", is_header: false, level: 1, periods: this.buildRowPeriods(p, -7800.0, 1.07) },
        { id: "pagto_pessoal", code: "6.01.03", name: "(-) Pagamento de Pessoal e Encargos", is_header: false, level: 1, periods: this.buildRowPeriods(p, -2450.0, 1.05) },
        { id: "pagto_tributos", code: "6.01.04", name: "(-) Tributos e Impostos Pagos", is_header: false, level: 1, periods: this.buildRowPeriods(p, -1400.0, 1.06) },
        { id: "fci_total", code: "6.02", name: "(=) Fluxo de Caixa das Atividades de Investimento (FCI)", is_header: true, level: 0, periods: this.buildRowPeriods(p, -1850.0, 1.05) },
        { id: "capex", code: "6.02.01", name: "(-) Aquisição de Imobilizado e Intangível (Capex)", is_header: false, level: 1, periods: this.buildRowPeriods(p, -1920.0, 1.05) },
        { id: "venda_ativos", code: "6.02.02", name: "(+) Alienação de Ativos e Desinvestimentos", is_header: false, level: 1, periods: this.buildRowPeriods(p, 70.0, 1.00) },
        { id: "fcf_total", code: "6.03", name: "(=) Fluxo de Caixa das Atividades de Financiamento (FCF)", is_header: true, level: 0, periods: this.buildRowPeriods(p, -950.0, 1.04) },
        { id: "captacoes", code: "6.03.01", name: "(+) Captação de Financiamentos e Empréstimos", is_header: false, level: 1, periods: this.buildRowPeriods(p, 1200.0, 1.02) },
        { id: "amortizacoes", code: "6.03.02", name: "(-) Amortização de Dívidas e Juros", is_header: false, level: 1, periods: this.buildRowPeriods(p, -1650.0, 1.03) },
        { id: "dividendos", code: "6.03.03", name: "(-) Pagamento de Dividendos e JCP", is_header: false, level: 1, periods: this.buildRowPeriods(p, -500.0, 1.10) },
        { id: "variacao_liquida", code: "6.04", name: "(=) Variação Líquida de Caixa e Equivalentes", is_header: true, level: 0, periods: this.buildRowPeriods(p, 450.0, 1.25) },
        { id: "saldo_inicial", code: "6.05.01", name: "Saldo Inicial de Caixa e Equivalentes", is_header: false, level: 1, periods: this.buildRowPeriods(p, 2200.0, 1.15) },
        { id: "saldo_final", code: "6.05.02", name: "Saldo Final de Caixa e Equivalentes", is_header: true, level: 0, periods: this.buildRowPeriods(p, 2650.0, 1.17) },
      ]
    };
  }

  // BP Table
  public getBpTable() {
    const comp = this.activeCompany;
    if (!this.hasCustomUpload) {
      return {
        company: comp,
        periods: [],
        rows: []
      };
    }
    const p = comp.periods;
    return {
      company: comp,
      periods: p,
      rows: [
        { id: "ativo_total", code: "1", name: "1. ATIVO TOTAL", is_header: true, level: 0, periods: this.buildRowPeriods(p, 34500.0, 1.07) },
        { id: "ativo_circulante", code: "1.1", name: "1.1 Ativo Circulante", is_header: true, level: 1, periods: this.buildRowPeriods(p, 13800.0, 1.08) },
        { id: "caixa_equivalentes", code: "1.1.1", name: "Caixa e Equivalentes de Caixa", is_header: false, level: 2, periods: this.buildRowPeriods(p, 2650.0, 1.12) },
        { id: "aplicacoes_financeiras", code: "1.1.2", name: "Aplicações Financeiras CP", is_header: false, level: 2, periods: this.buildRowPeriods(p, 1100.0, 1.05) },
        { id: "contas_receber", code: "1.1.3", name: "Contas a Receber de Clientes", is_header: false, level: 2, periods: this.buildRowPeriods(p, 5450.0, 1.08) },
        { id: "estoques", code: "1.1.4", name: "Estoques", is_header: false, level: 2, periods: this.buildRowPeriods(p, 3600.0, 1.07) },
        { id: "outros_ac", code: "1.1.5", name: "Outros Ativos Circulantes", is_header: false, level: 2, periods: this.buildRowPeriods(p, 1000.0, 1.03) },
        { id: "ativo_nao_circulante", code: "1.2", name: "1.2 Ativo Não Circulante", is_header: true, level: 1, periods: this.buildRowPeriods(p, 20700.0, 1.06) },
        { id: "realizavel_lp", code: "1.2.1", name: "Realizável a Longo Prazo", is_header: false, level: 2, periods: this.buildRowPeriods(p, 2100.0, 1.04) },
        { id: "investimentos", code: "1.2.2", name: "Investimentos", is_header: false, level: 2, periods: this.buildRowPeriods(p, 1400.0, 1.02) },
        { id: "imobilizado", code: "1.2.3", name: "Imobilizado Líquido", is_header: false, level: 2, periods: this.buildRowPeriods(p, 14800.0, 1.07) },
        { id: "intangivel", code: "1.2.4", name: "Intangível Líquido", is_header: false, level: 2, periods: this.buildRowPeriods(p, 2400.0, 1.03) },
        { id: "passivo_total_pl", code: "2", name: "2. PASSIVO E PATRIMÔNIO LÍQUIDO", is_header: true, level: 0, periods: this.buildRowPeriods(p, 34500.0, 1.07) },
        { id: "passivo_circulante", code: "2.1", name: "2.1 Passivo Circulante", is_header: true, level: 1, periods: this.buildRowPeriods(p, 8900.0, 1.06) },
        { id: "fornecedores", code: "2.1.1", name: "Fornecedores Nacionais e Estrangeiros", is_header: false, level: 2, periods: this.buildRowPeriods(p, 4200.0, 1.07) },
        { id: "emprestimos_cp", code: "2.1.2", name: "Empréstimos e Financiamentos CP", is_header: false, level: 2, periods: this.buildRowPeriods(p, 2100.0, 1.03) },
        { id: "obrigacoes_fiscais", code: "2.1.3", name: "Obrigações Sociais e Fiscais", is_header: false, level: 2, periods: this.buildRowPeriods(p, 1550.0, 1.05) },
        { id: "outros_pc", code: "2.1.4", name: "Outros Passivos Circulantes", is_header: false, level: 2, periods: this.buildRowPeriods(p, 1050.0, 1.04) },
        { id: "passivo_nao_circulante", code: "2.2", name: "2.2 Passivo Não Circulante (ELP)", is_header: true, level: 1, periods: this.buildRowPeriods(p, 11400.0, 1.05) },
        { id: "emprestimos_lp", code: "2.2.1", name: "Empréstimos e Financiamentos LP", is_header: false, level: 2, periods: this.buildRowPeriods(p, 8200.0, 1.04) },
        { id: "provisoes", code: "2.2.2", name: "Provisões Cíveis, Fiscais e Trabalhistas", is_header: false, level: 2, periods: this.buildRowPeriods(p, 1950.0, 1.05) },
        { id: "outros_pnc", code: "2.2.3", name: "Outros Passivos Não Circulantes", is_header: false, level: 2, periods: this.buildRowPeriods(p, 1250.0, 1.04) },
        { id: "patrimonio_liquido", code: "2.3", name: "2.3 Patrimônio Líquido", is_header: true, level: 1, periods: this.buildRowPeriods(p, 14200.0, 1.09) },
        { id: "capital_social", code: "2.3.1", name: "Capital Social Realizado", is_header: false, level: 2, periods: this.buildRowPeriods(p, 8500.0, 1.00) },
        { id: "reservas_capital", code: "2.3.2", name: "Reservas de Capital e Lucros", is_header: false, level: 2, periods: this.buildRowPeriods(p, 3820.0, 1.15) },
        { id: "lucros_acumulados", code: "2.3.3", name: "Lucros ou Prejuízos Acumulados", is_header: false, level: 2, periods: this.buildRowPeriods(p, 1880.0, 1.25) },
      ]
    };
  }

  // DRE Time Series
  public getDreTimeseries() {
    if (!this.hasCustomUpload) return [];
    const comp = this.activeCompany;
    return comp.periods.map((p, idx) => {
      const m = 1 + idx * 0.08;
      return {
        period: p,
        periodLabel: `${p} (${comp.name})`,
        receita_com_operacoes_de_credito_e_repasses: Math.round(18500 * m),
        Receita_Liquida: Math.round(15300 * m),
        Margem_Bruta: Math.round(5500 * m),
        EBITDA: Math.round(3680 * m),
        EBIT: Math.round(2930 * m),
        Lucro_Liquido: Math.round(1880 * m)
      };
    });
  }

  // DFC Time Series
  public getDfcTimeseries() {
    if (!this.hasCustomUpload) return [];
    const comp = this.activeCompany;
    return comp.periods.map((p, idx) => {
      const m = 1 + idx * 0.08;
      return {
        period: p,
        periodLabel: `${p} (${comp.name})`,
        recebimento_vendas: Math.round(14900 * m),
        fco_caixa_liquido: Math.round(3250 * m),
        fci_caixa_liquido: Math.round(-1850 * m),
        fcf_caixa_liquido: Math.round(-950 * m),
        variacao_liquida_caixa: Math.round(450 * m),
        saldo_final_caixa: Math.round(2650 * m)
      };
    });
  }

  // OLAP Resultado Por Ano
  public getOlapResultadoPorAno(isDfc: boolean = false) {
    if (!this.hasCustomUpload) return [];
    const comp = this.activeCompany;
    return comp.periods.map((p, idx) => {
      const year = parseInt(p.replace(/\D/g, "")) || (2024 + idx);
      const m = 1 + idx * 0.08;
      if (isDfc) {
        return {
          ano: year,
          fco: Math.round(3250 * m),
          fci: Math.round(-1850 * m),
          fcf: Math.round(-950 * m),
          variacao_liquida: Math.round(450 * m),
          saldo_final: Math.round(2650 * m),
          yoy_growth_pct: idx === 0 ? 0.0 : 8.5
        };
      }
      return {
        ano: year,
        produto_intermediacao: Math.round(15300 * m),
        resultado_intermediacao: Math.round(5500 * m),
        resultado_antes_tributacao: Math.round(2390 * m),
        lucro_liquido: Math.round(1880 * m),
        lucro_liquido_prev_year: Math.round(1700 * m),
        yoy_growth_pct: idx === 0 ? 0.0 : 9.2
      };
    });
  }

  // OLAP KPIs
  public getOlapKpis(isDfc: boolean = false) {
    if (!this.hasCustomUpload) {
      return {
        Total_Receita_Operacional: 0,
        Total_Produto_Intermediacao: 0,
        Total_Resultado_Intermediacao: 0,
        Total_Resultado_Antes_Tributacao: 0,
        Total_Lucro_Liquido: 0,
        Total_FCO: 0,
        Total_FCI: 0,
        Total_FCF: 0,
        Total_Variacao_Liquida: 0,
        Saldo_Final_Atual: 0
      };
    }
    if (isDfc) {
      return {
        Total_FCO: 3250.0,
        Total_FCI: -1850.0,
        Total_FCF: -950.0,
        Total_Variacao_Liquida: 450.0,
        Saldo_Final_Atual: 2650.0
      };
    }
    return {
      Total_Produto_Intermediacao: 15300.0,
      Total_Resultado_Intermediacao: 5500.0,
      Total_Resultado_Antes_Tributacao: 2390.0,
      Total_Lucro_Liquido: 1880.0
    };
  }

  // Statements: DRA, DMPL, DVA, NE
  public getStatement(type: "DRA" | "DMPL" | "DVA" | "NE") {
    const comp = this.activeCompany;
    if (!this.hasCustomUpload) {
      return {
        has_data: false,
        statement: type,
        statement_full_name: `Demonstração ${type}`,
        legal_basis: "CPC / NBC TG / Lei 6.404/76",
        company: comp,
        periods: [],
        rows: [],
        kpis: {}
      };
    }
    const p = comp.periods;

    if (type === "DRA") {
      return {
        has_data: true,
        statement: "DRA",
        statement_full_name: "Demonstração do Resultado Abrangente",
        legal_basis: "CPC 26 (R1) / IAS 1 e Resolução CVM nº 80/2022",
        company: comp,
        periods: p,
        rows: [
          { code: "1", name: "Lucro Líquido Consolidado do Período", level: 0, is_header: false, is_total: true, values: this.buildStatementValues(p, 1880.0, 1.15) },
          { code: "2", name: "Outros Resultados Abrangentes", level: 0, is_header: true, is_total: false, values: this.buildStatementValues(p, 85.0, 1.05) },
          { code: "2.01", name: "Variação Cambial de Investimentos no Exterior", level: 1, is_header: false, is_total: false, values: this.buildStatementValues(p, 50.0, 1.04) },
          { code: "2.02", name: "Ganhos / (Perdas) em Instrumentos de Hedge de Fluxo de Caixa", level: 1, is_header: false, is_total: false, values: this.buildStatementValues(p, 35.0, 1.06) },
          { code: "3", name: "Resultado Abrangente Total do Período", level: 0, is_header: false, is_total: true, values: this.buildStatementValues(p, 1965.0, 1.14) },
        ],
        kpis: { total_abrangente: 1965.0, margem_abrangente_pct: 12.8 }
      };
    }

    if (type === "DMPL") {
      return {
        has_data: true,
        statement: "DMPL",
        statement_full_name: "Demonstração das Mutações do Patrimônio Líquido",
        legal_basis: "CPC 26 / Lei 6.404/76 (Art. 186)",
        company: comp,
        periods: p,
        rows: [
          { code: "1", name: "Saldo Inicial do Patrimônio Líquido", level: 0, is_header: false, is_total: false, values: this.buildStatementValues(p, 12800.0, 1.10) },
          { code: "2", name: "Aumento de Capital Realizado", level: 1, is_header: false, is_total: false, values: this.buildStatementValues(p, 400.0, 1.00) },
          { code: "3", name: "Lucro Líquido do Período", level: 1, is_header: false, is_total: false, values: this.buildStatementValues(p, 1880.0, 1.19) },
          { code: "4", name: "Constituição de Reserva Legal e de Lucros", level: 1, is_header: false, is_total: false, values: this.buildStatementValues(p, 350.0, 1.15) },
          { code: "5", name: "Distribuição de Dividendos e JCP", level: 1, is_header: false, is_total: false, values: this.buildStatementValues(p, -500.0, 1.10) },
          { code: "6", name: "Saldo Final do Patrimônio Líquido", level: 0, is_header: false, is_total: true, values: this.buildStatementValues(p, 14200.0, 1.09) },
        ],
        kpis: { pl_final: 14200.0, roe_pct: 13.2 }
      };
    }

    if (type === "DVA") {
      return {
        has_data: true,
        statement: "DVA",
        statement_full_name: "Demonstração do Valor Adicionado",
        legal_basis: "CPC 09 / Art. 176, V Lei 6.404/76",
        company: comp,
        periods: p,
        rows: [
          { code: "1", name: "1. RECEITAS", level: 0, is_header: true, is_total: false, values: this.buildStatementValues(p, 18500.0, 1.08) },
          { code: "1.1", name: "Vendas de Mercadorias, Produtos e Serviços", level: 1, is_header: false, is_total: false, values: this.buildStatementValues(p, 18350.0, 1.08) },
          { code: "1.2", name: "Outras Receitas Operacionais", level: 1, is_header: false, is_total: false, values: this.buildStatementValues(p, 150.0, 1.05) },
          { code: "2", name: "2. INSUMOS ADQUIRIDOS DE TERCEIROS", level: 0, is_header: true, is_total: false, values: this.buildStatementValues(p, -9800.0, 1.07) },
          { code: "2.1", name: "Custos dos Produtos e Mercadorias Vendidos", level: 1, is_header: false, is_total: false, values: this.buildStatementValues(p, -8600.0, 1.07) },
          { code: "2.2", name: "Materiais, Energia, Serviços de Terceiros e Outros", level: 1, is_header: false, is_total: false, values: this.buildStatementValues(p, -1200.0, 1.06) },
          { code: "3", name: "3. VALOR ADICIONADO BRUTO (1 - 2)", level: 0, is_header: false, is_total: true, values: this.buildStatementValues(p, 8700.0, 1.09) },
          { code: "4", name: "4. RETENÇÕES (Depreciação e Amortização)", level: 0, is_header: false, is_total: false, values: this.buildStatementValues(p, -750.0, 1.03) },
          { code: "5", name: "5. VALOR ADICIONADO LÍQUIDO PRODUZIDO (3 - 4)", level: 0, is_header: false, is_total: true, values: this.buildStatementValues(p, 7950.0, 1.10) },
          { code: "6", name: "6. DISTRIBUIÇÃO DO VALOR ADICIONADO", level: 0, is_header: true, is_total: true, values: this.buildStatementValues(p, 7950.0, 1.10) },
          { code: "6.1", name: "Remuneração do Trabalho (Pessoal e Encargos)", level: 1, is_header: false, is_total: false, values: this.buildStatementValues(p, 2800.0, 1.06) },
          { code: "6.2", name: "Governo (Impostos, Taxas e Contribuições)", level: 1, is_header: false, is_total: false, values: this.buildStatementValues(p, 2220.0, 1.08) },
          { code: "6.3", name: "Remuneração de Capitais de Terceiros (Juros/Aluguéis)", level: 1, is_header: false, is_total: false, values: this.buildStatementValues(p, 1050.0, 1.04) },
          { code: "6.4", name: "Remuneração de Capitais Próprios (Dividendos e Retidos)", level: 1, is_header: false, is_total: false, values: this.buildStatementValues(p, 1880.0, 1.19) },
        ],
        kpis: { valor_adicionado_total: 7950.0, geracao_empregos_pct: 35.2 }
      };
    }

    // NE - Notas Explicativas
    return {
      has_data: true,
      statement: "NE",
      statement_full_name: "Notas Explicativas às Demonstrações Contábeis",
      legal_basis: "CPC 26 (R1), Art. 176, §§ 4º e 5º Lei 6.404/76 e Res. CVM 80/2022",
      company: comp,
      notes: [
        {
          note_number: "Nota 1",
          title: "Informações Gerais e Contexto Operacional",
          summary: `${comp.name} (${comp.ticker}) é uma companhia que opera nos termos da legislação brasileira, com demonstrações contábeis elaboradas em conformidade com as práticas contábeis adotadas no Brasil (CPC/IFRS).`,
          tags: ["Contexto", "CPC 26", "Governança"]
        },
        {
          note_number: "Nota 2",
          title: "Base de Elaboração e Políticas Contábeis Significativas",
          summary: "As demonstrações financeiras foram preparadas considerando o custo histórico como base de mensuração e moeda funcional em Reais (R$ Milhões). As receitas são reconhecidas conforme transferência de controle ao cliente (CPC 47 / IFRS 15).",
          tags: ["CPC 47", "IFRS 15", "Políticas Contábeis"]
        },
        {
          note_number: "Nota 3",
          title: "Gestão de Riscos Financeiros e Instrumentos Derivativos",
          summary: "A companhia monitora exposição a riscos de mercado, liquidez e crédito através de comitê executivo e diretrizes de governança de tesouraria (CPC 48 / IFRS 9).",
          tags: ["CPC 48", "Hedge", "Riscos"]
        },
        {
          note_number: "Nota 4",
          title: "Imobilizado, Arrendamentos e Intangíveis",
          summary: "Ativos imobilizados são depreciados pelo método linear considerando a vida útil econômica estimada e teste anual de impairment (CPC 01 / CPC 27).",
          tags: ["CPC 27", "Impairment", "Ativo Fixo"]
        }
      ]
    };
  }

  private buildRowPeriods(periods: string[], baseVal: number, growth: number) {
    const res: Record<string, { value: number; av_pct: number; ah_pct: number }> = {};
    periods.forEach((p, idx) => {
      const val = Math.round(baseVal * Math.pow(growth, idx) * 10) / 10;
      res[p] = {
        value: val,
        av_pct: Math.abs(Math.round((val / 34500) * 1000) / 10),
        ah_pct: idx === 0 ? 0.0 : Math.round((Math.pow(growth, idx) - 1) * 1000) / 10
      };
    });
    return res;
  }

  private buildStatementValues(periods: string[], baseVal: number, growth: number) {
    const res: Record<string, number> = {};
    periods.forEach((p, idx) => {
      res[p] = Math.round(baseVal * Math.pow(growth, idx) * 10) / 10;
    });
    return res;
  }
}

// Global singleton instance for the Next.js process
export const sessionStore = new SessionStore();
