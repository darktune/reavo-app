# REAVO: Comprehensive Testing Framework, Platform Ecosystem & Route Directory Guide

> **Document Type**: Architecture & Engineering Handbook  
> **Target Audience**: REAVO Engineering, QA, AI Copilot Agents & DevOps  
> **Stack Under Test**: React 19 (Vite) SPA · Supabase (PostgreSQL, RLS, Auth, RPC) · Node.js/Express (`server.js`) · KoraPay · Vercel Serverless  
> **Coverage Scope**: Automated E2E Suites · Mobile Viewport & HCI · Security & Chaos Testing · Top 10 Vibe-Testing Platforms · Production Monitoring · Route Directory

---

## 1. Live Site & Vercel URL Directory

REAVO is deployed continuously via GitHub integration to Vercel. Below is the primary project infrastructure and the route mapping directory between local development and production environments.

### 1.1 Infrastructure Endpoints
* **Production Live Site**: [https://reavo-app.vercel.app](https://reavo-app.vercel.app) *(or your linked custom domain)*
* **Vercel Project Dashboard**: [https://vercel.com/darktune/reavo-app](https://vercel.com/darktune/reavo-app)
* **GitHub Source Repository**: [https://github.com/darktune/reavo-app](https://github.com/darktune/reavo-app)

---

### 1.2 Comprehensive Route Directory (Local Dev vs. Live Vercel)

All client-side routes are configured with single-page fallback rewrites in `vercel.json` (`((?!assets/|images/|ambassadors/).*) -> /index.html`), while `/api/(.*)` routes proxy dynamically to Express (`server.js`).

#### Storefront Routes (Customer & Student Portal)
| Page / Flow | Local Development URL | Live Vercel Production URL | Purpose & Ergonomics |
| :--- | :--- | :--- | :--- |
| **Home / Landing** | `http://localhost:5173/` | [reavo-app.vercel.app/](https://reavo-app.vercel.app/) | University ecosystem map, hero banners, curated student tech deals |
| **Shop / Catalog** | `http://localhost:5173/shop` | [reavo-app.vercel.app/shop](https://reavo-app.vercel.app/shop) | Device filtering (Laptops, Phones, Audio, Specs), search & sorting |
| **Product Detail** | `http://localhost:5173/product/:id` | [reavo-app.vercel.app/product/:id](https://reavo-app.vercel.app/product/:id) | Image carousels, student condition grades, add to cart, trade-in value |
| **Shopping Cart** | `http://localhost:5173/cart` | [reavo-app.vercel.app/cart](https://reavo-app.vercel.app/cart) | Cart drawer & full view, quantity adjustment, subtotal calculation |
| **Checkout** | `http://localhost:5173/checkout` | [reavo-app.vercel.app/checkout](https://reavo-app.vercel.app/checkout) | KoraPay checkout, WhatsApp rider field, promo discount, mobile pay bar |
| **Customer Profile** | `http://localhost:5173/profile` | [reavo-app.vercel.app/profile](https://reavo-app.vercel.app/profile) | Order tracking, 4-digit handover PIN, Device Trade-In appraisal sheet |
| **About REAVO** | `http://localhost:5173/about` | [reavo-app.vercel.app/about](https://reavo-app.vercel.app/about) | Mission statement, Nigerian university presence, student ambassador network |
| **Contact Desk** | `http://localhost:5173/contact` | [reavo-app.vercel.app/contact](https://reavo-app.vercel.app/contact) | WhatsApp support desk, physical campus contact, help center |
| **Staff Onboarding** | `http://localhost:5173/staff-onboarding` | [reavo-app.vercel.app/staff-onboarding](https://reavo-app.vercel.app/staff-onboarding) | Single-use invitation token redemption, zero-trust account setup |

#### REAVO Admin OS Routes (Operations, Security & AI)
| Admin View | Local Development URL | Live Vercel Production URL | Administrative Functionality |
| :--- | :--- | :--- | :--- |
| **Admin Login** | `http://localhost:5173/admin` | [reavo-app.vercel.app/admin](https://reavo-app.vercel.app/admin) | Enterprise staff credential entry, session validation, RBAC gatekeeper |
| **Executive Dashboard** | `http://localhost:5173/admin/dashboard` | [reavo-app.vercel.app/admin/dashboard](https://reavo-app.vercel.app/admin/dashboard) | Live GMV, revenue charts, order counts, trade-in metrics, quick actions |
| **Inventory Manager** | `http://localhost:5173/admin/inventory` | [reavo-app.vercel.app/admin/inventory](https://reavo-app.vercel.app/admin/inventory) | Stock adjustments, batch restocks, negative stock guards, product creation |
| **Orders & Logistics** | `http://localhost:5173/admin/orders` | [reavo-app.vercel.app/admin/orders](https://reavo-app.vercel.app/admin/orders) | Status lifecycle (Paid -> Dispatched -> Delivered), 4-digit PIN handover |
| **Partnerships & Payouts** | `http://localhost:5173/admin/partnerships` | [reavo-app.vercel.app/admin/partnerships](https://reavo-app.vercel.app/admin/partnerships) | Ambassador commission tracking, KoraPay disbursal with JWT admin verification |
| **Device Trade-Ins** | `http://localhost:5173/admin/tradeins` | [reavo-app.vercel.app/admin/tradeins](https://reavo-app.vercel.app/admin/tradeins) | Device grading, status updates (Inspection -> Approved -> Paid Out) |
| **Staff & RBAC Control** | `http://localhost:5173/admin/staff` | [reavo-app.vercel.app/admin/staff](https://reavo-app.vercel.app/admin/staff) | Role management, token generation, mobile staff cards, instant revocation |
| **Multi-Dimensional Audit**| `http://localhost:5173/admin/audit` | [reavo-app.vercel.app/admin/audit](https://reavo-app.vercel.app/admin/audit) | Category filtering (Staff, AI, System, Automations), severity logs |
| **AI Copilot Center** | `http://localhost:5173/admin/ai` | [reavo-app.vercel.app/admin/ai](https://reavo-app.vercel.app/admin/ai) | Natural language DB querying, stock mutation proposals, markdown parser |
| **System Settings** | `http://localhost:5173/admin/settings` | [reavo-app.vercel.app/admin/settings](https://reavo-app.vercel.app/admin/settings) | Gemini API model switcher, SMTP email config, automated test email trigger |

#### Automated Background Crons (Vercel Serverless)
* **Daily Briefing Cron**: `/api/cron/daily-briefing` (Runs daily at `08:00 UTC`)
* **Hourly Stock Auditor**: `/api/cron/hourly-stock` (Runs at minute `0` of every hour)

---

## 2. REAVO Playwright E2E Automated Testing Architecture

To guarantee absolute reliability across Nigerian student mobile networks and desktop administrative workflows, REAVO is hardened with native Playwright End-to-End (E2E) suites.

### 2.1 Configuration Architecture (`playwright.config.js`)
* **Automated Web Server Spawning**: Launches Vite automatically via `npm run dev` at `http://localhost:5173` with a 120-second startup budget, reusing existing processes during local development.
* **Multi-Device Testing Matrix**:
  1. `Desktop Chromium` (1280x720) — Full administrative dashboard and storefront desktop fidelity.
  2. `Mobile Viewport (Pixel 7)` (412x915) — Modern Android student viewport with high DPI and touch simulation.
  3. `Mobile Viewport (iPhone 14)` (390x844) — iOS Safari WebKit mobile layout and ergonomics.
* **Diagnostic Artifacts**: Captures traces on first retry and takes automatic viewport screenshots upon test failure.

---

### 2.2 Deterministic Test Harnesses & State Seeding

Traditional end-to-end tests frequently suffer from animation delays and Supabase network latency. REAVO includes deterministic runtime test harnesses injected via `page.addInitScript()`:

1. **`reavo_skip_loader`**: In `src/components/Loader.jsx`, setting this localStorage key bypasses the 2.5s intro animation, allowing tests to begin immediately.
2. **`reavo-demo-user` & `reavo-demo-admin`**: In `src/context/AuthContext.jsx` and `src/context/AdminAuthContext.jsx`, setting these keys initializes authenticated student and admin sessions instantly without external Supabase auth roundtrips.
3. **`reavo_cart`**: Direct JSON injection into localStorage allows checkout tests to start with valid devices (e.g., iPhone 15 Pro) without having to navigate catalog catalogs first.
4. **Guest Checkout Resilience**: `CheckoutPage.jsx` allows immediate checkout if items are present in cart, even when session hydration is in progress.

---

### 2.3 Automated Test Suites Breakdown

#### Suite A: Fast Smoke Tests (`e2e/smoke.spec.js`)
| Test Name | Assertions & Scope |
| :--- | :--- |
| **Storefront Home** | Asserts page loads with document title matching `/REAVO\|Gadgets/i` and navigation elements render cleanly. |
| **Checkout 16px iOS Zoom Guard** | Enforces that form inputs (`input[name="fullName"]`, etc.) render with `font-size: 16px` on mobile viewports, permanently preventing iOS Safari and Android auto-zoom jumpiness. |
| **Customer Profile Tab Navigation** | Verifies horizontal touch navigation and tab visibility across account views. |
| **Admin OS Login Route** | Asserts `/admin` renders without critical console crashes or unhandled JavaScript exceptions. |

#### Suite B: E-Commerce Fortress Suite (`e2e/ecommerce-fortress.spec.js`)
Incorporates industry patterns extracted from top autonomous testing platforms:

1. **VibeEval Pattern — Client-Side Price Tampering & Injection Defense**:
   - Injects malicious payloads (`'; DROP TABLE discounts; -- <script>alert(1)</script>`) into promo discount fields.
   - Verifies client-side regex sanitization (`/^[A-Z0-9_-]+$/`) catches malicious input in 0ms.
   - Asserts total payable never degrades to `NaN`, negative currency (`-₦`), or malformed floats.
2. **testRigor Pattern — Natural Intent-Based WhatsApp Rider Flow**:
   - Employs accessibility and intent selectors (`getByPlaceholder(/\+234/i)`) rather than fragile CSS selectors.
   - Verifies campus delivery rider helper text (`(Optional - Recommended)`) displays correctly.
3. **Applitools Pattern — Mobile Sticky Pay Bar & Zero Horizontal Overflow**:
   - Asserts mathematical zero unwanted horizontal scroll (`document.documentElement.scrollWidth <= clientWidth + 2`).
   - Verifies fixed thumb-zone payment dock (`.mobile-bottom-pay-bar`) remains pinned to the bottom of the screen.
   - Enforces minimum 44px touch target height on the KoraPay payment button.
4. **Mabl / Chaos Pattern — Offline Network Interruption Detection**:
   - Simulates a campus WiFi drop using `await context.setOffline(true)`.
   - Asserts the real-time network state machine detects the drop and renders the red "Internet connection interrupted" warning banner.
   - Restores network connectivity using `await context.setOffline(false)` and confirms system recovery.
5. **Trade-Ins Lifecycle — Mobile Bottom-Sheet Appraisal Flow**:
   - Simulates opening the Device Trade-In appraisal modal on `/profile`.
   - Asserts bottom-sheet styling, condition selection dropdown visibility, and clean dismissal via close trigger (`✕`).

---

### 2.4 Test Execution Commands

Run these commands inside `c:\Users\USER\Downloads\trading\reavo-app`:

```powershell
# Run the complete test suite across all configured browser profiles
npm run test:e2e

# Run only on Desktop Chromium
npx playwright test --project="Desktop Chromium"

# Run only on Mobile Pixel 7 (Android mobile viewport)
npx playwright test --project="Mobile Viewport (Pixel 7)"

# Run only on Mobile iPhone 14 (iOS mobile viewport)
npx playwright test --project="Mobile Viewport (iPhone 14)"

# Run a specific test file
npx playwright test e2e/ecommerce-fortress.spec.js

# Launch Playwright Interactive UI Mode (Visual time-travel debugger)
npm run test:e2e:ui

# View the generated HTML test results report
npx playwright show-report
```

---

## 3. The Top 10 Platforms for Testing Vibe-Coded E-Commerce Sites

When building fast-moving "vibe-coded" applications using AI assistants (Claude, Codex, Antigravity, Cursor), testing tools must adapt to fluid codebases without brittle selector breakages. Here is the comprehensive breakdown of the leading platforms in this category:

### 1. Shiplight AI
* **Core Philosophy**: Workflow-Integrated & MCP-Native.
* **How It Works**: Connects directly to AI coding environments via the Model Context Protocol (MCP). When the developer vibes out a new feature or prompts an agent, Shiplight instructs the agent to write intent-based YAML/Playwright tests stored directly in the Git repository.
* **Key Strength**: Zero context switching; tests stay in your codebase as first-class Git citizens.

### 2. Claude Code + Playwright MCP
* **Core Philosophy**: Terminal-native autonomous browser exploration.
* **How It Works**: Pairs an agentic CLI with an MCP browser server. The AI model receives visual viewport snapshots, accessibility trees, and DOM snapshots in real time, navigating the application and identifying layout breaks or functional regressions interactively.
* **Key Strength**: Highly flexible; great for exploratory testing and bug reproduction during active coding sessions.

### 3. DevAssure O2
* **Core Philosophy**: Agentic PR and CI/CD test automation.
* **How It Works**: Installs into GitHub workflows. Upon PR creation, DevAssure's autonomous agents analyze changed diffs, predict impacted user journeys, and generate regression tests across storefront flows.
* **Key Strength**: Prevents regressions before merging without manual test authoring.

### 4. VibeEval
* **Core Philosophy**: Adversarial security and financial transaction evaluation for AI apps.
* **How It Works**: Specifically designed to audit vibe-coded projects for subtle business logic flaws, prompt injections, coupon race conditions, client-side price tampering, and broken database RLS policies.
* **Key Strength**: Critical for e-commerce, fintech, and platforms where cart manipulation or unauthorized database mutations lead to direct financial loss.

### 5. testRigor
* **Core Philosophy**: Generative, plain-English intent-based test automation.
* **How It Works**: Tests are written from the perspective of an end-user without referencing CSS classes or XPath IDs (e.g., `click "Pay with KoraPay"`, `check that "₦1,200,000" is visible`).
* **Key Strength**: Immune to CSS restructuring; tests do not break when Tailwind classes or DOM hierarchies change.

### 6. Applitools Autonomous / Eyes
* **Core Philosophy**: Visual AI & Human-Computer Interaction (HCI) regression.
* **How It Works**: Uses computer vision to inspect web pages across hundreds of viewport sizes and screen densities. Identifies overlapping text, clipped mobile bottom sheets, broken sticky navigation, and color contrast failures.
* **Key Strength**: Unmatched for responsive design and mobile ergonomics verification.

### 7. Mabl
* **Core Philosophy**: Enterprise low-code testing with native chaos & network resilience.
* **How It Works**: Provides unified UI, API, and performance testing with built-in auto-healing selectors and network condition simulation (throttling, offline blackouts, latency injection).
* **Key Strength**: Ideal for validating student app behavior on unstable or high-latency mobile networks.

### 8. CoTester (by QA Wolf)
* **Core Philosophy**: AI-native synthetic testing agent that operates like a human QA engineer.
* **How It Works**: Explores user stories autonomously, generates high-coverage Playwright scripts, and performs root-cause analysis when failures occur.
* **Key Strength**: Extremely rapid coverage ramp-up for complex multi-role workflows (Customer vs. Admin).

### 9. Autify
* **Core Philosophy**: Self-healing test automation powered by machine learning.
* **How It Works**: Automatically tracks DOM mutations. When a button's structure, ID, or style changes, Autify's ML model recognizes the element's semantic purpose and updates test selectors dynamically.
* **Key Strength**: Drastically reduces test maintenance overhead during fast vibe-coding iterations.

### 10. BlinqIO
* **Core Philosophy**: Virtual autonomous software testing engineer.
* **How It Works**: Integrates with Jira, Linear, or GitHub issues to understand feature requirements and autonomously creates, runs, and maintains Playwright/Selenium test suites in multiple languages.
* **Key Strength**: Bridges product requirements directly to executable automated test coverage.

---

## 4. Architectural Evaluation: Which Platforms Best Fit REAVO?

### 4.1 REAVO's Architecture Profile
* **Frontend**: React 19 Single Page Application, Vite, Tailwind CSS, Lucide icons, Sonner toasts.
* **Backend**: Supabase (PostgreSQL with RLS, Supabase Auth, PostgreSQL RPC functions, Realtime).
* **Serverless Backend**: Express (`server.js`) running on Vercel handling KoraPay webhooks and admin disbursals.
* **Payment Gateway**: KoraPay (Nigerian Naira payments, webhook verification via HMAC SHA-256).
* **Target Audience & Context**: Nigerian university students using mobile devices on variable campus networks (WiFi / MTN / Airtel / Glo), requiring responsive ergonomics, WhatsApp delivery rider coordination, and trade-in appraisals.

---

### 4.2 Top Platform Recommendations Tailored for REAVO

Based on REAVO's specific architecture and transaction model, the following combination delivers optimal protection:

```
+---------------------------------------------------------------------------------------+
|                                REAVO QUALITY SHIELD                                   |
+---------------------------------------------------------------------------------------+
|  1. LOCAL DEV & PRs (Fast Gate)                                                       |
|     * Playwright (Installed): Smoke & Fortress suites running locally on Chromium,   |
|       Pixel 7, and iPhone 14 viewports.                                               |
|     * VibeEval Patterns: Client sanitization & price defense tests in e2e/.           |
+---------------------------------------------------------------------------------------+
|  2. CLOUD SYNTHETIC MONITORING (24/7 Production Uptime)                               |
|     * Checkly (Recommended): Runs REAVO's existing Playwright scripts against        |
|       https://reavo-app.vercel.app every 10 minutes from regional cloud runners.     |
|     * Zero test rewrites needed — directly executes REAVO's .spec.js files!          |
+---------------------------------------------------------------------------------------+
|  3. REAL-TIME STUDENT TELEMETRY & ERROR TRACKING                                      |
|     * Sentry with Session Replay (Recommended): Hooks into React 19 on Vercel to      |
|       capture student payment drop-offs, network timeouts, and Supabase edge failures |
|       with video-like session replays.                                                |
+---------------------------------------------------------------------------------------+
|  4. CONTINUOUS VIBE-CODING EXPANSION                                                  |
|     * Shiplight AI / Playwright MCP: For generating new regression tests as new      |
|       storefront features or admin views are created.                                 |
+---------------------------------------------------------------------------------------+
```

---

### 4.3 Deep-Dive: Why These Three Fit REAVO Perfectly

#### 1. VibeEval (Financial Integrity & Security Hardening)
* **Why REAVO needs it**: REAVO processes high-value electronics (₦500,000 to ₦2,500,000 iPhones and MacBooks) and handles ambassador payout disbursals via KoraPay.
* **What it protects against**:
  - Manipulated promo discount inputs attempting to produce negative order balances.
  - Race conditions during concurrent stock checkout.
  - Unintended Supabase table exposures or missing RLS policies on `public.staff_invites` and `public.payouts`.
* **Action taken in REAVO**: Implemented in `e2e/ecommerce-fortress.spec.js` (Test #1) with client-side regex sanitization in `CheckoutPage.jsx`.

#### 2. Sentry + Session Replay (Production Telemetry on Vercel)
* **Why REAVO needs it**: In Nigerian campus environments, student connections frequently drop or switch between cellular towers. When a KoraPay checkout modal fails or Supabase requests time out, standard server logs do not reveal client-side exceptions.
* **What it delivers**:
  - Video-like session replays showing the exact student click path before a checkout failure.
  - Automatic detection of unhandled React 19 rendering exceptions.
  - Web Vitals monitoring (Core Web Vitals, Cumulative Layout Shift, Latency) across mobile devices.

#### 3. Checkly (Synthetic 24/7 Cloud Testing for Playwright)
* **Why REAVO needs it**: Testing on `localhost` ensures code functions at build time, but does not monitor whether the live Vercel deployment (`reavo-app.vercel.app`), Supabase database connection, and KoraPay API endpoints remain operational around the clock.
* **Why it's a seamless fit**: Checkly is built entirely on Playwright. REAVO's existing `smoke.spec.js` and `ecommerce-fortress.spec.js` can run inside Checkly without changing a single line of code, pinging the live Vercel site on a scheduled cadence and dispatching alerts to Discord or WhatsApp if checkout or login degrades.

---

## 5. Implementation Roadmap & Quick Reference

| Phase | Tool / Action | Target Environment | Frequency | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Playwright Chromium & Mobile Matrix | Local Workstation | Pre-commit / Pre-push | **Active & Passing (100%)** |
| **Phase 2** | VibeEval Security Defense Suite | Local Workstation & CI | On PR / Deployment | **Active & Passing (100%)** |
| **Phase 3** | Connect Checkly to `reavo-app.vercel.app` | Cloud Production | Every 10-15 minutes | Ready for onboarding |
| **Phase 4** | Add `@sentry/react` to `main.jsx` | Vercel Live Storefront | Real-time continuous | Ready for onboarding |

---

*Documentation maintained by REAVO Engineering. For questions or test updates, consult `e2e/` or refer to the system audit in `conversations/artifacts/`.*
