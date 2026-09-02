import cvmCompaniesJson from "./cvm_companies.json";

export interface CVMCompany {
  cod_cvm: number;
  cnpj: string;
  denom_social: string;
  nome_pregao: string;
  categoria: string;
  situacao: string;
  setor: string;
  uf: string;
  codigo_cvm_str: string;
}

export interface CVMFiling {
  id: string;
  cod_cvm: number;
  tipo: string;
  dt_refer: string;
  dt_entrega: string;
  versao: number;
  url_documento: string;
  status: string;
}

export interface CVMAnalysisResponse {
  company: CVMCompany;
  kpis: {
    latest_period: string;
    receita_liquida: number;
    receita_growth_yoy: number;
    lucro_liquido: number;
    lucro_growth_yoy: number;
    margem_bruta: number;
    margem_ebit: number;
    margem_liquida: number;
    roe_estimado: number;
  };
  time_series: Array<{
    period: string;
    year: string;
    quarter: string;
    receita_liquida: number;
    custo_bens_servicos: number;
    lucro_bruto: number;
    resultado_ebit: number;
    lucro_liquido: number;
    margem_bruta: number;
    margem_ebit: number;
    margem_liquida: number;
    raw_accounts: Array<{
      cd_conta: string;
      ds_conta: string;
      vl_conta: number;
      conta_canonical: string;
    }>;
  }>;
  filings: CVMFiling[];
  periods: string[];
}

export const CVM_SECTORS: string[] = [
  "Agricultura (Açúcar, Álcool e Cana)",
  "Alimentos e Bebidas",
  "Arrendamento Mercantil",
  "Bancos",
  "Bolsas de Valores / Mercado de Capitais",
  "Brinquedos e Lazer",
  "Comunicação e Informática",
  "Comércio (Atacado e Varejo)",
  "Construção Civil e Imobiliário",
  "Crédito Imobiliário",
  "Educação",
  "Embalagens",
  "Energia Elétrica",
  "Extração Mineral",
  "Farmacêutico e Higiene",
  "Hospedagem e Turismo",
  "Intermediação Financeira",
  "Material de Transporte / Aeroespacial",
  "Metalurgia e Siderurgia",
  "Máquinas, Equipamentos, Veículos e Peças",
  "Papel e Celulose",
  "Petroquímicos e Borracha",
  "Petróleo e Gás",
  "Reflorestamento",
  "Saneamento, Água e Serviços Básicos",
  "Securitização de Recebíveis",
  "Seguradoras e Corretoras",
  "Sem Setor Principal",
  "Serviços Médicos e Hospitalares",
  "Serviços de Transporte e Logística",
  "Telecomunicações",
  "Têxtil e Vestuário"
];

const rawCompanies = cvmCompaniesJson as CVMCompany[];
const seenCodes = new Set<number>();
export const CVM_COMPANIES: CVMCompany[] = rawCompanies.filter(c => {
  if (!c || !c.cod_cvm || seenCodes.has(c.cod_cvm)) return false;
  seenCodes.add(c.cod_cvm);
  return true;
});

export function generateCvmAnalysis(cod_cvm: number): CVMAnalysisResponse {
  const company = CVM_COMPANIES.find(c => c.cod_cvm === cod_cvm) || {
    cod_cvm,
    cnpj: "00.000.000/0001-00",
    denom_social: `COMPANHIA ABERTA (CVM ${cod_cvm})`,
    nome_pregao: `CIA CVM ${cod_cvm}`,
    categoria: "Categoria A",
    situacao: "ATIVO",
    setor: "Energia Elétrica",
    uf: "SP",
    codigo_cvm_str: String(cod_cvm).padStart(6, "0")
  };

  const nameUpper = (company.denom_social + " " + company.nome_pregao).toUpperCase();

  // Base parameters according to company profile
  let baseRev = 5000.0;
  let grossMargin = 0.35;
  let ebitMargin = 0.18;
  let netMargin = 0.12;

  if (cod_cvm === 9512 || nameUpper.includes("PETROBRAS")) {
    baseRev = 125000.0;
    grossMargin = 0.52;
    ebitMargin = 0.44;
    netMargin = 0.28;
  } else if (cod_cvm === 4170 || nameUpper.includes("VALE S.A.")) {
    baseRev = 55000.0;
    grossMargin = 0.48;
    ebitMargin = 0.42;
    netMargin = 0.26;
  } else if (cod_cvm === 20796 || nameUpper.includes("DAYCOVAL")) {
    baseRev = 4850.0;
    grossMargin = 0.62;
    ebitMargin = 0.35;
    netMargin = 0.22;
  } else if (cod_cvm === 20958 || nameUpper.includes("ABC BRASIL")) {
    baseRev = 3900.0;
    grossMargin = 0.61;
    ebitMargin = 0.34;
    netMargin = 0.21;
  } else if (cod_cvm === 1023 || nameUpper.includes("BANCO DO BRASIL")) {
    baseRev = 38500.0;
    grossMargin = 0.64;
    ebitMargin = 0.36;
    netMargin = 0.22;
  } else if (cod_cvm === 19348 || nameUpper.includes("ITAU UNIBANCO")) {
    baseRev = 44800.0;
    grossMargin = 0.66;
    ebitMargin = 0.38;
    netMargin = 0.24;
  } else if (cod_cvm === 23264 || nameUpper.includes("AMBEV")) {
    baseRev = 21500.0;
    grossMargin = 0.50;
    ebitMargin = 0.32;
    netMargin = 0.19;
  } else if (cod_cvm === 5410 || nameUpper.includes("WEG")) {
    baseRev = 9200.0;
    grossMargin = 0.34;
    ebitMargin = 0.22;
    netMargin = 0.16;
  } else if (cod_cvm === 18325 || cod_cvm === 20087 || nameUpper.includes("EMBRAER")) {
    baseRev = 6800.0;
    grossMargin = 0.22;
    ebitMargin = 0.12;
    netMargin = 0.08;
  } else if (cod_cvm === 20982 || nameUpper.includes("EQUATORIAL")) {
    baseRev = 11400.0;
    grossMargin = 0.28;
    ebitMargin = 0.21;
    netMargin = 0.14;
  } else if (cod_cvm === 2437 || nameUpper.includes("ELETROBRAS")) {
    baseRev = 18600.0;
    grossMargin = 0.42;
    ebitMargin = 0.31;
    netMargin = 0.20;
  } else if (cod_cvm === 17329 || nameUpper.includes("ENGIE")) {
    baseRev = 4200.0;
    grossMargin = 0.55;
    ebitMargin = 0.46;
    netMargin = 0.30;
  } else if (cod_cvm === 18660 || nameUpper.includes("CPFL")) {
    baseRev = 10800.0;
    grossMargin = 0.32;
    ebitMargin = 0.24;
    netMargin = 0.15;
  } else if (cod_cvm === 21903 || nameUpper.includes("CASAS BAHIA")) {
    baseRev = 7600.0;
    grossMargin = 0.28;
    ebitMargin = 0.07;
    netMargin = 0.02;
  } else if (cod_cvm === 22470 || nameUpper.includes("MAGAZINE LUIZA")) {
    baseRev = 10500.0;
    grossMargin = 0.31;
    ebitMargin = 0.08;
    netMargin = 0.03;
  } else if (cod_cvm === 4820 || nameUpper.includes("BRASKEM")) {
    baseRev = 17500.0;
    grossMargin = 0.18;
    ebitMargin = 0.09;
    netMargin = 0.04;
  } else {
    // Unique deterministic baseline
    baseRev = 1500.0 + ((cod_cvm * 179) % 18500);
    grossMargin = 0.25 + ((cod_cvm % 30) / 100);
    ebitMargin = 0.10 + ((cod_cvm % 20) / 100);
    netMargin = ebitMargin * 0.65;
  }

  const isBanking = company.setor === "Bancos" || nameUpper.includes("BANCO") || nameUpper.includes("BANK") || [1023, 19348, 20796, 20958, 906, 24600, 20567].includes(cod_cvm);

  const quarters = [
    { period: "2023-03-31", year: "2023", quarter: "03/2023", tipo: "ITR", factor: 0.88 },
    { period: "2023-06-30", year: "2023", quarter: "06/2023", tipo: "ITR", factor: 0.90 },
    { period: "2023-09-30", year: "2023", quarter: "09/2023", tipo: "ITR", factor: 0.92 },
    { period: "2023-12-31", year: "2023", quarter: "12/2023", tipo: "DFP", factor: 0.95 },
    { period: "2024-03-31", year: "2024", quarter: "03/2024", tipo: "ITR", factor: 0.95 },
    { period: "2024-06-30", year: "2024", quarter: "06/2024", tipo: "ITR", factor: 0.97 },
    { period: "2024-09-30", year: "2024", quarter: "09/2024", tipo: "ITR", factor: 0.98 },
    { period: "2024-12-31", year: "2024", quarter: "12/2024", tipo: "DFP", factor: 1.00 },
    { period: "2025-03-31", year: "2025", quarter: "03/2025", tipo: "ITR", factor: 1.02 },
    { period: "2025-06-30", year: "2025", quarter: "06/2025", tipo: "ITR", factor: 1.04 },
    { period: "2025-09-30", year: "2025", quarter: "09/2025", tipo: "ITR", factor: 1.06 },
    { period: "2025-12-31", year: "2025", quarter: "12/2025", tipo: "DFP", factor: 1.08 },
    { period: "2026-03-31", year: "2026", quarter: "03/2026", tipo: "ITR", factor: 1.10 },
    { period: "2026-12-31", year: "2026", quarter: "Budget 2026", tipo: "PROJ", factor: 1.15 }
  ];

  const time_series = quarters.map((q) => {
    const rev = Math.round(baseRev * q.factor * 100) / 100;
    const cpv = Math.round(-rev * (1 - grossMargin) * 100) / 100;
    const gross = Math.round((rev + cpv) * 100) / 100;
    const opex = Math.round(-rev * (grossMargin - ebitMargin) * 100) / 100;
    const ebit = Math.round((gross + opex) * 100) / 100;
    const fin = Math.round(-ebit * 0.12 * 100) / 100;
    const lair = Math.round((ebit + fin) * 100) / 100;
    const tax = Math.round(-lair * 0.25 * 100) / 100;
    const net = Math.round((lair + tax) * 100) / 100;

    return {
      period: q.period,
      year: q.year,
      quarter: q.quarter,
      receita_liquida: rev,
      custo_bens_servicos: cpv,
      lucro_bruto: gross,
      resultado_ebit: ebit,
      lucro_liquido: net,
      margem_bruta: Math.round((gross / rev) * 1000) / 10,
      margem_ebit: Math.round((ebit / rev) * 1000) / 10,
      margem_liquida: Math.round((net / rev) * 1000) / 10,
      raw_accounts: isBanking ? [
        { cd_conta: "3.01", ds_conta: "Receitas da Intermediação Financeira", vl_conta: rev, conta_canonical: "receitas_intermediacao" },
        { cd_conta: "3.02", ds_conta: "(-) Despesas da Intermediação Financeira (Captações)", vl_conta: cpv, conta_canonical: "despesas_intermediacao" },
        { cd_conta: "3.03", ds_conta: "(=) Resultado Bruto da Intermediação Financeira", vl_conta: gross, conta_canonical: "resultado_bruto_intermediacao" },
        { cd_conta: "3.04", ds_conta: "Outras Receitas / (Despesas) Operacionais", vl_conta: opex, conta_canonical: "outras_despesas_operacionais" },
        { cd_conta: "3.04.01", ds_conta: "(-) Provisão para Perdas com Crédito (PCLD / PDD)", vl_conta: Math.round(opex * 0.45 * 100) / 100, conta_canonical: "provisao_credito_pdd" },
        { cd_conta: "3.04.02", ds_conta: "(+) Rendas de Prestação de Serviços e Tarifas Bancárias", vl_conta: Math.round(rev * 0.22 * 100) / 100, conta_canonical: "receita_servicos_tarifas" },
        { cd_conta: "3.04.03", ds_conta: "(-) Despesas de Pessoal e Administrativas", vl_conta: Math.round(opex * 0.40 * 100) / 100, conta_canonical: "despesas_pessoal_administrativas" },
        { cd_conta: "3.04.04", ds_conta: "(-/+) Outras Despesas e Receitas Operacionais", vl_conta: Math.round(opex * 0.15 * 100) / 100, conta_canonical: "outras_despesas_liquidas" },
        { cd_conta: "3.05", ds_conta: "(=) Resultado Operacional Bancário", vl_conta: ebit, conta_canonical: "resultado_operacional" },
        { cd_conta: "3.06", ds_conta: "(=) Resultado Antes da Tributação (LAIR / EBT)", vl_conta: lair, conta_canonical: "resultado_antes_tributos" },
        { cd_conta: "3.07", ds_conta: "(-) Imposto de Renda e Contribuição Social (CSLL)", vl_conta: tax, conta_canonical: "imposto_renda_contribuicao" },
        { cd_conta: "3.08", ds_conta: "(=) Lucro Líquido do Exercício", vl_conta: net, conta_canonical: "lucro_liquido" }
      ] : [
        { cd_conta: "3.01", ds_conta: "Receita Líquida de Vendas e/ou Serviços", vl_conta: rev, conta_canonical: "receita_liquida" },
        { cd_conta: "3.02", ds_conta: "Custo dos Bens e/ou Serviços Vendidos", vl_conta: cpv, conta_canonical: "custo_bens_servicos" },
        { cd_conta: "3.03", ds_conta: "Resultado Bruto", vl_conta: gross, conta_canonical: "lucro_bruto" },
        { cd_conta: "3.04", ds_conta: "Despesas/Receitas Operacionais", vl_conta: opex, conta_canonical: "despesas_operacionais" },
        { cd_conta: "3.04.01", ds_conta: "Despesas com Vendas", vl_conta: Math.round(opex * 0.6 * 100) / 100, conta_canonical: "despesas_vendas" },
        { cd_conta: "3.04.02", ds_conta: "Despesas Gerais e Administrativas", vl_conta: Math.round(opex * 0.4 * 100) / 100, conta_canonical: "despesas_gerais_adm" },
        { cd_conta: "3.05", ds_conta: "Resultado Antes do Resultado Financeiro e Tributos (EBIT)", vl_conta: ebit, conta_canonical: "resultado_ebit" },
        { cd_conta: "3.06", ds_conta: "Resultado Financeiro", vl_conta: fin, conta_canonical: "resultado_financeiro" },
        { cd_conta: "3.07", ds_conta: "Resultado Antes dos Tributos sobre o Lucro", vl_conta: lair, conta_canonical: "resultado_antes_tributos" },
        { cd_conta: "3.08", ds_conta: "Imposto de Renda e Contribuição Social", vl_conta: tax, conta_canonical: "imposto_renda_contribuicao" },
        { cd_conta: "3.11", ds_conta: "Lucro/Prejuízo Consolidado do Período", vl_conta: net, conta_canonical: "lucro_liquido" }
      ],
      dfc_raw_accounts: isBanking ? [
        { cd_conta: "6.01", ds_conta: "(=) Caixa Líquido das Atividades Operacionais (FCO)", vl_conta: Math.round(net * 1.55 * 100) / 100 },
        { cd_conta: "6.01.01", ds_conta: "Lucro Líquido Ajustado", vl_conta: net },
        { cd_conta: "6.01.02", ds_conta: "Variação em Títulos e Aplicações Interfinanceiras", vl_conta: Math.round(net * 0.75 * 100) / 100 },
        { cd_conta: "6.01.03", ds_conta: "Variação na Carteira de Operações de Crédito", vl_conta: Math.round(-net * 0.65 * 100) / 100 },
        { cd_conta: "6.01.04", ds_conta: "Variação em Depósitos e Captações no Mercado", vl_conta: Math.round(net * 0.45 * 100) / 100 },
        { cd_conta: "6.02", ds_conta: "(=) Caixa Líquido das Atividades de Investimento (FCI)", vl_conta: Math.round(-net * 0.35 * 100) / 100 },
        { cd_conta: "6.02.01", ds_conta: "(-) Aquisição de Imobilizado e Intangível (Capex TI/Sistemas)", vl_conta: Math.round(-net * 0.38 * 100) / 100 },
        { cd_conta: "6.02.02", ds_conta: "(+) Alienação de Ativos e Desinvestimentos", vl_conta: Math.round(net * 0.03 * 100) / 100 },
        { cd_conta: "6.03", ds_conta: "(=) Caixa Líquido das Atividades de Financiamento (FCF)", vl_conta: Math.round(-net * 0.25 * 100) / 100 },
        { cd_conta: "6.03.01", ds_conta: "(+) Captação de Letras Financeiras e Dívida Subordinada", vl_conta: Math.round(net * 0.35 * 100) / 100 },
        { cd_conta: "6.03.02", ds_conta: "(-) Pagamento de Juros sobre Capital Próprio (JCP) e Dividendos", vl_conta: Math.round(-net * 0.60 * 100) / 100 },
        { cd_conta: "6.04", ds_conta: "(=) Variação Líquida de Caixa e Disponibilidades", vl_conta: Math.round(net * 0.95 * 100) / 100 },
        { cd_conta: "6.05.01", ds_conta: "Saldo Inicial de Caixa e Disponibilidades", vl_conta: Math.round(baseRev * 0.8 * 100) / 100 },
        { cd_conta: "6.05.02", ds_conta: "Saldo Final de Caixa e Disponibilidades", vl_conta: Math.round((baseRev * 0.8 + net * 0.95) * 100) / 100 }
      ] : [
        { cd_conta: "6.01", ds_conta: "(=) Fluxo de Caixa das Atividades Operacionais (FCO)", vl_conta: Math.round(rev * 0.22 * 100) / 100 },
        { cd_conta: "6.01.01", ds_conta: "(+) Recebimento de Vendas de Clientes", vl_conta: Math.round(rev * 1.05 * 100) / 100 },
        { cd_conta: "6.01.02", ds_conta: "(-) Pagamento a Fornecedores e Materiais", vl_conta: Math.round(cpv * 0.85 * 100) / 100 },
        { cd_conta: "6.01.03", ds_conta: "(-) Pagamento de Pessoal e Encargos", vl_conta: Math.round(opex * 0.5 * 100) / 100 },
        { cd_conta: "6.01.04", ds_conta: "(-) Tributos e Impostos Pagos", vl_conta: Math.round(tax * 100) / 100 },
        { cd_conta: "6.02", ds_conta: "(=) Fluxo de Caixa das Atividades de Investimento (FCI)", vl_conta: Math.round(-rev * 0.12 * 100) / 100 },
        { cd_conta: "6.02.01", ds_conta: "(-) Aquisição de Imobilizado e Intangível (Capex)", vl_conta: Math.round(-rev * 0.13 * 100) / 100 },
        { cd_conta: "6.02.02", ds_conta: "(+) Alienação de Ativos e Desinvestimentos", vl_conta: Math.round(rev * 0.01 * 100) / 100 },
        { cd_conta: "6.03", ds_conta: "(=) Fluxo de Caixa das Atividades de Financiamento (FCF)", vl_conta: Math.round(-rev * 0.06 * 100) / 100 },
        { cd_conta: "6.03.01", ds_conta: "(+) Captação de Financiamentos e Empréstimos", vl_conta: Math.round(rev * 0.08 * 100) / 100 },
        { cd_conta: "6.03.02", ds_conta: "(-) Amortização de Dívidas e Juros", vl_conta: Math.round(-rev * 0.10 * 100) / 100 },
        { cd_conta: "6.03.03", ds_conta: "(-) Pagamento de Dividendos e JCP", vl_conta: Math.round(-net * 0.4 * 100) / 100 },
        { cd_conta: "6.04", ds_conta: "(=) Variação Líquida de Caixa e Equivalentes", vl_conta: Math.round(rev * 0.04 * 100) / 100 },
        { cd_conta: "6.05.01", ds_conta: "Saldo Inicial de Caixa e Equivalentes", vl_conta: Math.round(rev * 0.18 * 100) / 100 },
        { cd_conta: "6.05.02", ds_conta: "Saldo Final de Caixa e Equivalentes", vl_conta: Math.round(rev * 0.22 * 100) / 100 }
      ]
    };
  });

  const latest = time_series[time_series.length - 1];
  const prevYear = time_series[time_series.length - 5] || time_series[0];

  const calcGrowth = (curr: number, prev: number) => {
    if (!prev) return 0.0;
    return Math.round(((curr - prev) / Math.abs(prev)) * 1000) / 10;
  };

  const revGrowth = calcGrowth(latest.receita_liquida, prevYear.receita_liquida);
  const netGrowth = calcGrowth(latest.lucro_liquido, prevYear.lucro_liquido);

  const filings: CVMFiling[] = quarters.slice().reverse().map((q, idx) => ({
    id: `filing_${cod_cvm}_${q.period.replace(/-/g, "")}`,
    cod_cvm,
    tipo: q.tipo,
    dt_refer: q.period,
    dt_entrega: q.period,
    versao: 1,
    url_documento: `https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/${q.tipo}/DADOS/${q.tipo.toLowerCase()}_cia_aberta_${q.year}.zip`,
    status: idx === 0 ? "NEW" : "LOADED"
  }));

  return {
    company,
    kpis: {
      latest_period: latest.period,
      receita_liquida: latest.receita_liquida,
      receita_growth_yoy: revGrowth,
      lucro_liquido: latest.lucro_liquido,
      lucro_growth_yoy: netGrowth,
      margem_bruta: latest.margem_bruta,
      margem_ebit: latest.margem_ebit,
      margem_liquida: latest.margem_liquida,
      roe_estimado: Math.round(((latest.lucro_liquido * 4) / (latest.receita_liquida * 1.5)) * 1000) / 10
    },
    time_series,
    filings,
    periods: quarters.map(q => q.period)
  };
}
