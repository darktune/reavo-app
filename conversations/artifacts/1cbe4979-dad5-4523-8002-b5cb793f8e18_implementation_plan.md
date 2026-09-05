# SIPHOON — Phase 1 MVP Implementation Plan

> Personal Forex Intelligence, Research, Journaling, Quantitative Analysis & Decision-Support OS

## Overview

Phase 1 builds the **foundation**: authentication, the command center dashboard, a production-grade trade journal, forex calculators with real math, performance analytics, strategy tracking, knowledge notes, and basic AI chat. Every component is real — no fake data, no placeholder buttons, no mock AI.

> [!IMPORTANT]
> **This plan covers Phase 1 only.** Phases 2–4 (live market data, TradingView webhooks, backtesting, Monte Carlo, ML, market replay, etc.) will be planned after Phase 1 is stable and validated.

---

## User Review Required

> [!IMPORTANT]
> **AI Provider**: The AI chat and trade reviewer need an LLM API. The plan uses a provider-agnostic adapter architecture, but which provider(s) do you want to configure first? (OpenAI, Anthropic, Google Gemini, local Ollama, or multiple?)

> [!WARNING]
> **Database**: This plan uses PostgreSQL via Prisma. Do you have a PostgreSQL instance available (local, Docker, Supabase, Neon, etc.)? If not, I'll include Docker Compose setup.

> [!IMPORTANT]
> **Authentication scope**: Since SIPHOON is a *personal* trading OS, should auth be simple email/password (single user), or do you want OAuth providers (GitHub, Google) for future multi-user support?

---

## Open Questions

1. **Deployment target**: Vercel, self-hosted, Docker, or local-only for now?
2. **File storage**: For chart screenshots and attachments — local filesystem, S3-compatible (MinIO/R2/S3), or Supabase Storage?
3. **AI budget**: Should AI features call external APIs (cost per request) or should I prioritize local/Ollama support first?
4. **Broker data**: Do you have any existing trade history (CSV/Excel) you want to import on day one?

---

## Tech Stack (Phase 1)

| Layer | Technology | Rationale |
|:---|:---|:---|
| Framework | Next.js 15 (App Router) | RSC, Server Actions, streaming |
| Language | TypeScript (strict) | Type safety across entire stack |
| Styling | Tailwind CSS v4 | CSS-first config, OKLCH, Oxide engine |
| UI Components | shadcn/ui | Zero-runtime, copy-paste ownership |
| Financial Charts | `lightweight-charts` | 60 FPS canvas, native candlestick, 35KB |
| Dashboard Charts | shadcn/ui Chart (Recharts) | KPI area/bar/line/donut charts |
| Animations | `motion` (`motion/react`) | Subtle, restrained transitions |
| Database | PostgreSQL + Prisma | Type-safe ORM, migrations, relations |
| Auth | Auth.js v5 | Native Next.js 15, JWT sessions |
| Validation | Zod | Schema validation everywhere |
| Forms | react-hook-form + Zod | Type-safe forms with inline errors |
| Command Palette | cmdk (via shadcn) | Cmd+K navigation and actions |
| State | React Server Components + URL state | Minimal client state, no Redux |
| AI | Provider-agnostic adapter | OpenAI/Anthropic/Gemini/Ollama |
| Search | PostgreSQL full-text + `pg_trgm` | Phase 1 search (pgvector in Phase 2) |

---

## Proposed Changes

### 1. Project Scaffold & Configuration

Bootstrap the Next.js 15 project with TypeScript strict mode, Tailwind CSS v4, and all tooling.

#### [NEW] `package.json`
Core dependencies: `next`, `react`, `typescript`, `tailwindcss`, `prisma`, `@prisma/client`, `next-auth`, `zod`, `react-hook-form`, `@hookform/resolvers`, `lightweight-charts`, `motion`, `recharts`, `cmdk`, `lucide-react`, `date-fns`, `decimal.js` (for precise financial math), `next-safe-action`.

#### [NEW] `src/app/globals.css`
Tailwind v4 theme with SIPHOON's monochrome design system. OKLCH color tokens for the premium black-and-white aesthetic. Dark mode as default.

#### [NEW] `src/app/layout.tsx`
Root layout: font loading (Geist Sans + Geist Mono), theme provider, auth session provider, metadata.

#### [NEW] `.env.example`
Template for all environment variables (database, auth, AI keys).

#### [NEW] `docker-compose.yml`
PostgreSQL 16 + optional Redis for development.

---

### 2. Database Schema (Prisma)

The normalized relational schema covering all Phase 1 entities. Designed for immutable audit history on trades and predictions.

#### [NEW] `prisma/schema.prisma`

**Core tables for Phase 1:**

| Table | Purpose | Key Fields |
|:---|:---|:---|
| `User` | Authentication & profile | id, email, name, settings |
| `Account` | Trading accounts | equity, currency, broker, leverage |
| `Trade` | Every trade entry | 40+ fields (see §5 of spec) |
| `TradeEvidence` | Attachments per trade | screenshots, PDFs, URLs, notes |
| `Strategy` | Named strategies | name, description, rules, status, maturity |
| `Setup` | Reusable setups within strategies | name, entry rules, confirmation, invalidation |
| `JournalEntry` | Daily/session journal notes | date, content, mood, lessons |
| `KnowledgeNote` | Second-brain notes | title, content, tags, entity links |
| `Entity` | Knowledge graph nodes | name, type, description, metadata |
| `EntityRelationship` | Knowledge graph edges | source, target, relationship type, strength |
| `PerformanceSnapshot` | Daily account snapshots | equity, P/L, drawdown, open positions |
| `RiskRule` | User-defined risk limits | max risk/trade, max daily loss, etc. |
| `AIConversation` | Chat history | messages, context, model used |
| `AIReview` | AI trade reviews | trade, scores, reasoning |
| `Tag` | Tagging system | name, color |
| `TradeTag` | Many-to-many trade↔tag | trade_id, tag_id |

**Trade table detail** (maps to spec §5):

```
Trade {
  // Basic
  id, userId, accountId, symbol, assetClass, direction,
  entryPrice, stopLoss, takeProfit, exitPrice,
  quantity, lotSize, leverage, riskPercent, monetaryRisk,
  spread, commission, swap, slippage,
  entryTime, exitTime, session, broker, timeframe,
  status (PLANNED | OPEN | CLOSED | CANCELLED)

  // Strategy
  strategyId, setupId, entryTrigger, confirmation,
  invalidation, marketRegime, confluences, setupGrade,
  plannedRR, actualRR

  // Context
  fundamentalThesis, technicalThesis, macroThesis,
  sentiment, volatilityLevel, newsContext,
  economicEvents, centralBankContext,
  correlatedMarkets, positioning, geopoliticalContext

  // Psychology
  confidence (1-10), emotionalState, fear, greed,
  fomo, revengeTrade, hesitation, boredom,
  overtrading, ruleBreaking, sleepFatigue

  // Outcome
  grossPnl, netPnl, rMultiple, holdingDuration,
  outcomeNotes, processQuality, wasLucky

  // Metadata
  createdAt, updatedAt, deletedAt (soft delete)
}
```

Indexes on: `[userId, entryTime]`, `[userId, symbol]`, `[userId, strategyId]`, `[userId, status]`.

---

### 3. Authentication

#### [NEW] `src/auth.ts`
Auth.js v5 configuration with Prisma adapter, JWT strategy, credentials provider (email/password with bcrypt).

#### [NEW] `src/app/api/auth/[...nextauth]/route.ts`
Auth route handler.

#### [NEW] `src/app/(auth)/login/page.tsx`
Minimal login page — monochrome, editorial style, SIPHOON branding.

#### [NEW] `src/app/(auth)/register/page.tsx`
Registration page (single-user setup flow on first launch).

#### [NEW] `src/middleware.ts`
Edge middleware: redirect unauthenticated users to login. Protect all `(dashboard)` routes.

---

### 4. Design System & Layout

#### [NEW] `src/components/ui/*`
shadcn/ui components installed via CLI: `button`, `card`, `dialog`, `sheet`, `table`, `tabs`, `badge`, `command`, `form`, `input`, `select`, `textarea`, `calendar`, `popover`, `tooltip`, `separator`, `dropdown-menu`, `scroll-area`, `sonner` (toasts), `chart`.

#### [NEW] `src/components/layout/sidebar.tsx`
Collapsible sidebar navigation. Sections:
- **Command** (dashboard)
- **Markets** (placeholder for Phase 2)
- **Journal** (trades + daily journal)
- **Research** (placeholder for Phase 2)
- **Strategies** (strategy tracking)
- **Quant** (calculators)
- **Knowledge** (notes + graph)
- **AI** (chat)
- **Review** (performance + analytics)

#### [NEW] `src/components/layout/header.tsx`
Top bar: SIPHOON logo, global search trigger, command palette trigger (Cmd+K), user menu.

#### [NEW] `src/components/layout/command-menu.tsx`
Global command palette (cmdk). Commands: Log Trade, Search, Calculate Position Size, Open Journal, Ask AI, Review Week, etc.

#### [NEW] `src/app/(dashboard)/layout.tsx`
Dashboard layout wrapping sidebar + header + main content area. Auth guard via `await auth()`.

---

### 5. Command Center (Dashboard)

The central nervous system. Server Component fetching real data from database.

#### [NEW] `src/app/(dashboard)/page.tsx`
Dashboard page composing all widget blocks.

#### [NEW] `src/features/dashboard/components/`

| Component | Data Source | Purpose |
|:---|:---|:---|
| `equity-card.tsx` | Account table | Current equity, daily/weekly/monthly P/L |
| `drawdown-card.tsx` | PerformanceSnapshot | Current & max drawdown with sparkline |
| `risk-exposure-card.tsx` | Open trades | Total risk %, correlated exposure |
| `open-positions.tsx` | Trades (status=OPEN) | Active positions table |
| `watchlist.tsx` | User settings | Monitored pairs (static in Phase 1) |
| `upcoming-events.tsx` | Placeholder | "NOT CONNECTED" — honest about Phase 2 |
| `strategy-performance.tsx` | Trades grouped by strategy | Win rate, expectancy, R per strategy |
| `recent-journal.tsx` | JournalEntry | Today's notes, reminders |
| `system-health.tsx` | Data sources status | Market data: NOT CONNECTED, AI: status, DB: status |
| `ai-alerts.tsx` | AIReview | Recent AI observations |
| `quick-stats.tsx` | Trades aggregate | Total trades, win rate, avg R, expectancy |

Each widget is a `Card` component with clear header, data, and "WHY?" / "SHOW DATA" expandable sections where relevant.

---

### 6. Trade Journal

The most critical Phase 1 feature. Full CRUD with the complete field set from spec §5.

#### [NEW] `src/app/(dashboard)/journal/page.tsx`
Journal home: filterable trade list + daily journal entries.

#### [NEW] `src/app/(dashboard)/journal/trades/page.tsx`
Trade list with DataTable: sortable, filterable by symbol/strategy/session/date/outcome. Columns: date, symbol, direction, entry, exit, P/L, R, strategy, setup grade, status.

#### [NEW] `src/app/(dashboard)/journal/trades/new/page.tsx`
Multi-step trade entry form (tabbed):
1. **Basic** — symbol, direction, entry, SL, TP, exit, quantity, etc.
2. **Strategy** — strategy, setup, triggers, regime, confluences
3. **Context** — fundamental/technical/macro thesis, news, correlations
4. **Psychology** — emotional state sliders, confidence, flags (FOMO, revenge, etc.)
5. **Evidence** — file upload (screenshots, PDFs), URLs, notes
6. **Review** — summary before save

Auto-calculates: pip distance, R:R, risk amount, position size, net P/L (including spread/commission/swap/slippage).

#### [NEW] `src/app/(dashboard)/journal/trades/[id]/page.tsx`
Trade detail view: all fields displayed, evidence gallery, AI review, linked entities.

#### [NEW] `src/app/(dashboard)/journal/daily/page.tsx`
Daily journal: rich text notes, session review, emotional log, lessons learned. Calendar view to navigate by date.

#### [NEW] `src/features/journal/server/actions.ts`
Server Actions: `createTrade`, `updateTrade`, `deleteTrade`, `createJournalEntry`, `importTrades` (CSV).

#### [NEW] `src/features/journal/components/trade-form.tsx`
The multi-tab trade form component with Zod validation.

#### [NEW] `src/features/journal/components/trade-table.tsx`
DataTable with TanStack Table: pagination, sorting, filtering, column visibility, row selection, bulk actions.

#### [NEW] `src/features/journal/components/trade-detail.tsx`
Full trade detail view with expandable sections.

#### [NEW] `src/features/journal/components/evidence-upload.tsx`
File upload component supporting images, PDFs, CSVs, with preview.

#### [NEW] `src/features/journal/components/csv-import.tsx`
CSV import dialog: upload → preview → map columns → validate → import.

#### [NEW] `src/features/journal/types/schemas.ts`
Zod schemas for trade creation, update, filtering, CSV import.

---

### 7. Forex Mathematics Engine

Deterministic calculation engine — no AI, pure math with `Decimal.js` for precision.

#### [NEW] `src/lib/forex/pip-calculator.ts`
- `calculatePipSize(symbol)` — returns pip decimal based on pair type
- `calculatePipDistance(entry, exit, pipSize)` — pip distance
- `calculatePipValue(symbol, lotSize, accountCurrency, conversionRate)` — handles all 3 cases (quote=account, base=account, cross)

#### [NEW] `src/lib/forex/position-sizing.ts`
- `calculatePositionSize({ accountEquity, riskPercent, stopLossPips, pipValue })` — returns lots
- `calculateRiskAmount(accountEquity, riskPercent)` — monetary risk
- Handles: standard/mini/micro/nano lots, all pair type conversions

#### [NEW] `src/lib/forex/risk-reward.ts`
- `calculateRR(entry, stopLoss, takeProfit)` — R:R ratio
- `calculateExpectancy(winRate, avgWin, avgLoss)` — EV per trade
- `calculateAdjustedExpectancy(winRate, avgWin, avgLoss, costs)` — net of transaction costs
- `calculateBreakEvenWinRate(riskRewardRatio, costs)` — minimum win rate needed

#### [NEW] `src/lib/forex/kelly.ts`
- `calculateFullKelly(winRate, payoffRatio)` — full Kelly fraction
- `calculateFractionalKelly(winRate, payoffRatio, fraction)` — scaled Kelly
- Warning system: never recommend full Kelly without explicit user acknowledgment

#### [NEW] `src/lib/forex/drawdown.ts`
- `calculateDrawdown(equityCurve)` — current, max, average drawdown
- `calculateDrawdownDuration(equityCurve)` — time underwater
- `calculateRecoveryTime(equityCurve)` — time to recover from max DD

#### [NEW] `src/lib/forex/risk-of-ruin.ts`
- `calculateRiskOfRuin(winRate, payoffRatio, capitalUnits)` — discrete model
- `calculateRiskOfRuinContinuous(expectedReturn, variance, capitalBuffer)` — Brownian motion model

#### [NEW] `src/lib/forex/trade-costs.ts`
- `calculateNetPnl(grossPnl, spread, commission, swap, slippage)` — true cost
- `calculateTotalCost(spread, commission, swap, slippage)` — aggregate friction

#### [NEW] `src/lib/forex/currency-pairs.ts`
- Currency pair metadata: pip sizes, contract sizes, categories (major/minor/exotic)
- All 30+ standard pairs from the research

#### [NEW] `src/lib/forex/__tests__/`
Unit tests for every calculation function. Test cases include:
- Standard pairs (EUR/USD), JPY pairs (USD/JPY), cross pairs (EUR/GBP, GBP/JPY)
- Edge cases: zero values, extreme leverage, micro lots
- Known correct values verified against broker calculators

---

### 8. Calculator Hub UI

#### [NEW] `src/app/(dashboard)/quant/page.tsx`
Calculator hub page with grid of available calculators.

#### [NEW] `src/app/(dashboard)/quant/calculators/page.tsx`
All calculators accessible from single page with tabs or accordion.

#### [NEW] `src/features/calculators/components/position-size-calculator.tsx`
Input: account equity, risk %, symbol, entry, stop loss, account currency.
Output: lot size, units, monetary risk, pip value, pip distance.
Shows formula used.

#### [NEW] `src/features/calculators/components/rr-calculator.tsx`
Input: entry, stop loss, take profit.
Output: R:R, required win rate for break-even, expected value.

#### [NEW] `src/features/calculators/components/expectancy-calculator.tsx`
Input: win rate, average win, average loss, costs.
Output: expectancy per trade, adjusted expectancy, break-even win rate.

#### [NEW] `src/features/calculators/components/kelly-calculator.tsx`
Input: win rate, payoff ratio.
Output: full Kelly, half Kelly, quarter Kelly, with drawdown warnings.

#### [NEW] `src/features/calculators/components/risk-of-ruin-calculator.tsx`
Input: win rate, payoff ratio, capital units.
Output: risk of ruin percentage, with interpretation.

#### [NEW] `src/features/calculators/components/drawdown-calculator.tsx`
Input: consecutive losses, risk per trade.
Output: portfolio impact, compound drawdown, recovery needed.

#### [NEW] `src/features/calculators/components/compound-growth-calculator.tsx`
Input: starting capital, monthly return, months.
Output: growth curve, milestone targets.

Every calculator displays:
- **Formula** (rendered with LaTeX/KaTeX)
- **Inputs** (validated forms)
- **Calculation** (step-by-step)
- **Result** (clear, bold)
- **Interpretation** (what this means for trading)

---

### 9. Performance Analytics

#### [NEW] `src/app/(dashboard)/review/page.tsx`
Performance review hub: overview, detailed analytics, behavioral analysis.

#### [NEW] `src/app/(dashboard)/review/analytics/page.tsx`
Detailed performance analytics page.

#### [NEW] `src/features/analytics/server/queries.ts`
Server-side data aggregation queries:
- P/L by day/week/month (net of costs)
- Win rate by symbol/strategy/session/regime
- R-multiple distribution
- Expectancy by strategy
- Drawdown curve
- Equity curve
- Trade duration analysis
- Best/worst performing setups
- Consecutive wins/losses

#### [NEW] `src/features/analytics/components/equity-curve.tsx`
Line chart showing equity over time (Recharts via shadcn/ui Chart).

#### [NEW] `src/features/analytics/components/pnl-chart.tsx`
Bar chart: daily/weekly/monthly P/L. Toggle gross vs. net.

#### [NEW] `src/features/analytics/components/win-rate-breakdown.tsx`
Breakdown by: symbol, strategy, session, direction, day of week.

#### [NEW] `src/features/analytics/components/r-distribution.tsx`
Histogram of R-multiples across all trades.

#### [NEW] `src/features/analytics/components/drawdown-chart.tsx`
Drawdown curve with max drawdown highlighted.

#### [NEW] `src/features/analytics/components/strategy-comparison.tsx`
Table comparing strategies: trades, win rate, expectancy, avg R, max DD, Sharpe.

#### [NEW] `src/features/analytics/components/behavioral-analytics.tsx`
Detects patterns from journal data:
- Trades with FOMO flag → win rate comparison
- Revenge trade flag → outcome analysis
- Session performance comparison
- Rule-breaking frequency
- Emotional state → performance correlation

Only displays findings when data supports them. Shows "INSUFFICIENT DATA" when sample size is too small (< 30 trades for statistical claims).

#### [NEW] `src/features/analytics/components/trade-cost-analysis.tsx`
Shows total costs paid: spread, commission, swap, slippage. Impact on gross → net P/L.

---

### 10. Strategy Tracking

#### [NEW] `src/app/(dashboard)/strategies/page.tsx`
Strategy list with maturity lifecycle status.

#### [NEW] `src/app/(dashboard)/strategies/[id]/page.tsx`
Strategy detail: definition, setups, performance, trades, maturity stage.

#### [NEW] `src/features/strategies/components/strategy-form.tsx`
Create/edit strategy: name, description, entry rules, exit rules, stop rules, target rules, timeframe, assets, session, filters, risk rules.

#### [NEW] `src/features/strategies/components/strategy-card.tsx`
Card showing: name, maturity stage (IDEA → HYPOTHESIS → ... → VALIDATED → RETIRED), key stats.

#### [NEW] `src/features/strategies/components/maturity-tracker.tsx`
Visual lifecycle tracker. Strategies must earn promotion through evidence:
- IDEA → HYPOTHESIS: User defines testable rules
- HYPOTHESIS → BACKTEST: Requires backtest results (Phase 3)
- LIVE OBSERVATION → VALIDATED: Requires 30+ live trades with positive expectancy

#### [NEW] `src/features/strategies/server/actions.ts`
CRUD for strategies and setups. Link trades to strategies.

---

### 11. Knowledge Notes (Second Brain)

#### [NEW] `src/app/(dashboard)/knowledge/page.tsx`
Knowledge base home: notes list, entity browser, search.

#### [NEW] `src/app/(dashboard)/knowledge/notes/page.tsx`
Notes list with search and tag filtering.

#### [NEW] `src/app/(dashboard)/knowledge/notes/[id]/page.tsx`
Note editor: Markdown content, entity linking, tags, attachments.

#### [NEW] `src/app/(dashboard)/knowledge/entities/page.tsx`
Entity browser: currencies, central banks, indicators, strategies, etc. Grid/list view.

#### [NEW] `src/app/(dashboard)/knowledge/graph/page.tsx`
Visual knowledge graph (Phase 1: simple force-directed graph using a lightweight library like `react-force-graph` or `d3-force`). Nodes = entities, edges = relationships.

#### [NEW] `src/features/knowledge/components/note-editor.tsx`
Markdown editor with entity mention support (`@EUR/USD`, `@Federal Reserve`). Rich text preview.

#### [NEW] `src/features/knowledge/components/entity-card.tsx`
Entity detail card showing: name, type, description, linked notes, linked trades, relationships.

#### [NEW] `src/features/knowledge/server/actions.ts`
CRUD for notes, entities, relationships. Full-text search on note content.

#### [NEW] `src/features/knowledge/types/entities.ts`
Entity type enum matching spec §6: Trade, Strategy, Currency, CurrencyPair, CentralBank, Country, EconomicIndicator, Institution, MarketRegime, etc.

---

### 12. AI System (Phase 1 — Foundation)

Provider-agnostic AI adapter with basic chat and trade review capabilities.

#### [NEW] `src/lib/ai/provider.ts`
AI provider interface:
```typescript
interface AIProvider {
  name: string;
  chat(messages: Message[], options?: AIOptions): Promise<AIResponse>;
  stream(messages: Message[], options?: AIOptions): AsyncIterable<string>;
}
```

#### [NEW] `src/lib/ai/providers/openai.ts`
OpenAI adapter implementing `AIProvider`.

#### [NEW] `src/lib/ai/providers/anthropic.ts`
Anthropic adapter implementing `AIProvider`.

#### [NEW] `src/lib/ai/router.ts`
Model router: selects provider based on task type (simple → cheap model, complex → strong model). Configurable by user.

#### [NEW] `src/lib/ai/prompts/system.ts`
System prompts encoding SIPHOON's absolute rules:
- Never claim certainty
- Use probability language
- Cite data sources
- Say "INSUFFICIENT DATA" when appropriate
- Distinguish correlation from causation
- Never hallucinate trading facts

#### [NEW] `src/lib/ai/prompts/trade-reviewer.ts`
Trade review prompt: analyzes trade against journal data, scores setup/execution/risk/process/emotional control.

#### [NEW] `src/lib/ai/prompts/chat.ts`
Chat prompt: context-aware, queries user's actual database for personalized answers.

#### [NEW] `src/app/(dashboard)/ai/page.tsx`
AI chat interface. Persistent conversation. Context includes user's recent trades, strategies, and performance data.

#### [NEW] `src/features/ai/components/chat-interface.tsx`
Chat UI: message list, input, streaming responses, source citations, uncertainty labels.

#### [NEW] `src/features/ai/components/trade-review.tsx`
AI trade review display: scores with explanations, evidence links, counter-thesis.

#### [NEW] `src/features/ai/server/actions.ts`
Server Actions: `sendMessage`, `reviewTrade`, `queryJournal`.

---

### 13. Pre-Trade Checklist

#### [NEW] `src/features/journal/components/pre-trade-checklist.tsx`
Checklist before trade execution (spec §45):
- Market regime identified?
- Setup matches strategy rules?
- Entry trigger confirmed?
- Invalidation defined?
- Risk calculated and within limits?
- R:R acceptable?
- News/event proximity checked?
- Volatility appropriate?
- Correlation exposure checked?
- Thesis and counter-thesis documented?

Score: `RULES PASSED: X/10` → EXECUTE / WAIT / NO TRADE

---

### 14. Decision Journal

#### [NEW] `src/features/journal/components/decision-journal.tsx`
Pre-trade: "WHY AM I TAKING THIS TRADE?" — records thesis.
Post-trade: "WHAT HAPPENED?" — compares thesis to outcome.
Classification matrix:
- ✅ Good trade → Win
- ✅ Good trade → Loss (correct process, adverse outcome)
- ❌ Bad trade → Win (wrong process, lucky outcome)
- ❌ Bad trade → Loss

**Outcome ≠ process quality.** This is surfaced prominently in analytics.

---

### 15. Search

#### [NEW] `src/features/search/components/global-search.tsx`
Global search modal (triggered from header or Cmd+K). Searches across: trades, journal entries, notes, strategies, entities.

#### [NEW] `src/features/search/server/queries.ts`
PostgreSQL full-text search with `ts_vector` and `ts_query`. Trigram similarity via `pg_trgm` for fuzzy matching.

---

### 16. Signal Import (Basic)

#### [NEW] `src/features/journal/components/signal-parser.tsx`
Paste text like `EUR/USD BUY 1.1700 SL 1.1660 TP 1.1800` → parse into structured trade fields → pre-fill trade form.

Asks for: Source? Strategy? Timeframe? Reason?

Labels signal as external. Does not blindly validate.

---

### 17. Export

#### [NEW] `src/features/export/server/actions.ts`
Export trades, journal entries, strategies as: CSV, JSON, Markdown.

#### [NEW] `src/features/export/components/export-dialog.tsx`
Export dialog: select data type, format, date range → download.

---

## File Structure Summary

```
SIPHOON/
├── docker-compose.yml
├── .env.example
├── next.config.ts
├── package.json
├── tsconfig.json
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── globals.css                    # Tailwind v4 + SIPHOON theme
│   │   ├── layout.tsx                     # Root layout
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                 # Dashboard layout (sidebar + header)
│   │   │   ├── page.tsx                   # Command Center
│   │   │   ├── journal/
│   │   │   │   ├── page.tsx               # Journal home
│   │   │   │   ├── trades/
│   │   │   │   │   ├── page.tsx           # Trade list
│   │   │   │   │   ├── new/page.tsx       # New trade form
│   │   │   │   │   └── [id]/page.tsx      # Trade detail
│   │   │   │   └── daily/page.tsx         # Daily journal
│   │   │   ├── strategies/
│   │   │   │   ├── page.tsx               # Strategy list
│   │   │   │   └── [id]/page.tsx          # Strategy detail
│   │   │   ├── quant/
│   │   │   │   ├── page.tsx               # Calculator hub
│   │   │   │   └── calculators/page.tsx   # All calculators
│   │   │   ├── knowledge/
│   │   │   │   ├── page.tsx               # Knowledge home
│   │   │   │   ├── notes/
│   │   │   │   │   ├── page.tsx           # Notes list
│   │   │   │   │   └── [id]/page.tsx      # Note editor
│   │   │   │   ├── entities/page.tsx      # Entity browser
│   │   │   │   └── graph/page.tsx         # Knowledge graph
│   │   │   ├── review/
│   │   │   │   ├── page.tsx               # Review hub
│   │   │   │   └── analytics/page.tsx     # Detailed analytics
│   │   │   └── ai/page.tsx                # AI chat
│   │   └── api/
│   │       └── auth/[...nextauth]/route.ts
│   ├── auth.ts                            # Auth.js config
│   ├── middleware.ts                       # Auth middleware
│   ├── components/
│   │   ├── ui/                            # shadcn/ui primitives (~20 components)
│   │   └── layout/
│   │       ├── sidebar.tsx
│   │       ├── header.tsx
│   │       └── command-menu.tsx
│   ├── features/
│   │   ├── dashboard/components/          # ~11 widget components
│   │   ├── journal/
│   │   │   ├── components/                # Trade form, table, detail, CSV import, etc.
│   │   │   ├── server/actions.ts
│   │   │   └── types/schemas.ts
│   │   ├── calculators/components/        # ~7 calculator components
│   │   ├── analytics/
│   │   │   ├── components/                # Charts, breakdowns, behavioral
│   │   │   └── server/queries.ts
│   │   ├── strategies/
│   │   │   ├── components/
│   │   │   └── server/actions.ts
│   │   ├── knowledge/
│   │   │   ├── components/
│   │   │   ├── server/actions.ts
│   │   │   └── types/entities.ts
│   │   ├── ai/
│   │   │   ├── components/
│   │   │   └── server/actions.ts
│   │   ├── search/
│   │   │   ├── components/
│   │   │   └── server/queries.ts
│   │   └── export/
│   │       ├── components/
│   │       └── server/actions.ts
│   └── lib/
│       ├── prisma.ts                      # Prisma singleton
│       ├── utils.ts                       # cn(), formatters
│       ├── forex/
│       │   ├── currency-pairs.ts          # Pair metadata
│       │   ├── pip-calculator.ts          # Pip calculations
│       │   ├── position-sizing.ts         # Position sizing
│       │   ├── risk-reward.ts             # R:R, expectancy, break-even
│       │   ├── kelly.ts                   # Kelly criterion
│       │   ├── drawdown.ts                # Drawdown calculations
│       │   ├── risk-of-ruin.ts            # Risk of ruin models
│       │   ├── trade-costs.ts             # Net P/L calculations
│       │   └── __tests__/                 # Unit tests for all math
│       └── ai/
│           ├── provider.ts                # AIProvider interface
│           ├── router.ts                  # Model router
│           ├── providers/
│           │   ├── openai.ts
│           │   └── anthropic.ts
│           └── prompts/
│               ├── system.ts
│               ├── trade-reviewer.ts
│               └── chat.ts
└── tests/                                 # Integration & E2E tests
```

**Estimated file count**: ~120 files
**Estimated total lines**: ~15,000–20,000

---

## Verification Plan

### Automated Tests

```bash
# Unit tests for forex math engine (critical path)
npx vitest run src/lib/forex/__tests__/

# Type checking
npx tsc --noEmit

# Linting
npx next lint

# Database schema validation
npx prisma validate

# Full test suite
npx vitest run
```

### Manual Verification
1. **Auth flow**: Register → Login → Protected routes redirect
2. **Trade CRUD**: Create trade with all fields → View in list → Edit → Delete
3. **Calculators**: Verify position size, pip value, R:R against known broker calculator results
4. **Performance analytics**: Log 10+ trades → Verify equity curve, win rate, expectancy match manual calculation
5. **AI chat**: Ask questions about logged trades → Verify responses reference actual data
6. **Knowledge notes**: Create notes → Link entities → Search → Verify results
7. **CSV import**: Import sample trade history → Verify all fields mapped correctly
8. **Export**: Export trades as CSV → Verify completeness and accuracy
9. **Command palette**: Cmd+K → Navigate all major actions
10. **Responsive**: Verify sidebar collapse on smaller screens

### Critical Math Verification
Every forex calculation is tested against known correct values:
- EUR/USD pip value with USD account = $10/standard lot ✓
- USD/JPY pip value with USD account at rate 150.00 = $6.667/standard lot ✓
- Cross pair (EUR/GBP) pip value conversion ✓
- Position sizing matches broker calculators ✓
- Kelly criterion matches published examples ✓
- Risk of ruin matches Balsara tables ✓

---

## What Phase 1 Explicitly Does NOT Include

These are **NOT CONNECTED** in Phase 1 and will display honest status labels:

| Feature | Status | Phase |
|:---|:---|:---|
| Live market data | NOT CONNECTED | 2 |
| TradingView webhooks | NOT CONNECTED | 2 |
| Economic calendar (live) | NOT CONNECTED | 2 |
| News feed | NOT CONNECTED | 2 |
| COT data | NOT CONNECTED | 2 |
| Market entity intelligence | NOT CONNECTED | 2 |
| Backtesting engine | NOT BUILT | 3 |
| Monte Carlo simulation | NOT BUILT | 3 |
| Bayesian analysis | NOT BUILT | 3 |
| Regime detection | NOT BUILT | 3 |
| AI debate system | NOT BUILT | 3 |
| Prediction calibration | NOT BUILT | 3 |
| Market replay | NOT BUILT | 4 |
| Trading gym | NOT BUILT | 4 |
| ML models | NOT BUILT | 4 |
| Time-series models | NOT BUILT | 4 |
| Voice journal | NOT BUILT | 4 |
| Mobile optimization | MINIMAL | 2 |

Every unconnected feature shows its true status — **never fake data, never placeholder pretending to work**.
