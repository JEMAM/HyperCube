"use client";

import React, { useState, useEffect } from "react";
import { ReactFlow, Controls, Background, Node, Edge, MarkerType } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { usePreferences } from "./PreferencesContext";
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Maximize } from "lucide-react";

interface DAGData {
  nodes?: { id: string; label: string; type: string; formula?: string }[];
  edges?: { source: string; target: string }[];
}

const dreNodePositions: Record<string, { x: number; y: number }> = {
  // Coluna 1: Entradas Primárias de Intermediação / Operacionais (x: 40)
  receita_com_operacoes_de_credito_e_repasses: { x: 40, y: 40 },
  despesas_de_captacao: { x: 40, y: 150 },
  provisao_para_risco_de_credito_prc: { x: 40, y: 260 },
  receitas_prestacao_servicos_tarifas: { x: 40, y: 370 },
  despesas_pessoal_e_administrativas: { x: 40, y: 480 },
  resultado_com_participacoes_societarias: { x: 40, y: 590 },
  despesas_tributarias: { x: 40, y: 700 },
  outras_despesas_liquidas: { x: 40, y: 810 },
  tributos_sobre_o_lucro: { x: 40, y: 920 },
  participacao_nos_lucros: { x: 40, y: 1030 },

  // Commercial / Retail fallback IDs mapped cleanly too
  receita_bruta: { x: 40, y: 40 },
  deducoes_receita: { x: 40, y: 150 },
  custo_produtos_vendidos: { x: 40, y: 260 },
  despesas_vendas: { x: 40, y: 480 },
  despesas_gerais_adm: { x: 40, y: 590 },
  resultado_financeiro: { x: 40, y: 700 },

  // Coluna 2: Margem Bruta / Intermediação (x: 440)
  produto_da_intermediacao_financeira: { x: 440, y: 95 },
  receita_liquida: { x: 440, y: 95 },

  // Coluna 3: Resultado Líquido de PDD / Lucro Bruto (x: 840)
  resultado_da_intermediacao_financeira: { x: 840, y: 200 },
  lucro_bruto: { x: 840, y: 200 },

  // Coluna 4: Resultado Operacional / EBIT (x: 1240)
  resultado_operacional: { x: 1240, y: 420 },
  ebit: { x: 1240, y: 420 },

  // Coluna 5: LAIR / EBT (x: 1640)
  resultado_antes_da_tributacao: { x: 1640, y: 620 },
  lair: { x: 1640, y: 620 },

  // Coluna 6: Target Node (Lucro Líquido do Exercício) (x: 2040)
  lucro_liquido: { x: 2040, y: 820 },
};

const dfcNodePositions: Record<string, { x: number; y: number }> = {
  // FCO
  recebimento_vendas: { x: 30, y: 30 },
  lucro_ajustado: { x: 30, y: 30 },
  var_titulos: { x: 30, y: 110 },
  pagamento_fornecedores: { x: 30, y: 110 },
  var_credito: { x: 30, y: 190 },
  pagamento_salarios: { x: 30, y: 190 },
  var_depositos: { x: 30, y: 270 },
  pagamento_despesas_operacionais: { x: 30, y: 270 },
  pagamento_impostos: { x: 30, y: 350 },
  fco_caixa_liquido: { x: 450, y: 190 },

  // FCI
  capex_ti: { x: 30, y: 460 },
  aquisicao_ativos_imobilizados: { x: 30, y: 460 },
  alienacao_ativos: { x: 30, y: 540 },
  compra_imoveis_veiculos: { x: 30, y: 540 },
  venda_ativos_equipamentos: { x: 30, y: 620 },
  fci_caixa_liquido: { x: 450, y: 540 },

  // FCF
  letras_financeiras: { x: 30, y: 730 },
  aporte_capital: { x: 30, y: 730 },
  captacao_emprestimos: { x: 30, y: 810 },
  amortizacao_dividas: { x: 30, y: 890 },
  dividendos_jcp: { x: 30, y: 970 },
  pagamento_dividendos_jcp: { x: 30, y: 970 },
  fcf_caixa_liquido: { x: 450, y: 850 },

  // TOTALS
  variacao_liquida_caixa: { x: 900, y: 520 },
  saldo_inicial_caixa: { x: 900, y: 660 },
  saldo_final_caixa: { x: 1300, y: 590 },
};

const bpNodePositions: Record<string, { x: number; y: number }> = {
  // Coluna 1: Ativo Circulante (Entradas / Folhas)
  caixa_equivalentes: { x: 30, y: 30 },
  aplicacoes_financeiras: { x: 30, y: 120 },
  contas_receber: { x: 30, y: 210 },
  estoques: { x: 30, y: 300 },
  outros_ativos_circulantes: { x: 30, y: 390 },

  // Coluna 1: Ativo Não Circulante (Entradas / Folhas)
  realizavel_longo_prazo: { x: 30, y: 510 },
  investimentos: { x: 30, y: 600 },
  imobilizado_liquido: { x: 30, y: 690 },
  intangivel_liquido: { x: 30, y: 780 },

  // Coluna 1: Passivo Circulante (Entradas / Folhas)
  fornecedores: { x: 30, y: 900 },
  emprestimos_curto_prazo: { x: 30, y: 990 },
  obrigacoes_fiscais_sociais: { x: 30, y: 1080 },
  outros_passivos_circulantes: { x: 30, y: 1170 },

  // Coluna 1: Passivo Não Circulante (Entradas / Folhas)
  emprestimos_longo_prazo: { x: 30, y: 1290 },
  provisoes_contingencias: { x: 30, y: 1380 },
  outros_passivos_nao_circulantes: { x: 30, y: 1470 },

  // Coluna 1: Patrimônio Líquido (Entradas / Folhas)
  capital_social: { x: 30, y: 1590 },
  reservas_capital_lucros: { x: 30, y: 1680 },
  lucros_prejuizos_acumulados: { x: 30, y: 1770 },

  // Coluna 2: Grupos Intermediários do Balanço (Calculados)
  ativo_circulante: { x: 460, y: 210 },
  ativo_nao_circulante: { x: 460, y: 645 },
  passivo_circulante: { x: 460, y: 1035 },
  passivo_nao_circulante: { x: 460, y: 1380 },
  patrimonio_liquido: { x: 460, y: 1680 },

  // Coluna 3: Totais Máximos & Equação Fundamental (Target)
  ativo_total: { x: 890, y: 430 },
  passivo_total_pl: { x: 890, y: 1360 },

  // Coluna 4: Indicadores Derivados do DAG Patrimonial
  liquidez_corrente: { x: 1310, y: 620 },
  capital_giro_liquido: { x: 1310, y: 820 },
  endividamento_geral: { x: 1310, y: 1020 },
};

const BANKING_DRE_FALLBACK: DAGData = {
  nodes: [
    { id: "receita_com_operacoes_de_credito_e_repasses", type: "input", label: "(+) Receitas da Intermediação Financeira" },
    { id: "despesas_de_captacao", type: "input", label: "(-) Despesas da Intermediação (Captações)" },
    { id: "provisao_para_risco_de_credito_prc", type: "input", label: "(-) Provisão para Perdas com Crédito (PCLD / PDD)" },
    { id: "receitas_prestacao_servicos_tarifas", type: "input", label: "(+) Rendas de Prestação de Serviços e Tarifas" },
    { id: "despesas_pessoal_e_administrativas", type: "input", label: "(-) Despesas com Pessoal e Administrativas" },
    { id: "resultado_com_participacoes_societarias", type: "input", label: "(+) Resultado de Participações em Coligadas" },
    { id: "despesas_tributarias", type: "input", label: "(-) Despesas Tributárias" },
    { id: "outras_despesas_liquidas", type: "input", label: "(-/+) Outras Despesas e Receitas Operacionais" },
    { id: "tributos_sobre_o_lucro", type: "input", label: "(-) Impostos sobre o Lucro (IR/CSLL)" },
    { id: "participacao_nos_lucros", type: "input", label: "(-) PLR & Participação Não Controladores" },
    { id: "produto_da_intermediacao_financeira", type: "calculated", label: "(=) Resultado Bruto da Intermediação Financeira", formula: "Receitas Intermediação - Despesas Captação" },
    { id: "resultado_da_intermediacao_financeira", type: "calculated", label: "(=) Resultado da Intermediação Líquido de PDD", formula: "Resultado Bruto - PCLD" },
    { id: "resultado_operacional", type: "calculated", label: "(=) Resultado Operacional Bancário", formula: "Resultado Líquido PDD + Tarifas - Despesas Pessoal/Admin" },
    { id: "resultado_antes_da_tributacao", type: "calculated", label: "(=) Resultado Antes da Tributação (LAIR / EBT)", formula: "Resultado Operacional + Participações" },
    { id: "lucro_liquido", type: "target", label: "(=) Lucro Líquido do Exercício", formula: "LAIR - Tributos - PLR" }
  ],
  edges: [
    { source: "receita_com_operacoes_de_credito_e_repasses", target: "produto_da_intermediacao_financeira" },
    { source: "despesas_de_captacao", target: "produto_da_intermediacao_financeira" },
    { source: "produto_da_intermediacao_financeira", target: "resultado_da_intermediacao_financeira" },
    { source: "provisao_para_risco_de_credito_prc", target: "resultado_da_intermediacao_financeira" },
    { source: "resultado_da_intermediacao_financeira", target: "resultado_operacional" },
    { source: "receitas_prestacao_servicos_tarifas", target: "resultado_operacional" },
    { source: "despesas_pessoal_e_administrativas", target: "resultado_operacional" },
    { source: "despesas_tributarias", target: "resultado_operacional" },
    { source: "outras_despesas_liquidas", target: "resultado_operacional" },
    { source: "resultado_operacional", target: "resultado_antes_da_tributacao" },
    { source: "resultado_com_participacoes_societarias", target: "resultado_antes_da_tributacao" },
    { source: "resultado_antes_da_tributacao", target: "lucro_liquido" },
    { source: "tributos_sobre_o_lucro", target: "lucro_liquido" },
    { source: "participacao_nos_lucros", target: "lucro_liquido" }
  ]
};

const DEFAULT_DRE_FALLBACK: DAGData = {
  nodes: [
    { id: "receita_bruta", type: "input", label: "(+) Receita Bruta de Vendas e Serviços" },
    { id: "deducoes_receita", type: "input", label: "(-) Deduções e Tributos sobre Vendas" },
    { id: "custo_produtos_vendidos", type: "input", label: "(-) Custo dos Produtos Vendidos (CPV/CMV)" },
    { id: "despesas_vendas", type: "input", label: "(-) Despesas com Vendas e Logística" },
    { id: "despesas_gerais_adm", type: "input", label: "(-) Despesas Gerais e Administrativas" },
    { id: "resultado_financeiro", type: "input", label: "(+/-) Resultado Financeiro Líquido" },
    { id: "tributos_sobre_o_lucro", type: "input", label: "(-) Imposto de Renda e CSLL" },
    { id: "receita_liquida", type: "calculated", label: "(=) Receita Líquida de Vendas", formula: "Receita Bruta - Deduções" },
    { id: "lucro_bruto", type: "calculated", label: "(=) Lucro Bruto", formula: "Receita Líquida - CPV" },
    { id: "ebit", type: "calculated", label: "(=) Lucro Operacional (EBIT)", formula: "Lucro Bruto - Despesas Vendas - G&A" },
    { id: "resultado_antes_da_tributacao", type: "calculated", label: "(=) Resultado Antes dos Tributos (LAIR / EBT)", formula: "EBIT + Resultado Financeiro" },
    { id: "lucro_liquido", type: "target", label: "(=) Lucro Líquido do Exercício", formula: "LAIR - IR/CSLL" }
  ],
  edges: [
    { source: "receita_bruta", target: "receita_liquida" },
    { source: "deducoes_receita", target: "receita_liquida" },
    { source: "receita_liquida", target: "lucro_bruto" },
    { source: "custo_produtos_vendidos", target: "lucro_bruto" },
    { source: "lucro_bruto", target: "ebit" },
    { source: "despesas_vendas", target: "ebit" },
    { source: "despesas_gerais_adm", target: "ebit" },
    { source: "ebit", target: "resultado_antes_da_tributacao" },
    { source: "resultado_financeiro", target: "resultado_antes_da_tributacao" },
    { source: "resultado_antes_da_tributacao", target: "lucro_liquido" },
    { source: "tributos_sobre_o_lucro", target: "lucro_liquido" }
  ]
};

const BANKING_DFC_FALLBACK: DAGData = {
  nodes: [
    { id: "lucro_ajustado", type: "input", label: "(+) Lucro Líquido Ajustado" },
    { id: "var_titulos", type: "input", label: "(+/-) Variação em Títulos e TVM" },
    { id: "var_credito", type: "input", label: "(+/-) Variação em Operações de Crédito" },
    { id: "var_depositos", type: "input", label: "(+/-) Variação em Depósitos e Captações" },
    { id: "fco_caixa_liquido", type: "calculated", label: "(=) Caixa Líquido das Atividades Operacionais (FCO)", formula: "Lucro Ajustado + Variações Operacionais" },
    { id: "capex_ti", type: "input", label: "(-) Capex de TI, Sistemas e Imobilizado" },
    { id: "alienacao_ativos", type: "input", label: "(+) Desinvestimentos / Venda de Ativos" },
    { id: "fci_caixa_liquido", type: "calculated", label: "(=) Caixa Líquido em Investimentos (FCI)", formula: "Alienação - Capex TI" },
    { id: "letras_financeiras", type: "input", label: "(+) Captação de Letras Financeiras / Dívida Subordinada" },
    { id: "dividendos_jcp", type: "input", label: "(-) Proventos Pagos (Dividendos/JCP)" },
    { id: "fcf_caixa_liquido", type: "calculated", label: "(=) Caixa Líquido em Financiamento (FCF)", formula: "Captações - Proventos" },
    { id: "variacao_liquida_caixa", type: "calculated", label: "(=) Variação Líquida de Caixa", formula: "FCO + FCI + FCF" },
    { id: "saldo_inicial_caixa", type: "input", label: "Saldo Inicial de Caixa e Disponibilidades" },
    { id: "saldo_final_caixa", type: "target", label: "(=) Saldo Final de Caixa e Disponibilidades", formula: "Saldo Inicial + Variação" }
  ],
  edges: [
    { source: "lucro_ajustado", target: "fco_caixa_liquido" },
    { source: "var_titulos", target: "fco_caixa_liquido" },
    { source: "var_credito", target: "fco_caixa_liquido" },
    { source: "var_depositos", target: "fco_caixa_liquido" },
    { source: "capex_ti", target: "fci_caixa_liquido" },
    { source: "alienacao_ativos", target: "fci_caixa_liquido" },
    { source: "letras_financeiras", target: "fcf_caixa_liquido" },
    { source: "dividendos_jcp", target: "fcf_caixa_liquido" },
    { source: "fco_caixa_liquido", target: "variacao_liquida_caixa" },
    { source: "fci_caixa_liquido", target: "variacao_liquida_caixa" },
    { source: "fcf_caixa_liquido", target: "variacao_liquida_caixa" },
    { source: "variacao_liquida_caixa", target: "saldo_final_caixa" },
    { source: "saldo_inicial_caixa", target: "saldo_final_caixa" }
  ]
};

const DEFAULT_DFC_FALLBACK: DAGData = {
  nodes: [
    { id: "recebimento_vendas", type: "input", label: "(+) Recebimentos de Clientes" },
    { id: "pagamento_fornecedores", type: "input", label: "(-) Pagamentos a Fornecedores" },
    { id: "pagamento_salarios", type: "input", label: "(-) Pagamento de Salários e Pessoal" },
    { id: "pagamento_despesas_operacionais", type: "input", label: "(-) Despesas Operacionais e Administrativas" },
    { id: "pagamento_impostos", type: "input", label: "(-) Tributos Pagos" },
    { id: "fco_caixa_liquido", type: "calculated", label: "(=) Caixa Gerado pelas Operações (FCO)", formula: "Recebimentos - Pagamentos" },
    { id: "aquisicao_ativos_imobilizados", type: "input", label: "(-) Capex / Imobilizado e Intangíveis" },
    { id: "compra_imoveis_veiculos", type: "input", label: "(-) Compra de Ativos / Imóveis" },
    { id: "venda_ativos_equipamentos", type: "input", label: "(+) Desinvestimentos / Venda de Ativos" },
    { id: "fci_caixa_liquido", type: "calculated", label: "(=) Caixa Utilizado em Investimento (FCI)", formula: "Vendas - Aquisições" },
    { id: "aporte_capital", type: "input", label: "(+) Aporte de Capital" },
    { id: "captacao_emprestimos", type: "input", label: "(+) Captação de Financiamentos" },
    { id: "amortizacao_dividas", type: "input", label: "(-) Amortização de Dívidas" },
    { id: "pagamento_dividendos_jcp", type: "input", label: "(-) Proventos Pagos (Dividendos/JCP)" },
    { id: "fcf_caixa_liquido", type: "calculated", label: "(=) Caixa Utilizado em Financiamento (FCF)", formula: "Captações - Amortizações - Dividendos" },
    { id: "variacao_liquida_caixa", type: "calculated", label: "(=) Variação Líquida de Caixa", formula: "FCO + FCI + FCF" },
    { id: "saldo_inicial_caixa", type: "input", label: "Saldo Inicial de Caixa" },
    { id: "saldo_final_caixa", type: "target", label: "(=) Saldo Final de Caixa", formula: "Saldo Inicial + Variação" }
  ],
  edges: [
    { source: "recebimento_vendas", target: "fco_caixa_liquido" },
    { source: "pagamento_fornecedores", target: "fco_caixa_liquido" },
    { source: "pagamento_salarios", target: "fco_caixa_liquido" },
    { source: "pagamento_despesas_operacionais", target: "fco_caixa_liquido" },
    { source: "pagamento_impostos", target: "fco_caixa_liquido" },
    { source: "aquisicao_ativos_imobilizados", target: "fci_caixa_liquido" },
    { source: "compra_imoveis_veiculos", target: "fci_caixa_liquido" },
    { source: "venda_ativos_equipamentos", target: "fci_caixa_liquido" },
    { source: "aporte_capital", target: "fcf_caixa_liquido" },
    { source: "captacao_emprestimos", target: "fcf_caixa_liquido" },
    { source: "amortizacao_dividas", target: "fcf_caixa_liquido" },
    { source: "pagamento_dividendos_jcp", target: "fcf_caixa_liquido" },
    { source: "fco_caixa_liquido", target: "variacao_liquida_caixa" },
    { source: "fci_caixa_liquido", target: "variacao_liquida_caixa" },
    { source: "fcf_caixa_liquido", target: "variacao_liquida_caixa" },
    { source: "variacao_liquida_caixa", target: "saldo_final_caixa" },
    { source: "saldo_inicial_caixa", target: "saldo_final_caixa" }
  ]
};

const DEFAULT_BP_FALLBACK: DAGData = {
  nodes: [
    // Ativo Circulante
    { id: "caixa_equivalentes", type: "input", label: "(+) Caixa e Equivalentes" },
    { id: "aplicacoes_financeiras", type: "input", label: "(+) Aplicações Financeiras CP" },
    { id: "contas_receber", type: "input", label: "(+) Contas a Receber (Clientes)" },
    { id: "estoques", type: "input", label: "(+) Estoques" },
    { id: "outros_ativos_circulantes", type: "input", label: "(+) Outros Ativos Circulantes" },
    { id: "ativo_circulante", type: "calculated", label: "(=) 1.1 Ativo Circulante Total", formula: "Caixa + Aplic + Clientes + Estoques + Outros" },

    // Ativo Não Circulante
    { id: "realizavel_longo_prazo", type: "input", label: "(+) Realizável a Longo Prazo" },
    { id: "investimentos", type: "input", label: "(+) Investimentos Permanentes" },
    { id: "imobilizado_liquido", type: "input", label: "(+) Imobilizado Líquido (Capex)" },
    { id: "intangivel_liquido", type: "input", label: "(+) Intangível Líquido" },
    { id: "ativo_nao_circulante", type: "calculated", label: "(=) 1.2 Ativo Não Circulante Total", formula: "RLP + Investimentos + Imobilizado + Intangível" },

    // Ativo Total
    { id: "ativo_total", type: "target", label: "(=) 1. ATIVO TOTAL", formula: "Ativo Circulante + Ativo Não Circulante" },

    // Passivo Circulante
    { id: "fornecedores", type: "input", label: "(+) Fornecedores Nacionais/Ext." },
    { id: "emprestimos_curto_prazo", type: "input", label: "(+) Empréstimos CP (Dívida CP)" },
    { id: "obrigacoes_fiscais_sociais", type: "input", label: "(+) Obrigações Fiscais e Sociais" },
    { id: "outros_passivos_circulantes", type: "input", label: "(+) Outros Passivos CP" },
    { id: "passivo_circulante", type: "calculated", label: "(=) 2.1 Passivo Circulante Total", formula: "Fornecedores + Dívida CP + Impostos" },

    // Passivo Não Circulante
    { id: "emprestimos_longo_prazo", type: "input", label: "(+) Empréstimos LP (Financiamentos)" },
    { id: "provisoes_contingencias", type: "input", label: "(+) Provisões e Contingências" },
    { id: "outros_passivos_nao_circulantes", type: "input", label: "(+) Outros Passivos LP" },
    { id: "passivo_nao_circulante", type: "calculated", label: "(=) 2.2 Passivo Não Circulante Total", formula: "Financiamentos LP + Provisões" },

    // Patrimônio Líquido
    { id: "capital_social", type: "input", label: "(+) Capital Social Realizado" },
    { id: "reservas_capital_lucros", type: "input", label: "(+) Reservas de Capital e Lucros" },
    { id: "lucros_prejuizos_acumulados", type: "input", label: "(+) Lucros / Prejuízos Acumulados" },
    { id: "patrimonio_liquido", type: "calculated", label: "(=) 2.3 Patrimônio Líquido Total", formula: "Capital + Reservas + Lucros Acumulados" },

    // Passivo Total + PL
    { id: "passivo_total_pl", type: "target", label: "(=) 2. PASSIVO TOTAL + PL", formula: "Passivo Circ + Passivo Não Circ + PL" },

    // Indicadores do DAG
    { id: "liquidez_corrente", type: "calculated", label: "(★) Liquidez Corrente", formula: "Ativo Circulante / Passivo Circulante" },
    { id: "capital_giro_liquido", type: "calculated", label: "(★) Capital de Giro Líquido (CCL)", formula: "Ativo Circulante - Passivo Circulante" },
    { id: "endividamento_geral", type: "calculated", label: "(★) Grau de Endividamento Geral", formula: "(PC + PNC) / Ativo Total" }
  ],
  edges: [
    { source: "caixa_equivalentes", target: "ativo_circulante" },
    { source: "aplicacoes_financeiras", target: "ativo_circulante" },
    { source: "contas_receber", target: "ativo_circulante" },
    { source: "estoques", target: "ativo_circulante" },
    { source: "outros_ativos_circulantes", target: "ativo_circulante" },

    { source: "realizavel_longo_prazo", target: "ativo_nao_circulante" },
    { source: "investimentos", target: "ativo_nao_circulante" },
    { source: "imobilizado_liquido", target: "ativo_nao_circulante" },
    { source: "intangivel_liquido", target: "ativo_nao_circulante" },

    { source: "ativo_circulante", target: "ativo_total" },
    { source: "ativo_nao_circulante", target: "ativo_total" },

    { source: "fornecedores", target: "passivo_circulante" },
    { source: "emprestimos_curto_prazo", target: "passivo_circulante" },
    { source: "obrigacoes_fiscais_sociais", target: "passivo_circulante" },
    { source: "outros_passivos_circulantes", target: "passivo_circulante" },

    { source: "emprestimos_longo_prazo", target: "passivo_nao_circulante" },
    { source: "provisoes_contingencias", target: "passivo_nao_circulante" },
    { source: "outros_passivos_nao_circulantes", target: "passivo_nao_circulante" },

    { source: "capital_social", target: "patrimonio_liquido" },
    { source: "reservas_capital_lucros", target: "patrimonio_liquido" },
    { source: "lucros_prejuizos_acumulados", target: "patrimonio_liquido" },

    { source: "passivo_circulante", target: "passivo_total_pl" },
    { source: "passivo_nao_circulante", target: "passivo_total_pl" },
    { source: "patrimonio_liquido", target: "passivo_total_pl" },

    { source: "ativo_circulante", target: "liquidez_corrente" },
    { source: "passivo_circulante", target: "liquidez_corrente" },

    { source: "ativo_circulante", target: "capital_giro_liquido" },
    { source: "passivo_circulante", target: "capital_giro_liquido" },

    { source: "passivo_circulante", target: "endividamento_geral" },
    { source: "passivo_nao_circulante", target: "endividamento_geral" },
    { source: "ativo_total", target: "endividamento_geral" }
  ]
};

interface DagViewerProps {
  viewMode?: "DRE" | "DFC" | "BP";
  refreshKey?: number;
  companyName?: string;
}

export default function DagViewer({ viewMode = "DRE", refreshKey = 0, companyName }: DagViewerProps) {
  const { theme, language, t, apiBaseUrl, activeCompany: prefActiveCompany } = usePreferences();
  const [dag, setDag] = useState<any>(viewMode === "DFC" ? DEFAULT_DFC_FALLBACK : (viewMode === "BP" ? DEFAULT_BP_FALLBACK : DEFAULT_DRE_FALLBACK));
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCompany, setActiveCompany] = useState<string>(companyName || prefActiveCompany?.name || "Empresa Ativa");

  useEffect(() => {
    if (prefActiveCompany?.name && !companyName) {
      setActiveCompany(prefActiveCompany.name);
    }
  }, [prefActiveCompany?.name, companyName]);

  useEffect(() => {
    let isMounted = true;
    const compName = (companyName || prefActiveCompany?.name || activeCompany || "").toLowerCase();
    const compId = (prefActiveCompany?.id || "").toLowerCase();
    const isBanking = compName.includes("banco") || compName.includes("bank") || compName.includes("daycoval") || compName.includes("abc") || compId.includes("20796") || compId.includes("20958") || compId.includes("banco");
    
    const fallback = viewMode === "DFC" 
      ? (isBanking ? BANKING_DFC_FALLBACK : DEFAULT_DFC_FALLBACK) 
      : (viewMode === "BP" ? DEFAULT_BP_FALLBACK : (isBanking ? BANKING_DRE_FALLBACK : DEFAULT_DRE_FALLBACK));
    
    const companyParam = prefActiveCompany?.id ? `?company_id=${encodeURIComponent(prefActiveCompany.id)}` : "";
    const endpoint = viewMode === "DFC" 
      ? `${apiBaseUrl}/api/dfc/dag${companyParam}` 
      : (viewMode === "BP" ? `${apiBaseUrl}/api/bp/dag${companyParam}` : `${apiBaseUrl}/api/dag${companyParam}`);
    
    fetch(endpoint)
      .then((res) => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          return res.json();
      })
      .then((data) => {
        if (isMounted && data && ((data.nodes && data.nodes.length > 0) || (Array.isArray(data) && data.length > 0))) {
          setDag(data);
          setError(null);
        } else if (isMounted) {
          setDag(fallback);
        }
      })
      .catch((err) => {
          // Graceful fallback to default DAG model without breaking UI
          if (isMounted) {
            console.warn("DAG backend fetch notice (using local canonical DAG):", err?.message || err);
            setDag(fallback);
          }
      });

    fetch(`${apiBaseUrl}/api/active-company`)
      .then((r) => r.ok ? r.json() : null)
      .then((c) => {
        if (isMounted && c?.name) setActiveCompany(c.name);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [apiBaseUrl, viewMode, refreshKey, companyName, prefActiveCompany?.id, prefActiveCompany?.name, activeCompany]);

  const isDark = theme === "dark";

  if (error && !dag) {
    return (
      <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-900/80 border-rose-900/50 text-rose-300" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
        <p className="text-sm font-semibold">{error}</p>
        <p className="text-xs mt-1 opacity-80">Verifique se o backend está ativo.</p>
      </div>
    );
  }

  if (!dag) {
    return <div className={`p-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>Carregando DAG ({viewMode})...</div>;
  }

  const rawNodes: any[] = Array.isArray(dag)
    ? dag.filter((el: any) => el?.data ? (el.data.id && !el.data.source) : el?.id)
    : (dag?.nodes || []);
  const rawEdges: any[] = Array.isArray(dag)
    ? dag.filter((el: any) => el?.data ? el.data.source : el?.source)
    : (dag?.edges || []);

  const activePositions = viewMode === "DFC" ? dfcNodePositions : (viewMode === "BP" ? bpNodePositions : dreNodePositions);

  const flowNodes: Node[] = rawNodes.map((nObj: any, index: number) => {
    const n = nObj.data || nObj;
    const translated = t(n.id);
    const rawLabel = n.label || (translated && translated !== n.id ? translated : n.id);

    // Clean node label arrow prefixes
    const labelText = rawLabel
      .replace(/^\s*\(\-\)\s*/, "➔ ")
      .replace(/^\s*\(\+\)\s*/, "➔ ")
      .replace(/^\s*\(\=\)\s*/, "➔ ");

    let style: React.CSSProperties = {
      borderRadius: "12px",
      padding: "12px 16px",
      fontSize: "11px",
      fontWeight: 600,
      width: 260,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
      fontFamily: "Inter, sans-serif"
    };

    const isTarget = n.type === "target" || n.id === "ativo_total" || n.id === "passivo_total_pl";
    const isInput = n.type === "input" || n.type === "leaf";

    if (isInput) {
      style.background = isDark ? "#132338" : "#f0f9ff";
      style.color = isDark ? "#38bdf8" : "#0369a1";
      style.border = isDark ? "1px solid #1e4475" : "1px solid #bae6fd";
      style.borderLeft = isDark ? "4px solid #38bdf8" : "4px solid #0284c7";
    } else if (isTarget) {
      style.background = "#ff5537";
      style.color = "#ffffff";
      style.border = "1px solid #ff7a59";
      style.boxShadow = isDark ? "0 0 20px rgba(255, 85, 55, 0.5)" : "0 4px 14px rgba(255, 85, 55, 0.3)";
      style.fontWeight = 700;
    } else {
      style.background = isDark ? "#141e33" : "#ffffff";
      style.color = isDark ? "#f1f5f9" : "#0f172a";
      style.border = isDark ? "1px solid #2d3b55" : "1px solid #e2e8f0";
      style.borderLeft = isDark ? "4px solid #94a3b8" : "4px solid #64748b";
      style.boxShadow = isDark ? "0 10px 15px -3px rgba(0, 0, 0, 0.3)" : "0 4px 12px rgba(0, 0, 0, 0.06)";
    }

    const pos = activePositions[n.id] || {
      x: 50 + (index % 4) * 320,
      y: 50 + Math.floor(index / 4) * 120,
    };

    return {
      id: n.id,
      position: pos,
      data: {
        label: (
          <div className="flex flex-col text-left" title={n.formula ? `Fórmula: ${n.formula}` : labelText}>
            <span className={`text-[9.5px] uppercase tracking-wider font-bold mb-1 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              {isInput && "Input Node"}
              {isTarget && "Target Node"}
              {!isInput && !isTarget && "Calculated Node"}
            </span>
            <span className={`font-bold text-xs truncate leading-normal ${
              isTarget ? "text-white" : isDark ? "text-slate-100" : "text-slate-900"
            }`}>
              {labelText}
            </span>
            {n.formula && (
              <span className={`text-[9px] mt-1 truncate font-mono px-1.5 py-0.5 rounded border font-semibold ${
                isDark ? "text-sky-300 bg-slate-950/80 border-slate-700/60" : "text-sky-800 bg-slate-100 border-slate-300"
              }`}>
                {n.formula}
              </span>
            )}
          </div>
        ),
      },
      style,
    };
  });

  const flowEdges: Edge[] = rawEdges.map((eObj: any) => {
    const e = eObj.data || eObj;
    return {
      id: `${e.source}->${e.target}`,
      source: e.source,
      target: e.target,
      animated: true,
      style: {
        stroke: isDark ? "#45474c" : "#94a3b8",
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isDark ? "#45474c" : "#94a3b8",
        width: 14,
        height: 14,
      },
    };
  });

  return (
    <div
      className={`border flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300 ${
        isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-md"
      } ${
        isExpanded ? "fixed inset-4 z-50 shadow-2xl" : "relative min-h-[550px] w-full"
      }`}
    >
      {/* Top Header Bar inside canvas */}
      <div className={`px-6 py-4 border-b flex justify-between items-center z-10 ${
        isDark ? "border-slate-800/80 bg-slate-900/40 text-slate-300" : "border-slate-200 bg-white text-slate-800"
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <h2 className={`text-xs font-black tracking-widest uppercase ${
              isDark ? "text-slate-400" : "text-slate-800"
            }`}>
              {language === "en"
                ? `Dependency DAG Graph — ${viewMode === "DFC" ? "Cash Flow (DFC)" : (viewMode === "BP" ? "Balance Sheet (BP)" : "Income Statement (DRE)")}`
                : `DAG de Dependências — ${viewMode === "DFC" ? "Fluxo de Caixa (DFC)" : (viewMode === "BP" ? "Balanço Patrimonial (BP)" : "Demonstração DRE")}`}
            </h2>
            <span className="text-[11px] font-bold text-amber-500 font-mono">({activeCompany})</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono border ${
            isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-700"
          }`}>
            {flowNodes.length} {language === "en" ? "Nodes" : "Nós"}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-1.5 rounded-lg border transition-colors ${
            isDark ? "border-slate-800 bg-slate-900 text-slate-400 hover:text-white" : "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 shadow-sm"
          }`}
          title={isExpanded ? (language === "en" ? "Exit Fullscreen" : "Restaurar") : (language === "en" ? "Fullscreen" : "Tela Cheia")}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* ReactFlow Viewport */}
      <div
        className={`flex-1 w-full relative ${
          isDark ? "bg-[#0b1220]" : "bg-white"
        }`}
        style={{ minHeight: "600px", height: "100%" }}
      >
        {/* SVG Mesh Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2}
          className="bg-transparent"
        >
          <Background color={isDark ? "#1e293b" : "#cbd5e1"} gap={24} size={1} />
          <Controls className={isDark ? "!bg-slate-900 !border-slate-800 !text-white [&>button]:!bg-slate-900 [&>button]:!border-slate-800 [&>button:hover]:!bg-slate-800 [&>button_svg]:!fill-amber-500" : "!bg-white !border-slate-300 !text-slate-900 shadow-md [&>button]:!bg-white [&>button]:!border-slate-300 [&>button:hover]:!bg-slate-100 [&>button_svg]:!fill-amber-600"} />
        </ReactFlow>
      </div>
    </div>
  );
}
