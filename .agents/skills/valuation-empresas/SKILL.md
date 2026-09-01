---
name: valuation-empresas
description: Guides an agent through company valuation using multiple methodologies — Discounted Cash Flow (DCF), Market Multiples (EV/EBITDA, P/E, EV/Revenue, ARR), Asset-Based Approach (book value, adjusted, liquidation), and methods for startups/pre-revenue companies (Berkus Method, Scorecard Method, Venture Capital Method, Cost-to-Duplicate). Use this skill whenever the user asks to "value", "price", or "do a valuation" of a company, startup, or business, asks to calculate the fair value/market value of a company, mentions terms like DCF, WACC, EV/EBITDA, market multiples, book value, or asks to structure a valuation report — even if the user mentions only one method, or asks to "cross-check methods" or "validate the valuation with multiple approaches".
---

# Company Valuation

## Overview

This skill structures the process of valuing a company using multiple complementary methodologies. No single method is definitive — each has different assumptions and limitations, and market practice (investment banks, PE/VC funds, consultancies) is to always cross-check at least 2 methods to arrive at a value range (not a single number), and to explain any divergence between them.

The agent's role here isn't just to "run the formula," but to: (1) understand the company's stage and choose the applicable methods, (2) gather assumptions with the user when data is missing, (3) do the calculations transparently and auditably, and (4) present results as a value range with each method's logic made explicit — never a single number without context, since that conveys a false sense of precision valuation doesn't actually have.

## Step 1 — Diagnose the company and choose the methods

Before calculating anything, understand the company's stage. This determines which methods make sense (applying DCF to a pre-revenue startup, for example, produces a meaningless number, since there's no cash flow history to project):

| Company stage                                                                              | Recommended methods                                                             |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Established, revenue history and predictable cash flow                                     | DCF (primary) + Market Multiples (cross-validation)                             |
| Asset-intensive (industrial, real estate, holding company) or in restructuring/liquidation | Asset-Based Approach (primary) + DCF or Multiples if there's a viable operation |
| M&A, quick transaction, sector benchmarking                                                | Market Multiples (primary)                                                      |
| Startup in operation with some traction/revenue, but no long history                       | Venture Capital Method + Multiples (ARR, EV/Revenue)                            |
| Pre-revenue startup or idea/prototype stage                                                | Berkus, Scorecard, and/or Cost-to-Duplicate (combined qualitative methods)      |

If the user doesn't make the company's stage clear, ask or infer it from what they've described (e.g., "we have ARR of X" already signals a SaaS company with recurring revenue; "we don't have a finished product yet" signals pre-revenue). Don't automatically default to DCF just because it's the "most rigorous" method — the right method is the one that fits the available data.

Whenever possible, apply more than one method and present the results side by side (e.g., in a table), highlighting where they converge and where they diverge, and proposing a hypothesis for why.

## Step 2 — Gather the necessary data

Each method requires different inputs — see the method's reference file for the full list. As a general rule, data comes from two sources:
- **Data provided by the user**: financial statements (income statement, balance sheet, cash flow statement), internal projections, cap table, previous funding rounds.
- **Market data the skill should look up**: multiples from comparable companies, risk-free rate, market risk premium, sector beta, discount rates VCs typically use for the stage/sector in question. Use web search for this rather than estimating from memory — this data changes frequently and goes stale fast.

If essential data is missing (e.g., terminal growth rate, WACC, projected EBITDA), don't silently make up numbers. Assume reasonable assumptions and document them explicitly in the report, making clear they are estimates and how sensitive the result is to them (see Step 4 — sensitivity analysis).

## Step 3 — Apply the methods

Consult the corresponding reference file for detailed mechanics, formulas, and examples of each method:

- `references/dcf.md` — Discounted Cash Flow (DCF): FCFF projection, WACC, terminal value.
- `references/multiples.md` — Market multiples: EV/EBITDA, P/E, EV/Revenue, ARR multiples, comparable selection.
- `references/asset_based.md` — Asset-based approach: book value, adjusted book value, liquidation value.
- `references/startups.md` — Startup/pre-revenue methods: Berkus, Scorecard, Venture Capital Method, Cost-to-Duplicate.

When applying any method, show the calculation step by step (not just the final result) so the user can audit and adjust assumptions. Use a table or spreadsheet when the numbers have multiple rows (e.g., year-by-year cash flow projection).

## Step 4 — Consolidate, run sensitivity analysis, and present

1. **Value range, not a single point**: sum or compare the results of the applied methods and present a range (e.g., $40M–$55M), not an isolated number — this better reflects the real uncertainty of the exercise.
2. **Sensitivity analysis**: for DCF and the VC Method in particular, show how the value changes with variations in the most impactful assumptions (WACC, terminal growth rate, investor's required IRR, exit multiple). A sensitivity table (2 or 3 variables) is more useful than a single scenario.
3. **State assumptions and limitations clearly**: every valuation report should make clear which assumptions were used, where they came from (provided by the user vs. estimated/researched), and what the main limitations of the exercise are.
4. **Don't give investment advice**: valuation is a technical estimate, not a buy/sell/investment recommendation. When delivering the result, make clear it's an estimate based on the assumptions discussed, and that investment decisions should factor in additional context (legal, due diligence, negotiation).

## Output format

For complete valuation exercises (multiple methods, several assumptions, sensitivity tables), organize the result as a document rather than just plain chat text — this usually works best as a Word (.docx) or spreadsheet (.xlsx), depending on what the user needs to deliver (report/opinion → docx; model with editable projections and formulas → xlsx). For quick questions about a single method or a fast calculation, answer directly in the conversation.
-e 

---

# Discounted Cash Flow (DCF)

## When to use
Companies with revenue history, cash flow predictability, and enough operational maturity to support 5-to-10-year projections with reasonable confidence. It's considered the most technically rigorous method, but also the most sensitive to assumptions — small changes in WACC or the terminal growth rate can meaningfully shift the final value. Always pair the result with a sensitivity analysis.

## Required data
- Historical financial statements (income statement, balance sheet, cash flow statement) — at least 2-3 years, to calculate historical margins and growth rates.
- Revenue, cost, operating expense, capex, and working capital projections for the projection horizon (usually 5 to 10 years).
- Capital structure (debt vs. equity) to calculate WACC.
- Effective income tax rate.
- Terminal growth rate (g) — generally close to or equal to the long-term expected GDP growth of the country/sector.

## Step by step

### 1. Project Free Cash Flow to the Firm (FCFF)

```
FCFF = EBIT × (1 - tax rate)
     + Depreciation & Amortization
     - CAPEX (fixed asset investments)
     - Change in Working Capital
```

Project this line for each year of the horizon (t = 1 to n). Use the growth and margin assumptions discussed with the user, or researched based on sector benchmarks if not provided.

### 2. Calculate the discount rate (WACC)

```
WACC = (E/V × Ke) + (D/V × Kd × (1 - T))
```

Where:
- `E` = market value of equity, `D` = market value of debt, `V = E + D`
- `Ke` = cost of equity (usually via CAPM: `Ke = Rf + β × (Rm - Rf)`)
- `Kd` = cost of debt (the company's average borrowing rate)
- `T` = income tax rate

For `Rf` (risk-free rate), `Rm - Rf` (market risk premium), and `β` (sector beta), look up current market data rather than using values from memory — these rates change frequently.

### 3. Calculate the Terminal Value

Perpetuity growth model (Gordon Growth), the most common approach:

```
Terminal Value = FCFF_(n+1) / (WACC - g) = [FCFF_n × (1 + g)] / (WACC - g)
```

Alternative: exit multiple method, applying a market EBITDA multiple to the last projected year.

### 4. Discount everything to present value

```
Enterprise Value (EV) = Σ [FCFF_t / (1 + WACC)^t]  for t = 1 to n
                       + Terminal Value / (1 + WACC)^n
```

### 5. From enterprise value to equity value

If the goal is equity value (what matters to a shareholder), subtract net debt:

```
Equity Value = Enterprise Value (EV) - Net Debt
```

## Sensitivity analysis
Build a two-way table varying WACC (e.g., -1pp, base, +1pp) against the terminal growth rate g (e.g., -0.5pp, base, +0.5pp), showing the resulting Enterprise Value for each combination. This makes explicit how much the result depends on these two key assumptions.

## Common mistakes to avoid
- Using a terminal growth rate (g) higher than the WACC or higher than the economy's long-term growth rate — this produces unrealistically high or even negative/undefined values.
- Mixing nominal cash flows with a real discount rate (or vice versa) — keep them consistent.
- Forgetting to adjust for working capital and capex in the projection years, treating FCFF as if it were just accounting profit.
-e 

---

# Market Multiples (Relative Valuation)

## When to use
Quick market valuations, M&A transactions, and as a cross-check on the results of other methods (especially DCF). It's fast to apply, but depends heavily on the quality and comparability of the peer group used as reference — a poorly chosen comparable set invalidates the result.

## Selecting the comparable group
Before applying any multiple, build (or ask the user for) a group of comparable companies. Comparability criteria, in order of importance:
1. Same sector/business model (e.g., B2B SaaS, food retail, mining).
2. Similar size (revenue, EBITDA, headcount).
3. Similar growth stage (a mature company vs. one in hyper-growth have very different multiples).
4. Similar geography (emerging market multiples tend to diverge from developed market ones).

If the user doesn't provide a comparable group, research recent M&A transactions in the sector or comparable publicly listed companies via web search, and make clear in the report which sources/companies were used.

## Most common multiples

### EV/EBITDA
```
Enterprise Value (EV) = EV/EBITDA Multiple (from comparables) × EBITDA (of the company being valued)
```
The most widely used multiple for companies with meaningful operating cash generation, since it's neutral to capital structure (it compares operating value, not equity).

### P/E (Price to Earnings)
```
Market Value (Equity Value) = P/E Multiple (from comparables) × Net Income (of the company being valued)
```
More sensitive to capital structure and non-operating items (e.g., one-off events that distort net income) than EV/EBITDA — use with caution if net income contains atypical items.

### EV/Revenue
```
Enterprise Value (EV) = EV/Revenue Multiple (from comparables) × Revenue (of the company being valued)
```
Useful when the company doesn't yet have positive EBITDA or net income (common in fast-growing companies or SaaS businesses still in expansion mode), since EBITDA and P/E wouldn't apply.

### ARR Multiple (Annual Recurring Revenue)
```
Company Value = ARR Multiple (from SaaS sector comparables) × ARR (of the company being valued)
```
Specific to recurring-revenue businesses (SaaS). ARR multiples vary a lot with growth rate, net revenue retention (NRR), and gross margin — when researching comparables, try to control for these factors too, not just the sector.

## Step by step
1. Define the comparable group (see above).
2. Calculate the relevant multiple for each company in the group (e.g., EV/EBITDA for each comparable).
3. Consolidate a representative statistic for the group — the median is generally preferable to the mean, since it's less sensitive to outliers.
4. Apply the consolidated multiple to the corresponding metric of the company being valued (EBITDA, net income, revenue, or ARR).
5. Present a range (e.g., using the 1st and 3rd quartile of the group's multiples) rather than a single value based only on the median.

## Common mistakes to avoid
- Comparing EV/EBITDA (capital-structure neutral) with P/E (not neutral) without adjusting the interpretation — these are different concepts.
- Using too few comparable companies (2-3) without flagging the low statistical robustness of the result to the user.
- Ignoring margin, growth, and risk differences between the company being valued and the comparable group — applying the raw multiple with no qualitative adjustment can be misleading.
-e 

---

# Asset-Based Approach (Book Value / Liquidation)

## When to use
Asset-intensive companies (industrials, real estate, holding companies) or companies in restructuring/liquidation, where asset value is more relevant (or more reliable) than future cash-generation capacity. It also serves as a "floor" reference alongside DCF or multiples — the going-concern value of a company should rarely fall below the liquidation value of its assets.

## Required data
- Most recent balance sheet (assets and liabilities).
- For the adjusted approach: appraisal reports or current market value estimates for major assets (real estate, equipment, inventory, brands/patents).
- For liquidation value: estimated forced-sale discounts for each asset class, and liabilities to be settled (including the costs of the liquidation itself, such as severance payments and legal fees).

## Variations

### Book Value
```
Book Value = Shareholders' Equity (as recorded on the balance sheet)
            = Total Assets - Total Liabilities
```
The simplest and fastest method, but it reflects historical acquisition values (historical cost), not current market values — it can significantly under- or over-state the real value of assets, especially real estate and older brands.

### Adjusted Book Value
```
Adjusted Book Value = (Assets restated at market value) - (Liabilities restated at market value)
```
Each relevant balance sheet line is restated individually:
- Real estate and land → current market value (real estate appraisal or market comparables).
- Machinery and equipment → replacement or market value, net of actual depreciation (not just accounting depreciation).
- Inventory → net realizable value.
- Intangibles (brands, patents, customer base) → if material, consider specific intangible-asset valuation methodologies (e.g., relief-from-royalty), which is outside the scope of this skill — flag this to the user if relevant.
- Contingencies and unrecorded liabilities (e.g., probable labor/tax liabilities) → include as a liability adjustment even if not on the accounting balance sheet.

### Liquidation Value
```
Liquidation Value = Σ (forced-sale value of each asset) - Total liabilities - Liquidation costs
```
Forced-sale value is typically lower than normal market value (liquidation discount), since it reflects a short timeframe to sell the assets. The discount varies by asset class — real estate and liquid assets have a smaller discount; specialized inventory, highly specific equipment, and intangibles usually have a larger discount (sometimes intangibles go to zero in a liquidation, since they depend on the company being a going concern to have value).

## Step by step
1. Start from the most recent available balance sheet.
2. Decide which variation is appropriate (book value = fast/approximate; adjusted = more precise but requires more data; liquidation = forced-sale scenario).
3. For the adjusted or liquidation approach, restate relevant assets and liabilities item by item, documenting the source or assumption behind each restatement.
4. Add the adjustments to the original book value to arrive at the final value.

## Common mistakes to avoid
- Using pure book value for companies with old assets (e.g., real estate bought decades ago) without flagging that this likely understates real market value.
- Ignoring relevant contingent liabilities (labor, tax, environmental) that don't appear on the balance sheet but reduce the real value available to shareholders.
- Applying this approach in isolation to a healthy operating company without cross-checking against DCF or multiples — asset value tends to ignore the value of the business as a going concern (goodwill, customer relationships, market position), which can significantly understate the real value of a profitable company.
-e 

---

# Methods for Startups and Pre-Revenue / Early-Stage Companies

## When to use
Early-stage startups rarely have enough financial history or profit to reliably support a DCF or traditional multiples. These methods are more qualitative and serve to anchor a negotiation (e.g., between a founder and an investor), not to arrive at an objective "true value" — make this clear to the user. In practice, it's common to apply more than one method (e.g., Scorecard + VC Method) and use the average or resulting range as a negotiation starting point.

## Berkus Method
Assigns a fixed dollar value to 5 criteria, each capped at a ceiling (traditionally $500K per pillar, but the cap can be adjusted to the local market/currency — ask or adjust as needed):

| Criterion                | What it evaluates                                                       |
| ------------------------ | ----------------------------------------------------------------------- |
| Sound Idea               | Quality and originality of the core idea, size of the problem it solves |
| Prototype                | Existence of a functional product/MVP, reduces technology risk          |
| Quality Management Team  | Experience, complementarity, and track record of the team               |
| Strategic Relationships  | Partnerships, distribution channels, already-validated anchor clients   |
| Product Rollout or Sales | Initial real sales or user traction, reduces execution risk             |

```
Valuation (Berkus) = Σ (value assigned to each of the 5 criteria, up to the cap per criterion)
```
Sum the values assigned to each criterion (typically between 0 and the defined cap) to arrive at the company's pre-money value.

## Scorecard Method (Bill Payne Method)
Compares the startup to the average of other startups in the same sector and stage in the same region, applying weights to key factors:

```
Valuation = Average Regional/Sector Pre-Money Valuation × Σ (factor weight × comparative factor)
```

Typical factors and usual weights (adjustable by sector):
- Strength of the team (0-30%)
- Size of the opportunity/market (0-25%)
- Product/technology (0-15%)
- Competitive environment (0-10%)
- Marketing/sales channels/partnerships (0-10%)
- Need for additional investment (0-5%)
- Other factors (0-5%)

For each factor, compare the startup being valued to the market average (e.g., 1.0 = equal to the average, 1.25 = 25% above average, 0.8 = 20% below average). Multiply each comparative factor by its weight, sum everything, and multiply by the average regional/sector pre-money valuation reference (data that needs to be researched — look up market reports or VC/accelerator databases for this reference).

## Venture Capital Method
Starts from the expected exit value and discounts it by the investor's required return, accounting for future dilution.

### Step by step
1. **Estimate the Exit Value** projected 5-7 years out, typically by applying a market multiple (e.g., sector EV/EBITDA or EV/Revenue) to the company's projected revenue or EBITDA in the exit year.
2. **Calculate the required ROI** based on the investor's expected IRR (internal rate of return) for the period, typically between 30% and 50% per year for early-stage investments (the earlier the stage and the higher the risk, the higher the required IRR):
```
Required ROI = (1 + IRR)^(number of years to exit)
```
3. **Calculate the Post-Money Valuation**:
```
Post-Money Valuation = Projected Exit Value / Required ROI
```
4. **Calculate the Pre-Money Valuation**, subtracting the investment being made in this round:
```
Pre-Money Valuation = Post-Money Valuation - Current Investment
```
5. **Adjust for future dilution** (optional, but recommended): if the company will raise more rounds before exit, the current investor's stake will be diluted. Adjust the ownership percentage required in this round to compensate for expected future dilution, or apply a direct dilution factor to the calculated Post-Money value.

### Sensitivity analysis
Since the required IRR and the exit multiple are the most uncertain and impactful assumptions, build a sensitivity table crossing different IRRs (e.g., 30%, 40%, 50%) with different exit multiples, showing the resulting Pre-Money Valuation for each combination.

## Cost-to-Duplicate
Estimates how much it would cost, in time, development, and infrastructure, to recreate the startup's product or technology from scratch.

```
Valuation (Cost-to-Duplicate) = Product/technology development cost
                                + Cost of infrastructure already built
                                + Intellectual property/patent costs already incurred
                                (typically excludes brand value, market traction, or future potential)
```
Usually considered a conservative floor value (it doesn't capture intangibles like brand, traction, or market potential), so it works best as a counterpoint reference to other methods, not as an isolated final value.

## General recommendations for startup methods
- Whenever possible, apply 2 methods and compare (e.g., Scorecard + VC Method), highlighting the logic of each — they capture different aspects (qualitative vs. based on the investor's expected return).
- Make it explicit that these values serve as a starting point for negotiation between founders and investors, not as an objective "true value" of the company.
- For Scorecard's average reference valuations and the VC Method's exit multiples, look up current market data (e.g., accelerator reports, VC association data, databases like Crunchbase/PitchBook if accessible) rather than estimating from memory, since these values vary a lot by region, sector, and market timing.
-e 

---


