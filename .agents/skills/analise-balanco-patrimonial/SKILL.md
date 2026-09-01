---
name: analise-balanco-patrimonial
description: >
  Guia um agente a atuar como analista de balanço patrimonial, calculando e interpretando todos os principais grupos de indicadores financeiros — liquidez (corrente, seca, geral, imediata), endividamento/estrutura de capital, rentabilidade (ROE, ROA, ROI, margens), atividade/eficiência (prazos médios, ciclo operacional e financeiro), capital de giro (NCG, CDG, saldo de tesouraria - Modelo Fleuriet), análise vertical e horizontal, análise Dupont e indicadores baseados em EBITDA (dívida líquida/EBITDA, cobertura de juros). Use esta skill sempre que o usuário pedir para analisar o balanço, analisar as demonstrações financeiras, calcular os índices financeiros/econômicos de uma empresa, avaliar a saúde financeira, liquidez, endividamento ou rentabilidade de uma companhia a partir de balanço patrimonial e/ou DRE, ou pedir um relatório de análise financeira — mesmo que o usuário peça apenas um grupo de índices isoladamente, como calcular apenas os índices de liquidez.
---

# Análise de Balanço Patrimonial

## Visão geral

Esta skill estrutura a análise econômico-financeira de uma empresa a partir do Balanço Patrimonial (BP) e da Demonstração do Resultado do Exercício (DRE), cobrindo os principais grupos de indicadores usados por analistas de crédito, investidores e controllers. Cada grupo de índice responde a uma pergunta diferente sobre a saúde da empresa (a empresa consegue pagar suas contas de curto prazo? está endividada demais? é rentável? gira o estoque e recebe dos clientes rápido o suficiente?) — por isso a análise completa sempre cruza vários grupos, nunca conclui a partir de um índice isolado.

O papel do agente aqui não é só calcular fórmulas, mas: (1) organizar os dados do BP/DRE de forma consistente, (2) calcular os índices relevantes para a pergunta do usuário, (3) interpretar cada índice no contexto do setor e da evolução histórica da empresa (não em valores absolutos isolados), e (4) apontar sinais de alerta e conclusões acionáveis, não apenas uma lista de números.

## Passo 1 — Organizar os dados de entrada

Antes de calcular qualquer índice, organize os dados disponíveis:

- **Balanço Patrimonial** (pelo menos 2 exercícios, para permitir análise horizontal): Ativo Circulante, Ativo Não Circulante (Realizável a Longo Prazo, Investimentos, Imobilizado, Intangível), Passivo Circulante, Passivo Não Circulante (Exigível a Longo Prazo), Patrimônio Líquido.
- **DRE** (pelo menos 2 exercícios): Receita Líquida, Custo dos Produtos/Serviços Vendidos, Lucro Bruto, Despesas Operacionais, EBIT (Lucro Operacional), Resultado Financeiro, Lucro Líquido.
- Detalhamento de contas específicas quando disponível: Estoques, Duplicatas/Contas a Receber, Fornecedores, Empréstimos e Financiamentos (curto e longo prazo), Depreciação e Amortização (para chegar ao EBITDA a partir do EBIT).

Se o usuário fornecer apenas parte dos dados (ex.: só o BP, sem DRE), calcule o que for possível com o que está disponível e avise explicitamente quais índices não puderam ser calculados por falta de dado (ex.: índices de rentabilidade e de atividade normalmente precisam da DRE).

Sempre que possível, peça ou monte pelo menos 2 a 3 exercícios/períodos consecutivos — a maioria dos índices só ganha significado real quando comparados na evolução ao longo do tempo, e não como fotografia isolada de um único período.

## Passo 2 — Escolher os grupos de índices relevantes

Se o usuário pedir "análise completa", calcule todos os grupos abaixo. Se pedir algo específico (ex.: "só liquidez"), calcule apenas o grupo pedido, mas mencione brevemente que outros grupos existem e podem complementar a análise.

| Grupo                                  | Responde à pergunta                                                                                                          | Arquivo de referência               |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Análise Vertical e Horizontal          | Como a estrutura patrimonial e de resultado mudou ao longo do tempo, e qual o peso de cada conta?                            | `references/vertical_horizontal.md` |
| Liquidez                               | A empresa consegue pagar suas obrigações de curto e longo prazo?                                                             | `references/liquidez.md`            |
| Endividamento / Estrutura de Capital   | Quanto a empresa depende de capital de terceiros, e qual a qualidade dessa dívida (curto vs. longo prazo)?                   | `references/endividamento.md`       |
| Rentabilidade                          | A empresa gera retorno adequado sobre o que foi investido nela (ativos, patrimônio)?                                         | `references/rentabilidade.md`       |
| Atividade / Eficiência (Prazos Médios) | A empresa gira estoque, recebe de clientes e paga fornecedores em prazos saudáveis?                                          | `references/atividade.md`           |
| Capital de Giro (Modelo Fleuriet)      | A operação da empresa gera ou consome caixa estruturalmente? Ela depende de dívida de curto prazo para financiar a operação? | `references/capital_giro.md`        |
| Análise Dupont e EBITDA                | Quais alavancas explicam o ROE da empresa? Ela tem capacidade de honrar dívida com a geração operacional de caixa?           | `references/dupont_ebitda.md`       |

## Passo 3 — Calcular e mostrar o raciocínio

Ao calcular qualquer índice:
1. Mostre a fórmula usada e os valores extraídos do BP/DRE que alimentam o cálculo — não entregue só o resultado final.
2. Quando houver mais de um período disponível, monte uma tabela comparando os períodos lado a lado (ex.: em colunas), e não apenas o valor do período mais recente.
3. Organize por grupo, na ordem do Passo 2, para manter o relatório legível.

## Passo 4 — Interpretar, contextualizar e concluir

Um índice sem interpretação é só um número. Para cada grupo calculado:

1. **Compare com o histórico da própria empresa**: o índice está melhorando ou piorando ao longo dos períodos disponíveis?
2. **Compare com benchmarks de setor quando possível**: índices "bons" variam muito por setor (ex.: uma indústria pesada tem endividamento e imobilização normalmente mais altos que uma empresa de serviços). Se o usuário não fornecer benchmarks do setor, e isso for relevante para a conclusão, busque na web por médias/benchmarks setoriais em vez de usar limiares genéricos de memória.
3. **Cruze grupos diferentes antes de concluir**: por exemplo, liquidez corrente alta não significa saúde financeira se o capital de giro (Modelo Fleuriet) mostra que a empresa depende de dívida de curto prazo para sustentar a operação — sempre que os grupos parecerem contraditórios, explique a aparente contradição em vez de ignorá-la.
4. **Aponte sinais de alerta explicitamente**: prazo médio de recebimento crescendo mais rápido que o de pagamento, endividamento de curto prazo crescendo como proporção da dívida total, margens caindo período a período, ROE alto sustentado por alavancagem excessiva em vez de eficiência operacional (isso aparece na análise Dupont) — esses são padrões que merecem destaque específico no relatório, não apenas o número em uma tabela.
5. **Não dê recomendação de investimento**: a análise de balanço é uma leitura técnica da saúde financeira, não uma recomendação de compra/venda de ações ou de concessão de crédito. Deixe isso explícito quando o contexto (ex.: análise de crédito, decisão de investimento) sugerir que o usuário pode usar a conclusão para decidir algo com implicações financeiras reais.

## Formato de saída

Para uma análise completa (múltiplos grupos de índices, várias tabelas, evolução histórica), organize o resultado como um documento em vez de só texto corrido no chat — normalmente funciona melhor como um Word (.docx) para um relatório/parecer, ou uma planilha (.xlsx) se o usuário quiser um modelo com fórmulas editáveis para atualizar em períodos futuros. Para perguntas pontuais sobre um único índice ou cálculo rápido, responda direto na conversa.
-e 

---

# Análise Vertical e Horizontal

## Quando usar
Ponto de partida de qualquer análise de balanço — mostra como a estrutura patrimonial e de resultado mudou ao longo do tempo e qual o peso relativo de cada conta. Serve como diagnóstico inicial antes de calcular os índices mais específicos (liquidez, endividamento etc.), porque já revela tendências e desproporções que os índices vão confirmar ou explicar melhor.

## Análise Vertical (AV)
Mostra o peso percentual de cada conta em relação a um total de referência, no mesmo período.

```
AV (Balanço) = (Valor da conta / Ativo Total) × 100
AV (DRE) = (Valor da conta / Receita Líquida) × 100
```

No Balanço, cada conta do Ativo é expressa como % do Ativo Total; cada conta do Passivo/PL também é expressa como % do total do Passivo + PL (que é igual ao Ativo Total). Na DRE, cada linha (custos, despesas, lucro) é expressa como % da Receita Líquida.

**O que observar:**
- Qual a participação do Ativo Circulante vs. Não Circulante — indica o grau de liquidez estrutural da empresa.
- Qual a participação de Capital de Terceiros (Passivo Circulante + Não Circulante) vs. Capital Próprio (PL) — indica estrutura de capital.
- Na DRE, como o Custo dos Produtos/Serviços Vendidos e as despesas operacionais consomem a receita — indica estrutura de custos e eficiência operacional.

## Análise Horizontal (AH)
Mostra a evolução percentual de cada conta ao longo do tempo, comparando um período com um período-base (geralmente o mais antigo disponível).

```
AH = [(Valor do período atual / Valor do período-base) - 1] × 100
```

Quando há mais de 2 períodos, calcule tanto a variação em relação ao período-base (AH encadeada) quanto a variação período a período (AH anual), para capturar tanto a tendência de longo prazo quanto oscilações recentes.

**O que observar:**
- Contas que crescem muito mais rápido que a Receita Líquida (ex.: Estoques ou Contas a Receber crescendo bem acima da receita) — pode indicar perda de eficiência operacional, mesmo que os índices absolutos ainda pareçam saudáveis.
- Crescimento de dívida (Empréstimos e Financiamentos) desproporcional ao crescimento do Ativo ou do PL.
- Descolamento entre o crescimento do Lucro Bruto e o crescimento do Lucro Líquido — indica que despesas operacionais ou financeiras estão crescendo mais rápido que a geração bruta de receita.

## Como apresentar
Monte uma tabela com as contas principais nas linhas e os períodos nas colunas, mostrando lado a lado: valor absoluto, AV (%) e AH (%) de cada período. Isso permite ao leitor ver de uma vez o tamanho da conta, seu peso relativo e sua evolução — sem essas três dimensões juntas, a leitura fica incompleta (uma conta pode crescer 50% em termos absolutos mas continuar irrelevante em peso, ou vice-versa).

## Erros comuns a evitar
- Analisar AV e AH isoladamente, sem cruzar as duas leituras — uma conta pode ter AV pequena mas AH muito alta (crescimento acelerado de uma base pequena), o que merece menção mesmo que o peso absoluto ainda seja baixo.
- Usar como período-base um ano atípico (ex.: um ano de crise ou de evento não recorrente) sem alertar que isso distorce a leitura da AH.
- Comparar AV de contas de natureza diferente (ex.: comparar diretamente o % de Estoques sobre o Ativo com o % de Custos sobre a Receita) como se fossem a mesma grandeza — são bases de cálculo diferentes (Ativo Total vs. Receita Líquida).
-e 

---

# Índices de Liquidez

## Quando usar
Para responder se a empresa consegue honrar suas obrigações financeiras nos prazos devidos. São os índices mais olhados por credores e fornecedores no curto prazo, mas devem ser lidos em conjunto com a análise de capital de giro (Modelo Fleuriet) — liquidez contábil alta nem sempre significa liquidez financeira real, se a composição do ativo circulante for de baixa conversibilidade em caixa (ex.: estoque de giro lento).

## Dados necessários
Contas do Balanço Patrimonial: Ativo Circulante (e seu detalhamento — Disponibilidades, Aplicações Financeiras de curto prazo, Contas a Receber, Estoques), Passivo Circulante, Ativo Não Circulante, Passivo Não Circulante (Exigível a Longo Prazo).

## Liquidez Corrente (LC)
```
LC = Ativo Circulante / Passivo Circulante
```
Mostra quanto a empresa tem em ativos de curto prazo para cada R$ 1,00 de dívida de curto prazo. Regra prática (não universal — varia por setor): LC > 1 indica que o ativo circulante cobre o passivo circulante; mas um LC muito acima de 1 também pode indicar ativo circulante parado (ex.: estoque excessivo, contas a receber com prazo muito longo) em vez de eficiência.

## Liquidez Seca (LS)
```
LS = (Ativo Circulante - Estoques) / Passivo Circulante
```
Remove os estoques do cálculo, por serem o item de menor liquidez e conversibilidade mais incerta dentro do ativo circulante (dependem de venda). Mais rigoroso que a liquidez corrente, especialmente relevante em empresas com estoques de giro lento ou alto risco de obsolescência.

## Liquidez Imediata (LI)
```
LI = Disponibilidades / Passivo Circulante
```
Considera apenas caixa e equivalentes de caixa (e aplicações financeiras de liquidez imediata) contra o passivo circulante. É o índice mais conservador — mostra a capacidade de pagamento apenas com o que já está em caixa, sem depender de receber de clientes ou vender estoque.

## Liquidez Geral (LG)
```
LG = (Ativo Circulante + Realizável a Longo Prazo) / (Passivo Circulante + Exigível a Longo Prazo)
```
Amplia a análise para o longo prazo, comparando tudo que a empresa tem a receber (curto e longo prazo) contra tudo que ela deve (curto e longo prazo). Útil para avaliar a saúde financeira estrutural da empresa, não apenas sua capacidade de pagamento imediata.

## Como apresentar
Monte uma tabela com os 4 índices nas linhas e os períodos disponíveis nas colunas, para visualizar a evolução de cada um ao longo do tempo — não apenas o valor do período mais recente.

## Interpretação e sinais de alerta
- LC caindo período a período, especialmente se abaixo de 1, é sinal de alerta de curto prazo.
- Diferença muito grande entre LC e LS geralmente indica dependência forte de estoque para cobrir obrigações de curto prazo — investigue o giro de estoque (ver `atividade.md`) antes de concluir se isso é preocupante ou normal para o setor.
- LI muito baixa não é necessariamente ruim isoladamente (a maioria das empresas não mantém caixa parado), mas merece atenção se combinada com LC/LS também baixos.
- Sempre leia a liquidez em conjunto com a análise de capital de giro (Modelo Fleuriet, `capital_giro.md`) — ela explica se a operação da empresa está estruturalmente saudável ou se a liquidez aparente esconde dependência de dívida de curto prazo.

## Erros comuns a evitar
- Concluir que "quanto maior, melhor" sem qualificação — liquidez excessivamente alta pode indicar recursos ociosos (ineficiência de capital) em vez de solidez financeira.
- Analisar liquidez sem considerar o ciclo operacional da empresa — setores com ciclo de caixa muito curto (ex.: varejo com venda à vista) naturalmente operam com liquidez corrente mais baixa sem que isso seja um problema.
- Usar liquidez isolada para julgar risco de crédito sem cruzar com endividamento e geração de caixa operacional (EBITDA).
-e 

---

# Índices de Endividamento / Estrutura de Capital

## Quando usar
Para responder o quanto a empresa depende de capital de terceiros (dívida) em vez de capital próprio, e qual a qualidade dessa dívida (concentrada no curto ou no longo prazo). Endividamento alto não é necessariamente ruim — depende da capacidade de geração de caixa da empresa para honrar essa dívida (ver `dupont_ebitda.md` para os índices de cobertura) e do custo dessa dívida frente ao retorno que ela gera (alavancagem financeira).

## Dados necessários
Passivo Circulante, Passivo Não Circulante (Exigível a Longo Prazo), Patrimônio Líquido, Ativo Total, Ativo Permanente/Não Circulante (Investimentos + Imobilizado + Intangível).

## Endividamento Geral (Grau de Endividamento)
```
Endividamento Geral = (Passivo Circulante + Passivo Não Circulante) / Ativo Total
```
Mostra qual percentual do Ativo Total é financiado por capital de terceiros. O complemento (1 - Endividamento Geral) mostra o percentual financiado por capital próprio.

## Composição do Endividamento
```
Composição do Endividamento = Passivo Circulante / (Passivo Circulante + Passivo Não Circulante)
```
Mostra que fração da dívida total vence no curto prazo. Um índice alto (dívida concentrada no curto prazo) é mais arriscado, porque exige capacidade de pagamento ou de renovação (rolagem) mais frequente — merece atenção especial se crescente ao longo dos períodos.

## Participação de Capital de Terceiros sobre Capital Próprio (Grau de Alavancagem / Debt-to-Equity)
```
Capital de Terceiros / Capital Próprio = (Passivo Circulante + Passivo Não Circulante) / Patrimônio Líquido
```
Mostra quantos reais de dívida existem para cada real de capital próprio investido pelos acionistas. Quanto maior, maior a alavancagem financeira e, em geral, maior o risco financeiro — mas também potencialmente maior o retorno sobre o capital próprio (ver análise Dupont), desde que o retorno gerado pelos ativos supere o custo da dívida.

## Imobilização do Patrimônio Líquido
```
Imobilização do PL = Ativo Permanente (Investimentos + Imobilizado + Intangível) / Patrimônio Líquido
```
Mostra que proporção do capital próprio está aplicada em ativos de baixa liquidez (imobilizado, intangível). Um índice acima de 1 (100%) indica que a empresa financiou parte do seu ativo permanente com capital de terceiros, não apenas com capital próprio — o que não é necessariamente ruim, mas reduz a folga de capital próprio disponível para financiar o giro (capital de giro próprio).

## Imobilização de Recursos Não Correntes
```
Imobilização de Recursos Não Correntes = Ativo Permanente / (Patrimônio Líquido + Passivo Não Circulante)
```
Versão mais ampla do índice anterior, considerando também as dívidas de longo prazo como fonte legítima para financiar o ativo permanente. Um índice abaixo de 1 é geralmente mais saudável, pois indica que o ativo permanente está totalmente coberto por recursos de longo prazo (próprios ou de terceiros), sem precisar recorrer a dívida de curto prazo para financiar ativos fixos.

## Como apresentar
Monte uma tabela com os 5 índices nas linhas e os períodos nas colunas, destacando a tendência (crescente/decrescente/estável) de cada um.

## Interpretação e sinais de alerta
- Endividamento geral crescente ao longo dos períodos, especialmente se acompanhado de composição do endividamento também crescente (dívida cada vez mais concentrada no curto prazo), é um padrão de alerta combinado — a empresa está mais endividada e com dívida de qualidade pior (mais exigível no curto prazo).
- Imobilização de Recursos Não Correntes acima de 1 indica que parte do ativo permanente está sendo financiada por dívida de curto prazo — situação estruturalmente arriscada, pois desalinha o prazo do financiamento com o prazo de maturação/retorno do investimento.
- Sempre cruze o grau de endividamento com a capacidade de geração de caixa (índices de cobertura de dívida por EBITDA, ver `dupont_ebitda.md`) antes de classificar o endividamento como "alto demais" — uma empresa com endividamento elevado mas EBITDA robusto e estável pode ter risco de crédito controlado, enquanto uma empresa com endividamento moderado mas geração de caixa fraca ou volátil pode estar em situação mais arriscada.

## Erros comuns a evitar
- Julgar endividamento apenas pelo valor absoluto do índice, sem considerar o setor (setores de capital intensivo, como utilities e infraestrutura, operam estruturalmente com endividamento mais alto que setores de serviços).
- Tratar endividamento alto como sinônimo de risco alto sem checar o custo da dívida (taxa de juros média) frente à rentabilidade dos ativos — alavancagem financeira pode ser positiva (aumenta o ROE) quando bem administrada.
- Ignorar a composição do endividamento (curto vs. longo prazo) e olhar só o total — duas empresas com o mesmo grau de endividamento geral podem ter perfis de risco muito diferentes dependendo de quanto vence no curto prazo.
-e 

---

# Índices de Rentabilidade

## Quando usar
Para responder se a empresa gera retorno adequado sobre o que foi investido nela — seja sobre os ativos totais, seja especificamente sobre o capital dos acionistas. É o grupo mais olhado por investidores, mas precisa ser lido junto com a análise Dupont (`dupont_ebitda.md`) para entender quais alavancas (margem, giro, alavancagem) explicam o resultado, em vez de só reportar o número final.

## Dados necessários
Receita Líquida, Lucro Bruto, Lucro Operacional (EBIT), Lucro Líquido (todos da DRE); Ativo Total e Patrimônio Líquido (do Balanço, idealmente a média entre início e fim do período, quando disponível, para não distorcer o índice em empresas com crescimento acelerado de ativos/PL no período).

## Margem Bruta
```
Margem Bruta = Lucro Bruto / Receita Líquida
```
Mostra quanto sobra da receita depois de descontado o custo direto de produção/prestação do serviço, antes das despesas operacionais. Reflete o poder de precificação e a eficiência produtiva da empresa.

## Margem Operacional (Margem EBIT)
```
Margem Operacional = EBIT / Receita Líquida
```
Mostra a rentabilidade da operação em si, antes dos efeitos financeiros (juros) e tributários — útil para comparar empresas com estruturas de capital ou regimes tributários diferentes, já que remove esses efeitos.

## Margem Líquida
```
Margem Líquida = Lucro Líquido / Receita Líquida
```
Mostra quanto da receita efetivamente vira lucro para os acionistas, depois de todos os custos, despesas, juros e impostos.

## Retorno sobre o Ativo (ROA — Return on Assets)
```
ROA = Lucro Líquido / Ativo Total
```
Mostra a eficiência da empresa em gerar lucro a partir de todos os ativos que ela controla, independentemente de como esses ativos foram financiados (capital próprio ou de terceiros). Uma variação usa o EBIT em vez do Lucro Líquido no numerador (ROA operacional), para isolar o efeito da estrutura de capital e do imposto.

## Retorno sobre o Patrimônio Líquido (ROE — Return on Equity)
```
ROE = Lucro Líquido / Patrimônio Líquido
```
Mostra o retorno gerado especificamente sobre o capital investido pelos acionistas — é o índice de rentabilidade mais olhado por investidores de ações, já que mede diretamente o retorno sobre o que eles investiram. Compare sempre o ROE com o custo de capital próprio (Ke) da empresa: um ROE consistentemente abaixo do Ke indica destruição de valor para o acionista, mesmo que o lucro líquido seja positivo.

## Retorno sobre o Investimento (ROI — Return on Investment)
```
ROI = EBIT × (1 - alíquota de IR) / (Patrimônio Líquido + Dívida Onerosa)
```
Também chamado de ROIC (Return on Invested Capital) na literatura. Mede o retorno gerado sobre o capital total investido na operação (próprio + dívida onerosa, excluindo passivos operacionais como fornecedores), sendo o índice mais adequado para comparar a eficiência operacional da empresa independentemente da sua estrutura de financiamento. Compare sempre o ROIC com o WACC da empresa: ROIC > WACC indica geração de valor econômico; ROIC < WACC indica destruição de valor, mesmo com lucro contábil positivo.

## Giro do Ativo
```
Giro do Ativo = Receita Líquida / Ativo Total
```
Não é estritamente um índice de "rentabilidade" no sentido de margem, mas é a peça que conecta margem e rentabilidade sobre ativos na análise Dupont — mostra quantas vezes o ativo total "gira" em vendas ao longo do período. Ver `dupont_ebitda.md` para como esse índice se combina com a margem líquida para explicar o ROA.

## Como apresentar
Monte uma tabela com todos os índices nas linhas e os períodos nas colunas, e sempre que possível apresente a evolução em conjunto com a análise Dupont, que explica as causas por trás da variação do ROE/ROA.

## Interpretação e sinais de alerta
- Margem bruta caindo enquanto a margem líquida se mantém estável (ou vice-versa) indica que os fatores por trás da rentabilidade estão mudando — investigue se é custo de produção, despesas operacionais ou resultado financeiro que está compensando ou piorando a margem.
- ROE alto sustentado majoritariamente por alavancagem financeira (muito capital de terceiros, pouco capital próprio na base) em vez de por eficiência operacional é um padrão de risco — a análise Dupont deixa isso explícito, decompondo o ROE em margem, giro e alavancagem.
- Compare sempre ROE e ROIC/ROI com uma taxa de referência (custo de capital, taxa livre de risco, ou retorno médio do setor) — um "número bom" isolado, sem essa comparação, não diz se a empresa está de fato criando valor.

## Erros comuns a evitar
- Usar o Ativo Total ou o PL do final do período sem considerar que, em empresas com crescimento acelerado, isso pode distorcer o índice — quando os dados permitirem, use a média entre o saldo inicial e final do período.
- Comparar ROE de empresas com estruturas de capital muito diferentes sem qualificar que uma alavancagem maior tende a inflar o ROE, mesmo com rentabilidade operacional (ROIC) parecida.
- Analisar rentabilidade isoladamente sem cruzar com liquidez e endividamento — uma empresa pode ser rentável no papel e ainda assim ter problemas de caixa se o capital de giro (Modelo Fleuriet) estiver estruturalmente desequilibrado.
-e 

---

# Índices de Atividade / Eficiência (Prazos Médios)

## Quando usar
Para responder se a empresa gira estoque, recebe de clientes e paga fornecedores em prazos saudáveis. São os índices que conectam a operação do dia a dia (compras, vendas, cobrança, pagamento) à necessidade de capital de giro da empresa — por isso alimentam diretamente a análise de capital de giro (`capital_giro.md`).

## Dados necessários
Receita Líquida e Custo dos Produtos/Serviços Vendidos (CPV/CMV/CSV, da DRE); Estoques, Contas a Receber (Duplicatas a Receber/Clientes) e Fornecedores (do Balanço — idealmente a média entre saldo inicial e final do período, quando disponível, para suavizar distorções de sazonalidade).

## Prazo Médio de Estocagem (PME) / Giro de Estoque
```
PME (dias) = (Estoque Médio / CPV) × 360 (ou 365)

Giro de Estoque (vezes) = CPV / Estoque Médio
```
Mostra quantos dias, em média, a mercadoria/produto fica parado em estoque antes de ser vendido. Quanto menor o PME (ou maior o giro), mais eficiente a gestão de estoque — mas um PME baixo demais também pode indicar risco de ruptura de estoque (falta de produto), então a leitura deve considerar o contexto do setor.

## Prazo Médio de Recebimento de Vendas (PMR)
```
PMR (dias) = (Contas a Receber Médio / Receita Bruta ou Líquida) × 360 (ou 365)
```
Mostra quantos dias, em média, a empresa leva para receber de seus clientes após a venda. Um PMR crescente ao longo dos períodos é um sinal de alerta — pode indicar afrouxamento na política de crédito, dificuldade dos clientes em pagar, ou problemas na cobrança.

## Prazo Médio de Pagamento a Fornecedores (PMP)
```
PMP (dias) = (Fornecedores Médio / Compras do período) × 360 (ou 365)
```
Mostra quantos dias, em média, a empresa leva para pagar seus fornecedores. Quando o valor de "Compras" não está disponível diretamente, pode ser aproximado a partir do CPV ajustado pela variação de estoque: `Compras ≈ CPV + Estoque Final - Estoque Inicial`.

## Ciclo Operacional
```
Ciclo Operacional = PME + PMR
```
Mostra o tempo total, em dias, entre a compra da mercadoria/insumo e o recebimento da venda ao cliente — ou seja, quanto tempo o dinheiro fica "parado" no ciclo operacional da empresa (em estoque e depois em contas a receber) antes de voltar como caixa.

## Ciclo Financeiro (Ciclo de Caixa)
```
Ciclo Financeiro = Ciclo Operacional - PMP = PME + PMR - PMP
```
Mostra quantos dias a empresa precisa financiar a própria operação com capital próprio ou dívida, antes de fechar o ciclo (comprar, vender, receber, pagar). Quanto menor (ou até negativo) o ciclo financeiro, melhor — um ciclo financeiro negativo indica que a empresa recebe dos clientes antes de precisar pagar os fornecedores, o que é uma posição estruturalmente favorável de caixa (comum em varejo com venda à vista/curto prazo e fornecedores pagos a prazo mais longo).

## Como apresentar
Monte uma tabela com PME, PMR, PMP, Ciclo Operacional e Ciclo Financeiro nas linhas e os períodos nas colunas, destacando a tendência de cada um. Um gráfico de linha do ciclo financeiro ao longo do tempo costuma comunicar a tendência de forma mais clara do que só a tabela.

## Interpretação e sinais de alerta
- PMR crescendo mais rápido que o PMP é um padrão de alerta combinado — a empresa está demorando mais para receber e possivelmente mantendo ou reduzindo o prazo de pagamento, o que pressiona a necessidade de capital de giro.
- Ciclo financeiro crescente ao longo dos períodos indica que a empresa está precisando financiar uma fatia cada vez maior da própria operação — verifique se isso está sendo coberto por capital de giro próprio ou por dívida de curto prazo crescente (cruzar com `endividamento.md` e `capital_giro.md`).
- PME muito baixo combinado com relatos de ruptura de estoque (se o usuário mencionar) pode indicar gestão de estoque excessivamente enxuta, com risco de perda de vendas.

## Erros comuns a evitar
- Usar 360 ou 365 dias de forma inconsistente entre os índices dentro do mesmo relatório — escolha uma convenção e mantenha em todos os cálculos.
- Comparar prazos médios entre empresas de setores muito diferentes sem qualificação — o ciclo financeiro "normal" de uma indústria pesada é estruturalmente diferente do de um varejo de consumo rápido.
- Calcular PMR sobre a Receita Bruta em uma análise e sobre a Receita Líquida em outra sem manter consistência — isso distorce a comparação entre períodos.
-e 

---

# Capital de Giro (Modelo Fleuriet)

## Quando usar
Para responder se a operação da empresa gera ou consome caixa estruturalmente, e se ela depende de dívida de curto prazo para financiar o giro do negócio. É a análise que melhor complementa (e às vezes contradiz) a leitura simples dos índices de liquidez tradicionais — uma empresa pode ter liquidez corrente aparentemente saudável e, ainda assim, ter uma estrutura de capital de giro estruturalmente desequilibrada.

## Dados necessários
Reclassificação do Balanço Patrimonial em contas cíclicas, não cíclicas (permanentes/financeiras) e erráticas — ver reclassificação abaixo.

## Reclassificação do Balanço (Modelo Fleuriet)
O modelo reclassifica as contas do Balanço conforme sua natureza operacional, e não apenas pelo prazo contábil (circulante vs. não circulante):

**Ativo:**
- **Ativo Circulante Operacional/Cíclico (ACO)**: contas diretamente ligadas à operação, que se renovam continuamente — Estoques, Contas a Receber de Clientes, Adiantamentos a Fornecedores.
- **Ativo Circulante Financeiro/Errático (ACF)**: contas de curto prazo não ligadas diretamente à operação — Caixa, Bancos, Aplicações Financeiras de curto prazo.
- **Ativo Não Circulante (ANC/Permanente)**: Realizável a Longo Prazo, Investimentos, Imobilizado, Intangível.

**Passivo:**
- **Passivo Circulante Operacional/Cíclico (PCO)**: contas diretamente ligadas à operação — Fornecedores, Salários e Encargos a Pagar, Impostos a Pagar (operacionais).
- **Passivo Circulante Financeiro/Errático (PCF)**: dívida de curto prazo não ligada à operação — Empréstimos e Financiamentos de curto prazo, Duplicatas Descontadas.
- **Passivo Não Circulante (PNC/Permanente)**: Exigível a Longo Prazo (empréstimos e financiamentos de longo prazo) + Patrimônio Líquido.

## Necessidade de Capital de Giro (NCG)
```
NCG = Ativo Circulante Operacional (ACO) - Passivo Circulante Operacional (PCO)
```
Mede o quanto a operação do dia a dia (ciclo de compra-produção-venda-recebimento) exige de capital para se sustentar, considerando apenas as contas ligadas diretamente à atividade da empresa. Uma NCG positiva significa que a operação consome caixa estruturalmente (a empresa financia clientes e estoque por mais tempo do que é financiada por fornecedores) — situação comum na maioria das empresas, que precisa então ser coberta por fontes de financiamento adequadas (ver CDG abaixo).

## Capital de Giro (CDG) — também chamado de Capital Circulante Líquido (CCL)
```
CDG = Passivo Não Circulante (PNC) - Ativo Não Circulante (ANC)
```
Equivalente a: `CDG = (Patrimônio Líquido + Exigível a Longo Prazo) - Ativo Não Circulante`. Mede o quanto de recursos de longo prazo (próprios ou de terceiros) sobra depois de financiar o ativo permanente — esse excedente é a fonte "saudável" de financiamento para cobrir a NCG. Um CDG positivo indica que a empresa financia seu ativo permanente inteiramente com recursos de longo prazo, com sobra para financiar parte do giro.

## Saldo de Tesouraria (ST)
```
ST = CDG - NCG
```
Equivalente a: `ST = Ativo Circulante Financeiro (ACF) - Passivo Circulante Financeiro (PCF)`. É o indicador central do Modelo Fleuriet — mostra se a empresa tem folga financeira de curto prazo (ST positivo) ou se depende de dívida financeira de curto prazo para cobrir a diferença entre o que a operação exige (NCG) e o que os recursos de longo prazo cobrem (CDG).

## Classificação de estrutura financeira (combinando os três indicadores)
Cruzando os sinais de CDG, NCG e ST, o Modelo Fleuriet classifica a estrutura financeira da empresa em tipos, do mais sólido ao mais arriscado:

| Tipo                 | CDG | NCG | ST  | Leitura                                                                                                                                            |
| -------------------- | --- | --- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Excelente            | +   | −   | +   | Situação financeira muito confortável; operação não consome capital de giro (raro fora de setores como varejo com venda à vista)                   |
| Sólida               | +   | +   | +   | CDG cobre a NCG com folga; situação financeira saudável                                                                                            |
| Insatisfatória       | +   | +   | −   | CDG não cobre integralmente a NCG; a empresa recorre a dívida de curto prazo para cobrir parte do giro — merece atenção                            |
| Alto Risco           | −   | +   | −   | CDG negativo (ativo permanente parcialmente financiado por dívida de curto prazo) e ainda assim precisa financiar a NCG; situação de risco elevado |
| Muito Ruim           | −   | −   | −   | Situação financeira crítica em qualquer cenário                                                                                                    |
| Alto Risco (atípica) | −   | −   | +   | Combinação incomum; investigar a natureza específica da NCG negativa antes de concluir                                                             |

Nem toda combinação teórica é comum na prática — a mais frequente e mais informativa costuma ser a distinção entre "Sólida" e "Insatisfatória"/"Alto Risco", que é onde a maioria das empresas reais se encontra.

## Como apresentar
Monte uma tabela com NCG, CDG e ST nas linhas e os períodos nas colunas, e classifique explicitamente o tipo de estrutura financeira em cada período usando a tabela acima. Um gráfico de linha comparando a evolução de CDG, NCG e ST ao longo do tempo é especialmente útil aqui, porque a relação entre as três linhas (e não o valor isolado de cada uma) é o que conta a história.

## Interpretação e sinais de alerta
- ST negativo e piorando ao longo dos períodos é o sinal de alerta mais direto do modelo — indica dependência crescente de dívida de curto prazo para financiar o giro da operação, independentemente do que os índices de liquidez tradicionais (que não fazem essa reclassificação) possam sugerir.
- NCG crescendo mais rápido que a Receita Líquida indica perda de eficiência operacional (ciclo financeiro alongando — cruzar com `atividade.md`) mesmo que a empresa esteja crescendo.
- Sempre leia o resultado do Modelo Fleuriet ao lado da liquidez corrente tradicional (`liquidez.md`) — quando os dois divergem (ex.: liquidez corrente > 1 mas ST negativo), explique a divergência para o usuário: normalmente acontece porque a liquidez corrente não distingue contas operacionais de financeiras, enquanto o Modelo Fleuriet sim.

## Erros comuns a evitar
- Reclassificar contas erroneamente entre cíclicas e financeiras — por exemplo, tratar "Empréstimos de curto prazo" como PCO em vez de PCF, o que distorce completamente o cálculo do ST.
- Aplicar o modelo sem dados detalhados o suficiente do Balanço (ex.: só o total do Passivo Circulante, sem separar Fornecedores de Empréstimos de curto prazo) — nesse caso, avise o usuário que a reclassificação está sendo feita com aproximações, e quais.
- Concluir sobre risco financeiro olhando um único período — o Modelo Fleuriet ganha muito mais força interpretativa quando mostra a tendência do ST ao longo de vários períodos.
-e 

---

# Análise Dupont e Indicadores de EBITDA

## Quando usar
A análise Dupont decompõe o ROE nas alavancas que efetivamente o explicam (margem, giro, alavancagem), em vez de apresentá-lo como um número isolado — é o complemento natural de qualquer análise de rentabilidade (`rentabilidade.md`). Os indicadores de EBITDA e cobertura de dívida respondem se a empresa gera caixa operacional suficiente para honrar sua dívida — o complemento natural da análise de endividamento (`endividamento.md`).

## Dados necessários
Receita Líquida, Lucro Líquido, EBIT/Lucro Operacional, Depreciação e Amortização (da DRE ou notas explicativas); Ativo Total, Patrimônio Líquido, Dívida Financeira (Empréstimos e Financiamentos de curto e longo prazo), Despesas Financeiras/Juros (do Balanço e DRE).

## Análise Dupont

### Modelo de 3 fatores
```
ROE = Margem Líquida × Giro do Ativo × Multiplicador de Alavancagem Financeira

Margem Líquida = Lucro Líquido / Receita Líquida
Giro do Ativo = Receita Líquida / Ativo Total
Multiplicador de Alavancagem Financeira = Ativo Total / Patrimônio Líquido
```
Decompõe o ROE em três alavancas independentes: (1) quanto a empresa lucra sobre cada real vendido (margem), (2) quão eficientemente ela usa os ativos para gerar vendas (giro), e (3) o quanto ela se apoia em capital de terceiros em vez de capital próprio para financiar o ativo (alavancagem). Multiplicando as três, chega-se de volta ao ROE — mas agora com a causa raiz explícita.

### Como interpretar a decomposição
Ao comparar dois períodos (ou duas empresas) com ROE parecido, verifique qual das três alavancas está impulsionando o resultado:
- **ROE alto puxado por margem e giro**: rentabilidade operacional genuína — sinal mais saudável.
- **ROE alto puxado majoritariamente por alavancagem financeira** (multiplicador alto, margem e giro medianos ou baixos): o retorno ao acionista está sendo "turbinado" por dívida — pode ser uma estratégia válida, mas aumenta o risco financeiro e merece ser explicitado, especialmente se o endividamento (`endividamento.md`) já estiver em nível alto.

Monte uma tabela mostrando os 3 fatores e o ROE resultante lado a lado, por período, para deixar visível qual fator mais mudou de um período para o outro.

## Indicadores de EBITDA

### Cálculo do EBITDA
```
EBITDA = EBIT (Lucro Operacional) + Depreciação e Amortização
```
Aproxima a geração de caixa operacional da empresa, antes dos efeitos de juros, impostos, depreciação e amortização — é a métrica mais usada por credores e analistas de crédito para avaliar capacidade de pagamento de dívida, por ser menos afetada por decisões contábeis/financeiras não-operacionais.

### Margem EBITDA
```
Margem EBITDA = EBITDA / Receita Líquida
```
Mostra a eficiência de geração de caixa operacional em relação à receita — útil para comparar empresas do mesmo setor com estruturas de depreciação/amortização diferentes.

### Dívida Líquida / EBITDA
```
Dívida Líquida = (Empréstimos e Financiamentos de curto e longo prazo) - Disponibilidades e Aplicações Financeiras

Dívida Líquida / EBITDA = Dívida Líquida / EBITDA (do período, geralmente anualizado)
```
O indicador de alavancagem mais usado no mercado de crédito — mostra, em anos, quanto tempo a empresa levaria para quitar sua dívida líquida usando toda a geração de caixa operacional (EBITDA), mantendo tudo constante. Quanto menor, melhor a capacidade de pagamento. Limiares variam muito por setor (empresas de capital intensivo, como utilities, toleram múltiplos mais altos que empresas de serviços), então compare sempre com benchmarks do setor em vez de um limiar genérico.

### Cobertura de Juros (Interest Coverage Ratio)
```
Cobertura de Juros = EBIT / Despesas Financeiras (Juros)
```
Mostra quantas vezes o resultado operacional cobre as despesas financeiras (juros) do período. Um índice caindo ao longo dos períodos, mesmo que ainda acima de 1, é um sinal de alerta antecedente — indica que a folga entre geração operacional e o custo da dívida está diminuindo.

## Como apresentar
Apresente a decomposição Dupont e os indicadores de EBITDA em tabelas separadas (são leituras diferentes — uma sobre rentabilidade ao acionista, outra sobre capacidade de pagamento de dívida), mas conecte as duas na conclusão: alavancagem financeira alta (do Dupont) só é sustentável se a cobertura de dívida por EBITDA (Dívida Líquida/EBITDA e Cobertura de Juros) também estiver saudável.

## Interpretação e sinais de alerta
- Dívida Líquida/EBITDA crescente ao longo dos períodos, especialmente combinado com margem EBITDA em queda, é um padrão de alerta combinado (a dívida cresce e a capacidade de gerá-la a partir da operação piora ao mesmo tempo).
- Cobertura de Juros abaixo de 2-3x já costuma ser vista com cautela por credores, mas o limiar exato depende do setor e da estabilidade do EBITDA (empresas com EBITDA volátil precisam de mais folga que empresas com EBITDA estável).
- No Dupont, um multiplicador de alavancagem financeira crescente junto com margem e giro estáveis ou em queda indica que o ROE está sendo sustentado cada vez mais por dívida — vale destacar isso explicitamente mesmo que o ROE em si pareça "bom" no período.

## Erros comuns a evitar
- Calcular EBITDA anualizando incorretamente um período parcial (ex.: multiplicar por 4 um EBITDA trimestral sem considerar sazonalidade) — quando os dados forem trimestrais, avise que a anualização é uma aproximação.
- Comparar Dívida Líquida/EBITDA entre setores muito diferentes sem qualificação — não existe um limiar universal "bom" ou "ruim" para esse índice.
- Interpretar um ROE alto como sinal inequivocamente positivo sem checar, via Dupont, se ele vem de eficiência operacional ou de alavancagem — as duas situações têm implicações de risco muito diferentes.
-e 

---

