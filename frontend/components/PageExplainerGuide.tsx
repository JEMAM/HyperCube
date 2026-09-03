"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  Sliders,
  TrendingUp,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Layers,
  Scale,
  Activity,
  CheckCircle2,
  FileSpreadsheet
} from "lucide-react";
import { usePreferences } from "./PreferencesContext";

interface PageExplainerGuideProps {
  pageKey: string;
}

interface GuideContent {
  title: string;
  category: "PLANEJAMENTO" | "CVM";
  badge: string;
  howItWorks: string;
  whatCanBeVaried: {
    param: string;
    description: string;
  }[];
  expectedResults: {
    effect: string;
    impact: string;
  }[];
  practicalExample: {
    action: string;
    reaction: string;
    conclusion: string;
  };
}

const GUIDES_DATABASE: Record<string, GuideContent> = {
  // ==========================================
  // PÁGINAS DE PLANEJAMENTO
  // ==========================================
  PLANNING: {
    title: "Planejamento Conectado Multidimensional (N-D Grid)",
    category: "PLANEJAMENTO",
    badge: "Matriz Dinâmica OLAP",
    howItWorks:
      "A matriz multidimensional organiza as contas financeiras da companhia cruzando dimensões de Tempo (Mês/Ano), Versão (Orçado, Realizado, Forecast) e Centros de Custo. Toda alteração em uma célula propaga reativamente pela árvore hierárquica através do grafo DAG, sem quebras de fórmulas ou referências circulares.",
    whatCanBeVaried: [
      {
        param: "Valores diretos em células de contas-folha",
        description: "Edição direta de volumes de vendas, preços médios ou despesas departamentais."
      },
      {
        param: "Premissas de inflação e reajustes percentuais",
        description: "Aplicações de choques percentuais uniformes em blocos de contas."
      },
      {
        param: "Alternância entre Versões (Budget vs Actual vs Forecast)",
        description: "Comparação de gaps orçamentários linha a linha em tempo real."
      }
    ],
    expectedResults: [
      {
        effect: "Recálculo instantâneo de subtotais e margens",
        impact: "A Receita Bruta, EBITDA e Lucro Operacional recalculam em menos de 50ms."
      },
      {
        effect: "Write-back com trilha de auditoria",
        impact: "Cada número modificado recebe marcação de autoria, timestamp e log de versão."
      }
    ],
    practicalExample: {
      action: "Aumentar a linha de Receita de Vendas de Produtos em +10% no Q3.",
      reaction: "A Receita Líquida se expande proporcionalmente, os impostos sobre vendas sobem automaticamente e o EBITDA ganha alavancagem operacional.",
      conclusion: "O gestor identifica imediatamente se a meta anual de margem será atingida com a nova curva de demanda."
    }
  },

  DRIVERS: {
    title: "Planejamento Operacional por Drivers (Headcount & Capex)",
    category: "PLANEJAMENTO",
    badge: "Etapa 3 • Drivers Operacionais",
    howItWorks:
      "Substitui o orçamento estático por motores causais: o módulo de Headcount calcula salários, encargos sociais (37,8%) e benefícios dinamicamente com base no quadro de funcionários. O módulo de Capex registra projetos de investimento fabril e calcula a depreciação contábil automática pelo método linear de vida útil.",
    whatCanBeVaried: [
      {
        param: "Quadro de Colaboradores (Admissões e Demissões)",
        description: "Alteração do número de funcionários por departamento (Comercial, Operações, P&D, Administrativo)."
      },
      {
        param: "Salário Médio e Encargos",
        description: "Reajuste salarial dissidial ou alteração da alíquota média de benefícios/encargos."
      },
      {
        param: "Projetos de Capex (Expansão vs Manutenção)",
        description: "Inclusão de linhas de investimento em máquinas, infraestrutura ou TI com datas de ativação."
      },
      {
        param: "Vida Útil em Anos dos Ativos",
        description: "Determina a cota mensal de depreciação linear que incidirá na DRE."
      }
    ],
    expectedResults: [
      {
        effect: "Impacto no Custo dos Produtos (CPV) e SG&A",
        impact: "A folha de pagamento fabril alimenta o CPV e a folha corporativa alimenta as Despesas Gerais."
      },
      {
        effect: "DFC e Balanço Patrimonial Automáticos",
        impact: "O Capex reduz o Caixa no Fluxo de Investimentos (FCI) e amplia o Imobilizado no Ativo Não Circulante."
      }
    ],
    practicalExample: {
      action: "Contratar 50 engenheiros fabris com salário médio de R$ 12.000 e aprovar Capex de R$ 80 Milhões para uma nova linha de produção com vida útil de 10 anos.",
      reaction: "A folha anual sobe R$ 9,9 Milhões (salários + encargos), o FCO reduz essa quantia, o Imobilizado salta R$ 80 M e a depreciação anual deduz R$ 8 M do EBITDA/EBIT.",
      conclusion: "O CFO avalia o payback da expansão e o impacto imediato na margem líquida da empresa."
    }
  },

  FORECAST: {
    title: "Previsão Contínua & Simulação Estocástica (Rolling Forecast & Monte Carlo)",
    category: "PLANEJAMENTO",
    badge: "Etapa 4 • 8T Contínuos & VaR 95%",
    howItWorks:
      "Elimina a barreira do ano fiscal fixo através de um horizonte rolante de 8 trimestres (4 trimestres de Realizado + 4 de Previsão). O motor Monte Carlo executa de 1.000 a 10.000 iterações em matrizes NumPy vetorizadas, aplicando distribuições de probabilidade para mensurar o Value at Risk (VaR 95%) e o risco de quebra de covenants.",
    whatCanBeVaried: [
      {
        param: "Volatilidade de Volume e Preço (Distribuição Normal)",
        description: "Desvio padrão dos preços internacionais de commodities ou demanda de mercado."
      },
      {
        param: "Choque em Insumos e CPV (Distribuição Triangular)",
        description: "Cenários otimista, mais provável e pessimista para energia, frete e matérias-primas."
      },
      {
        param: "Choque na Taxa Selic e CDI (Lognormal)",
        description: "Simulação de estresse financeiro sobre as despesas de dívida indexadas."
      },
      {
        param: "Sensibilidade de Capex",
        description: "Flutuações orçamentárias nos desembolsos de investimentos."
      }
    ],
    expectedResults: [
      {
        effect: "Fan Chart de Dispersão (Leques P10, P25, P50, P75, P90)",
        impact: "Visualização gráfica de todos os corredores possíveis de receita e EBITDA nos próximos 2 anos."
      },
      {
        effect: "VaR 95% e Probabilidade de Déficit de Caixa",
        impact: "Quantificação matemática do pior cenário financeiro antes de decisões estratégicas de capital."
      }
    ],
    practicalExample: {
      action: "Elevar a volatilidade do CPV para 12% e simular choque de +250 bps na taxa Selic.",
      reaction: "O Fan Chart expande os limites de incerteza, o VaR 95% de EBITDA sobe para R$ 1.200 M e a probabilidade de déficit temporário de caixa sobe de 0,5% para 4,2%.",
      conclusion: "A diretoria decide contratar hedge de taxas de juros ou segurar dividendos para blindar o balanço."
    }
  },

  GOVERNANCE: {
    title: "IA Autônoma & Governança Executiva (Board-Ready & Monitor de Covenants)",
    category: "PLANEJAMENTO",
    badge: "Etapa 5 • C-Level Agno Advisor",
    howItWorks:
      "Monitora em tempo real as 4 cláusulas contratuais de endividamento (Alavancagem Máxima, Cobertura de Juros, Liquidez Corrente e Autonomia Financeira). Um agente de IA autônomo baseado no framework Agno atua como consultor de conselho, elaborando memorandos executivos estruturados com recomendação de voto para deliberação.",
    whatCanBeVaried: [
      {
        param: "Limites Contratuais de Covenants (Thresholds)",
        description: "Ajuste do teto de Dívida Líquida/EBITDA (ex: 3,5x para 3,0x) ou Cobertura de Juros (ex: 2,0x)."
      },
      {
        param: "Modelo de IA do Agente (Ollama Local, Groq, Claude, OpenAI, Gemini)",
        description: "Escolha do provedor de raciocínio executivo para síntese do memorando."
      },
      {
        param: "Companhia Alvo em Análise",
        description: "Alternância entre Klabin, Vale, Petrobras, WEG e Banco do Brasil."
      }
    ],
    expectedResults: [
      {
        effect: "Cálculo de Headroom Financeiro (R$ Milhões)",
        impact: "Folga exata de EBITDA que a empresa pode perder e volume máximo de nova dívida suportável."
      },
      {
        effect: "Emissão de Parecer Executivo Board-Ready",
        impact: "Relatório formal com diagnóstico de margens, capital de giro Fleuriet e parecer conclusivo."
      }
    ],
    practicalExample: {
      action: "Definir um covenant estrito de 2,5x de alavancagem para a Klabin.",
      reaction: "O Headroom de EBITDA cai drasticamente, o status migra para 'ALERTA / HEADROOM ESTREITO' e o Agente de IA recomenda congelamento temporário de M&A.",
      conclusion: "O Comitê de Auditoria recebe um alerta antecipado antes que qualquer agência de rating rebaixe a nota de crédito."
    }
  },

  THREE_STATEMENT: {
    title: "O Triângulo Contábil Fechado (Closed-Loop 3-Statement Model & Fleuriet)",
    category: "PLANEJAMENTO",
    badge: "Etapa 2 • Reconciliação Zero Tolerance",
    howItWorks:
      "Acopla DRE, DFC e Balanço Patrimonial em circuito fechado: o Lucro Líquido da DRE flui para o topo da DFC e para os Lucros Acumulados no PL; o saldo final de Caixa da DFC alimenta o Ativo Circulante no Balanço; o Balanço equilibra com precisão matemática (Delta R$ 0,00). Decompõe o Capital de Giro pelo Modelo Fleuriet (NCG, CDG e Saldo de Tesouraria).",
    whatCanBeVaried: [
      {
        param: "Crescimento de Vendas (%) e Margens Operacionais",
        description: "Expansão da receita e pressão de custos."
      },
      {
        param: "Prazos Médios (PMR, PME, PMP em dias)",
        description: "Prazo médio de recebimento de clientes, estocagem de insumos e pagamento a fornecedores."
      },
      {
        param: "Capex e Payout de Dividendos (%)",
        description: "Proporção do lucro distribuída aos acionistas vs retida em reservas."
      }
    ],
    expectedResults: [
      {
        effect: "Classificação das 6 Tipologias Fleuriet",
        impact: "Identifica se a empresa está 'Excelente' (CDG>NCG e ST>0) ou com risco de 'Efeito Tesoura' (ST<0 e NCG crescente)."
      },
      {
        effect: "Decomposição DuPont de 3 Fatores",
        impact: "Avalia o ROE por Margem Líquida × Giro do Ativo × Alavancagem Financeira."
      }
    ],
    practicalExample: {
      action: "Aumentar o Prazo Médio de Clientes (PMR) de 42 para 85 dias sem alongar Fornecedores.",
      reaction: "A Necessidade de Capital de Giro (NCG) dispara, drenando o Saldo de Tesouraria (ST) e reduzindo o FCO, mesmo com o Lucro Líquido intacto na DRE.",
      conclusion: "O modelo comprova visualmente a armadilha do lucro sem caixa (Overtrading)."
    }
  },

  CUBE: {
    title: "Cubo 3D OLAP Interativo (WebGL Canvas)",
    category: "PLANEJAMENTO",
    badge: "Visão Hiperdimensional",
    howItWorks:
      "Renderiza geometricamente a hiperestrutura financeira em um cubo 3D tridimensional interativo. Permite inspecionar a interseção exata de Contas (X), Tempo (Y) e Cenários (Z) com rotação espacial, zoom e fatiamento (Slice & Dice).",
    whatCanBeVaried: [
      {
        param: "Ângulo de Visão Espacial e Rotação 360°",
        description: "Inspeção do cubo por diferentes perspectivas de negócios."
      },
      {
        param: "Seleção de Eixos e Planos de Corte",
        description: "Fatiamento de demonstrações contábeis e períodos temporais."
      }
    ],
    expectedResults: [
      {
        effect: "Compreensão Intuitiva da Complexidade Multidimensional",
        impact: "Diretoria e investidores visualizam o impacto de um choque em todo o espaço do negócio."
      }
    ],
    practicalExample: {
      action: "Girar o cubo para o plano de Projeção 2026 e selecionar o vértice de EBITDA.",
      reaction: "O nó selecionado acende em destaque no canvas 3D e expõe a memória de cálculo subjacente.",
      conclusion: "Facilita apresentações executivas com alto impacto visual e rigor analítico."
    }
  },

  VALUATION: {
    title: "Valuation Corporativo por Fluxo de Caixa Descontado (DCF)",
    category: "PLANEJAMENTO",
    badge: "Valor Justo & Múltiplos",
    howItWorks:
      "Projeta o Fluxo de Caixa Livre da Firma (FCFF) para os próximos 5 a 10 anos e desconta a valor presente pelo Custo Médio Ponderado de Capital (WACC). Calcula o Valor Terminal pelo Modelo de Gordon Shapiro e compara com múltiplos de mercado (EV/EBITDA e P/L).",
    whatCanBeVaried: [
      {
        param: "WACC / Taxa de Desconto (%)",
        description: "Sensibilidade ao custo de capital próprio (Ke via CAPM) e custo da dívida (Kd pós-impostos)."
      },
      {
        param: "Taxa de Crescimento na Perpetuidade (g %)",
        description: "Crescimento sustentável de longo prazo compatível com o PIB."
      },
      {
        param: "Projeção de Margens EBITDA e FCO",
        description: "Capacidade de geração de caixa operacional da companhia."
      }
    ],
    expectedResults: [
      {
        effect: "Preço Justo por Ação (Target Price)",
        impact: "Cálculo do Enterprise Value (EV) e Equity Value, deduzindo a dívida líquida."
      },
      {
        effect: "Tabela de Sensibilidade Bidimensional",
        impact: "Matriz de variação de valor cruzando faixas de WACC (9% a 14%) com taxas de perpetuidade (2% a 4%)."
      }
    ],
    practicalExample: {
      action: "Reduzir o WACC de 12,5% para 11,0% devido à queda do Risco-País.",
      reaction: "O valor presente dos fluxos futuros aumenta e o Preço Justo da ação se valoriza em +18%.",
      conclusion: "A equipe de M&A ou RI calibra a tese de investimento com precisão estatística."
    }
  },

  // ==========================================
  // PÁGINAS DE DEMONSTRAÇÕES CVM
  // ==========================================
  DRE: {
    title: "Demonstração do Resultado do Exercício (DRE Oficial)",
    category: "CVM",
    badge: "CPC 26 • Estrutura Vertical de Margens",
    howItWorks:
      "Apresenta a formação do resultado econômico da empresa ao longo do período contábil, partindo da Receita Bruta até o Lucro Líquido. Incorpora a decomposição causal em árvore DAG, permitindo simular choques em qualquer linha intermediária (CPV, SG&A, Depreciação ou Resultado Financeiro).",
    whatCanBeVaried: [
      {
        param: "Choques de Receita Líquida (%)",
        description: "Ajuste na demanda, volume ou preços de venda da companhia."
      },
      {
        param: "Sensibilidade de CPV e Margem Bruta",
        description: "Impacto de custo de insumos ou eficiência produtiva."
      },
      {
        param: "Despesas com Vendas e Administrativas (SG&A)",
        description: "Diluição de custos operacionais e reestruturação corporativa."
      }
    ],
    expectedResults: [
      {
        effect: "Alavancagem Operacional Instantânea",
        impact: "Visualização do impacto ampliado no EBITDA e EBIT a cada variação de receita."
      },
      {
        effect: "Waterfall Bridge Causal",
        impact: "Gráfico de cascata destacando os principais motores positivos e detratores do resultado."
      }
    ],
    practicalExample: {
      action: "Simular corte de 8% nas despesas gerais e administrativas (SG&A).",
      reaction: "O EBITDA se expande imediatamente na mesma proporção e a margem operacional sobe 1,5 p.p.",
      conclusion: "O gestor identifica alavancas de rentabilidade sem necessidade de mexer no preço de venda."
    }
  },

  DFC: {
    title: "Demonstração dos Fluxos de Caixa (DFC Direta & Indireta)",
    category: "CVM",
    badge: "CPC 03 • Liquidez Efetiva",
    howItWorks:
      "Evidencia a movimentação financeira real de entradas e saídas de caixa dividida em três pilares fundamentais: Atividades Operacionais (FCO), Atividades de Investimento (FCI) e Atividades de Financiamento (FCF). Demonstra a variação líquida do caixa entre o início e o fim do período.",
    whatCanBeVaried: [
      {
        param: "Ciclo de Giro / Variação de NCG",
        description: "Impacto da expansão de contas a receber ou formação de estoques sobre o caixa operacional."
      },
      {
        param: "Ritmo de Desembolsos de Capex",
        description: "Volume de aquisições de imobilizado no Fluxo de Investimento."
      },
      {
        param: "Captações e Amortizações de Empréstimos",
        description: "Refinanciamentos e emissão de debêntures no Fluxo de Financiamento."
      }
    ],
    expectedResults: [
      {
        effect: "Fluxo de Caixa Livre (Free Cash Flow)",
        impact: "Determina quanto caixa a empresa gera de forma limpa após manter sua operação e seus investimentos."
      },
      {
        effect: "Sustentabilidade do Pagamento de Dividendos",
        impact: "Verifica se os dividendos distribuídos provêm de caixa operacional gerado ou de endividamento."
      }
    ],
    practicalExample: {
      action: "Acelerar o pagamento de dívidas bancárias (amortização de R$ 500 M no FCF).",
      reaction: "O saldo final de caixa diminui, mas as despesas financeiras futuras diminuirão nos trimestres seguintes.",
      conclusion: "O tesoureiro calibra o nível ótimo de caixa mínimo de segurança da operação."
    }
  },

  BP: {
    title: "Balanço Patrimonial & Modelo Fleuriet (BP Interativo)",
    category: "CVM",
    badge: "CPC 26 • Posição Patrimonial",
    howItWorks:
      "Fotografia da estrutura de Ativos (Bens e Direitos) e Passivos + Patrimônio Líquido (Obrigações e Recursos Próprios). O HyperCube aplica a metodologia Fleuriet, separando contas operacionais de contas financeiras de tesouraria para aferir a solvência estrutural da empresa.",
    whatCanBeVaried: [
      {
        param: "Alocação entre Ativo Circulante e Não Circulante",
        description: "Equilíbrio entre liquidez imediata e imobilizado de longo prazo."
      },
      {
        param: "Composição do Endividamento (Curto Prazo vs Longo Prazo)",
        description: "Alongamento do perfil da dívida bruta."
      },
      {
        param: "Retenção de Lucros vs Distribuição de Capital",
        description: "Fortalecimento do Patrimônio Líquido."
      }
    ],
    expectedResults: [
      {
        effect: "Diagnóstico Fleuriet em Tempo Real",
        impact: "Classificação automática entre Sólida, Cíclica, Alavancada ou Efeito Tesoura."
      },
      {
        effect: "Índices de Liquidez (Corrente, Seca e Geral)",
        impact: "Mapeamento da capacidade de cumprimento de dívidas contratuais."
      }
    ],
    practicalExample: {
      action: "Alongar R$ 1 Bilhão de dívida de curto prazo (passivo circulante) para debêntures de 7 anos (não circulante).",
      reaction: "A Liquidez Corrente salta de 0,9x para 1,6x e o Capital de Giro Próprio (CDG) cresce substancialmente.",
      conclusion: "A empresa elimina o risco de liquidez de curto prazo e ganha fôlego operacional."
    }
  },

  DRA: {
    title: "Demonstração do Resultado Abrangente (DRA)",
    category: "CVM",
    badge: "CPC 26 • Ajustes de Avaliação Patrimonial",
    howItWorks:
      "Captura as variações econômicas no Patrimônio Líquido que não transitaram pela DRE convencional por exigência das normas IFRS/CPC, como ganhos/perdas com hedge de fluxo de caixa, conversão cambial de subsidiárias no exterior e reavaliação de ativos.",
    whatCanBeVaried: [
      {
        param: "Volatilidade Cambial sobre Operações no Exterior",
        description: "Variação do Dólar/Euro sobre ativos denominados em moeda estrangeira."
      },
      {
        param: "Marcação a Mercado de Derivativos de Hedge",
        description: "Oscilações nas curvas de juros e commodities com hedge contratado."
      }
    ],
    expectedResults: [
      {
        effect: "Resultado Abrangente Total do Período",
        impact: "Retrata a verdadeira expansão ou contração da riqueza dos acionistas."
      },
      {
        effect: "Estabilidade do Patrimônio Líquido",
        impact: "Transparência quanto à eficácia das estratégias corporativas de proteção cambial."
      }
    ],
    practicalExample: {
      action: "Uma forte valorização do Dólar gera ganho não realizado em exportações futuras protegidas por derivativos.",
      reaction: "O ajuste é reconhecido na DRA no item de Outros Resultados Abrangentes, expandindo o PL sem inflar a DRE antes da realização física.",
      conclusion: "Evita distorções tributárias e retrata a solvência da companhia aos credores."
    }
  },

  DMPL: {
    title: "Demonstração das Mutações do Patrimônio Líquido (DMPL)",
    category: "CVM",
    badge: "CPC 26 • Dinâmica do Capital Próprio",
    howItWorks:
      "Mapeia a evolução completa de todas as contas que compõem o Patrimônio Líquido ao longo do tempo: Capital Social, Reservas de Capital, Reservas de Lucros, Ações em Tesouraria e Lucros ou Prejuízos Acumulados.",
    whatCanBeVaried: [
      {
        param: "Aumentos de Capital por Emissão de Ações",
        description: "Injeção de recursos novos pelos acionistas ou bonificação."
      },
      {
        param: "Destinação do Lucro Líquido para Reservas",
        description: "Reserva Legal (5%), Reserva de Incentivos Fiscais e Reserva de Expansão."
      },
      {
        param: "Programas de Recompra de Ações (Buyback)",
        description: "Aquisição de ações próprias mantidas em tesouraria."
      }
    ],
    expectedResults: [
      {
        effect: "Rastreabilidade Completa dos Fundos dos Acionistas",
        impact: "Zero perda de conciliação entre o saldo inicial e final do Patrimônio Líquido."
      },
      {
        effect: "Governança sobre a Política de Retenção de Lucros",
        impact: "Clareza para analistas sobre a capacidade de reinvestimento da companhia."
      }
    ],
    practicalExample: {
      action: "Destinar 60% do lucro para Reserva de Expansão e 40% para Dividendos Mínimos Obrigatórios.",
      reaction: "A DMPL reflete a transferência precisa entre as colunas de Lucros Acumulados e Reservas de Lucros.",
      conclusion: "Garante conformidade estrita com a Lei das S/A (Lei 6.404/76)."
    }
  },

  DVA: {
    title: "Demonstração do Valor Adicionado (DVA)",
    category: "CVM",
    badge: "CPC 09 • Impacto Social & Econômico",
    howItWorks:
      "Mede a riqueza gerada pela atividade da companhia e a forma como ela é distribuída entre os 4 principais agentes da sociedade: Pessoal (Salários e Encargos), Governo (Tributos e Contribuições), Financiadores (Juros e Aluguéis) e Acionistas (Dividendos e Lucros Retidos).",
    whatCanBeVaried: [
      {
        param: "Intensidade de Mão de Obra vs Automação",
        description: "Proporção de riqueza direcionada para a remuneração de colaboradores."
      },
      {
        param: "Estrutura Tributária e Regimes Fiscais",
        description: "Peso da carga tributária municipal, estadual e federal."
      },
      {
        param: "Dependência de Capital de Terceiros vs Próprio",
        description: "Divisão do valor entre juros a bancos ou dividendos a investidores."
      }
    ],
    expectedResults: [
      {
        effect: "Métricas ESG de Responsabilidade Social e Econômica",
        impact: "Demonstra com transparência a contribuição social da empresa para o PIB do país."
      },
      {
        effect: "Produtividade do Valor Adicionado por Colaborador",
        impact: "Indicador crítico de eficiência e rentabilidade do negócio."
      }
    ],
    practicalExample: {
      action: "Aumentar a produtividade fabril reduzindo consumo intermediário de matérias-primas de terceiros.",
      reaction: "O Valor Adicionado Líquido cresce, permitindo elevar a parcela distribuída a salários e lucros.",
      conclusion: "Relatório indispensável para auditorias de sustentabilidade e fundos de investimento ESG."
    }
  },

  NE: {
    title: "Notas Explicativas & Detalhamento Contábil (NE)",
    category: "CVM",
    badge: "CPC 26 • Divulgação & Políticas Contábeis",
    howItWorks:
      "Reúne informações adicionais que não cabem nas tabelas numéricas principais, detalhando as políticas contábeis adotadas, riscos financeiros de mercado, garantias de dívidas, contingências judiciais (trabalhistas, fiscais e cíveis) e partes relacionadas.",
    whatCanBeVaried: [
      {
        param: "Critérios de Classificação de Risco de Provisões",
        description: "Classificação de processos judiciais em Perda Provável (com provisão contábil), Possível ou Remota."
      },
      {
        param: "Taxas de Depreciação e Amortização de Intangíveis",
        description: "Ajuste na estimativa de vida útil e testes de impairment de goodwill."
      }
    ],
    expectedResults: [
      {
        effect: "Blindagem de Auditoria e Conformidade com a CVM",
        impact: "Redução drástica de ressalvas de auditores externos (Big 4)."
      },
      {
        effect: "Transparência para Credores e Mercado de Capitais",
        impact: "Menor custo de captação de dívida devido à clareza das notas."
      }
    ],
    practicalExample: {
      action: "Reclassificar uma contingência tributária de R$ 50 M de 'Possível' para 'Provável'.",
      reaction: "Exige o provisionamento imediato no Balanço e reconhecimento da despesa na DRE, documentado na Nota de Contingências.",
      conclusion: "O investidor compreende a origem exata da variação patrimonial."
    }
  },

  CVM: {
    title: "CVM Watch & Análise Automatizada de Relatórios Regulatórios",
    category: "CVM",
    badge: "Monitor CVM & DFP/ITR",
    howItWorks:
      "Monitora ativamente as publicações regulatórias de demonstrações financeiras padronizadas (DFP anuais e ITR trimestrais) registradas na Comissão de Valores Mobiliários (CVM), executando reconciliação cruzada automática entre os dados oficiais e o modelo analítico.",
    whatCanBeVaried: [
      {
        param: "Filtro de Trimestre e Exercício Fiscal",
        description: "Comparação de relatórios históricos de múltiplos anos."
      },
      {
        param: "Tolerância de Divergência Contábil (Threshold)",
        description: "Sensibilidade na detecção de discrepâncias entre relatórios."
      }
    ],
    expectedResults: [
      {
        effect: "Detecção Automática de Republicações e Retificações",
        impact: "Alerta em tempo real caso uma companhia altere números contábeis arquivados."
      },
      {
        effect: "Alinhamento com Padrões IFRS e XBRL",
        impact: "Garantia de que o HyperCube espelha fielmente os dados arquivados na autarquia reguladora."
      }
    ],
    practicalExample: {
      action: "Carregar as demonstrações mais recentes da Petrobras publicadas na CVM.",
      reaction: "O sistema valida as contas em segundos, destacando variações relevantes frente ao consenso de mercado.",
      conclusion: "A equipe de análise ganha velocidade institucional de nível Bloomberg."
    }
  }
};

export default function PageExplainerGuide({ pageKey }: PageExplainerGuideProps) {
  const { theme, language } = usePreferences();
  const isDark = theme === "dark";
  const isEn = language === "en";

  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const guide = GUIDES_DATABASE[pageKey];
  if (!guide) return null;

  const isPlanejamento = guide.category === "PLANEJAMENTO";

  return (
    <div
      data-explainer-guide="true"
      className="explainer-guide-root no-print print:hidden w-full mt-10 font-sans animate-in fade-in duration-300"
    >
      <div
        className={`no-print print:hidden rounded-3xl border transition-all duration-300 overflow-hidden shadow-xl ${
          isDark
            ? "bg-[#0b1326] border-[#222a3d] hover:border-[#324060]"
            : "bg-white border-slate-200 hover:border-slate-300"
        }`}
      >
        {/* Header Ribbon / Toggle Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer select-none transition-colors ${
            isDark ? "bg-[#10192e]/80 hover:bg-[#131f38]" : "bg-slate-50 hover:bg-slate-100"
          }`}
        >
          <div className="flex items-center gap-3.5 flex-wrap">
            <div
              className={`p-2.5 rounded-2xl flex items-center justify-center text-white shadow-md ${
                isPlanejamento
                  ? "bg-gradient-to-tr from-amber-500 to-orange-500"
                  : "bg-gradient-to-tr from-emerald-500 to-teal-500"
              }`}
            >
              <Lightbulb className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className={`text-base font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  {guide.title}
                </h3>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider border ${
                    isPlanejamento
                      ? isDark
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        : "bg-amber-100 text-amber-900 border-amber-300"
                      : isDark
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-emerald-100 text-emerald-900 border-emerald-300"
                  }`}
                >
                  {guide.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEn
                  ? "Module Explainer: how it operates, parameters that can be varied, and expected financial results."
                  : "Guia do Módulo: como funciona, o que pode ser variado e quais resultados serão obtidos."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-bold text-slate-400 hidden sm:inline">
              {isExpanded ? (isEn ? "Hide Explainer" : "Ocultar Guia") : (isEn ? "View Explainer" : "Ver Explicação")}
            </span>
            <div className={`p-1.5 rounded-xl border ${isDark ? "bg-[#0b1326] border-[#222a3d] text-slate-300" : "bg-white border-slate-200 text-slate-700"}`}>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Collapsible Explainer Body */}
        {isExpanded && (
          <div className="p-6 sm:p-8 space-y-6 border-t border-[#222a3d]/60">
            {/* 1. Como Funciona */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-sky-400" />
                <span>{isEn ? "1. How It Operates (Mechanism & Engine)" : "1. Como Funciona (Mecanismo & Algoritmo)"}</span>
              </span>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {guide.howItWorks}
              </p>
            </div>

            {/* Grid: 2. O que Pode Ser Variado & 3. Resultados Obtidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* O que pode ser variado */}
              <div
                className={`p-5 rounded-2xl border space-y-3 ${
                  isDark ? "bg-[#10192e] border-[#222a3d]" : "bg-slate-50 border-slate-200"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>{isEn ? "2. What Can Be Varied (Inputs & Drivers)" : "2. O Que Pode Ser Variado (Inputs & Gatilhos)"}</span>
                </span>
                <div className="space-y-2.5">
                  {guide.whatCanBeVaried.map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <span className={`text-xs font-bold block ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                        • {item.param}
                      </span>
                      <p className="text-[11px] text-slate-400 pl-3 leading-normal">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resultados Obtidos */}
              <div
                className={`p-5 rounded-2xl border space-y-3 ${
                  isDark ? "bg-[#10192e] border-[#222a3d]" : "bg-slate-50 border-slate-200"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>{isEn ? "3. Expected Results & Impacts" : "3. Resultados Obtidos & Impactos"}</span>
                </span>
                <div className="space-y-2.5">
                  {guide.expectedResults.map((res, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <span className={`text-xs font-bold block ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                        • {res.effect}
                      </span>
                      <p className="text-[11px] text-slate-400 pl-3 leading-normal">
                        {res.impact}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Exemplo Prático Guiado */}
            <div
              className={`p-5 sm:p-6 rounded-2xl border space-y-2.5 ${
                isDark
                  ? "bg-gradient-to-br from-[#0c1b33] to-[#0b1326] border-sky-500/30"
                  : "bg-sky-50/70 border-sky-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-black uppercase tracking-wider text-sky-400">
                  {isEn ? "4. Practical Walkthrough Example" : "4. Exemplo Prático de Simulação"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {isEn ? "Ação do Usuário" : "Ação de Simulação"}
                  </span>
                  <p className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {guide.practicalExample.action}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">
                    {isEn ? "Reação do Modelo" : "Propagação Contábil"}
                  </span>
                  <p className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {guide.practicalExample.reaction}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                    {isEn ? "Decisão Estratégica" : "Conclusão para Decisão"}
                  </span>
                  <p className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {guide.practicalExample.conclusion}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
