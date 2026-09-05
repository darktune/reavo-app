# 🧵 Stitch Super Prompt — REAVO Ambassadors Page Redesign

> Copy everything below the line and paste it directly into [stitch.google](https://stitch.google)

---

Build a full-page, dark-themed "Ambassador Program" landing page for a premium tech lifestyle brand called **REAVO Global**. The page should feel ultra-premium, minimal, and editorial — like a high-end portfolio meets a startup landing page. Use a near-black background with soft off-white text and electric purple as the primary accent color.

---

## DESIGN SYSTEM

**Color Palette:**
- Page background: `#0A0A0C` (near-black)
- Alternate section background: `#0D0D0F`
- Card/elevated surface: `#111113`
- Inner surface: `#161618`
- Primary text: `#F7F7F5` (off-white)
- Secondary/muted text: `#9A9A9E`
- Brand accent (purple): `#7C5CFF`
- Blue accent: `#3D8BFF`
- Teal accent: `#39D9C4`
- Gold accent: `#FFB800`
- Lime accent: `#B4FF39`
- Coral accent: `#FF6B4A`
- Subtle borders: `rgba(255,255,255,0.07)`
- Purple-tinted borders: `rgba(124,92,255,0.3)`
- Selection highlight: `#7C5CFF` at 20% opacity

**Typography:**
- Headings & buttons: "Plus Jakarta Sans", sans-serif — weight 600-700
- Body text & inputs: "Inter", sans-serif — weight 400-500
- Badges, tags, stats: "JetBrains Mono", monospace — weight 400-500
- All uppercase micro-labels use JetBrains Mono at 11px with letter-spacing 0.1em–0.12em

**Spacing & Layout:**
- Max content width: 1200px, centered
- Horizontal page padding: responsive `clamp(20px, 4vw, 48px)`
- Section vertical padding: 96px top/bottom
- Card border-radius: 16px
- Button border-radius: 10px
- Pill/badge border-radius: 100px (full pill)

---

## STICKY NAVIGATION BAR (top of page)

Height 64px, sticky at top, z-index 50. Starts transparent, gains a frosted glass effect on scroll (`backdrop-filter: blur(24px)`, `background: rgba(10,10,12,0.96)`, bottom border `rgba(255,255,255,0.07)`). Transition: `background 0.4s, border-color 0.4s`.

**Left side — Logo:**
- A 32×32px rounded square (border-radius 7px) filled with `#7C5CFF`, containing a white bold "R" letter (14px)
- Next to it: "REAVO" in Plus Jakarta Sans 700 18px white, then "GLOBAL" in JetBrains Mono 9.5px `#9A9A9E` with letter-spacing 0.12em

**Center — Nav Links (horizontal, gap 28px):**
- "Products" | "About" | "Ambassadors" (active, white) | "Partnerships"
- Style: Inter 500 14px, `#9A9A9E` default, `#F7F7F5` on hover/active, transition color 0.2s

**Right side:**
- A shopping bag icon with a small purple badge counter
- A hamburger menu icon (mobile only)

---

## SECTION 1: HERO — "AmbassadorHero"

Full-width section. Padding: `clamp(80px, 12vh, 120px)` top, `clamp(60px, 8vh, 96px)` bottom. Position relative, overflow hidden.

**Background Effects (layered, absolute, full-bleed):**
1. A purple radial glow at the top: `radial-gradient(ellipse 55% 45% at 50% -5%, rgba(124,92,255,0.16) 0%, transparent 65%)` — creates a soft purple aurora bleeding down from above
2. A subtle dot matrix pattern overlay: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)` with `background-size: 32px 32px` — gives a technical grid texture

**Content (max-width 740px, left-aligned):**

- **Pill Badge:** An inline-flex pill with a 6px purple dot + the text "AMBASSADOR PROGRAM" in JetBrains Mono 11px `#7C5CFF`, letter-spacing 0.1em. Border: `1px solid rgba(124,92,255,0.3)`, padding 6px 14px, border-radius 100px. Margin-bottom 48px.

- **Heading H1:** Three lines of text, font Plus Jakarta Sans 700, size `clamp(42px, 7vw, 88px)`, line-height 0.95, letter-spacing -0.04em, color `#F7F7F5`:
  - Line 1: `"This isn't a`
  - Line 2: `promo gig.`
  - Line 3 (in `#7C5CFF` purple): `It's a launchpad."`
  Note the smart quotes — the entire phrase is in quotation marks.

- **Subtitle:** "REAVO Ambassadors are student leaders who carry the brand on their campus — and earn real rewards, real network, and real experience doing it." — Inter 18px `#9A9A9E`, line-height 1.7, max-width 500px, margin-bottom 44px.

- **CTA Button:** "Apply now →" (with a Lucide ArrowRight icon, size 16). Style: inline-flex, gap 8px, Plus Jakarta Sans 600 15px, background `#7C5CFF`, color white, padding 13px 28px, border-radius 10px. Hover: opacity drops to 0.85 with 0.2s transition. Links to `#apply` anchor.

**Scroll Animation:** All content fades in from 22px below with `opacity 0→1, translateY(22px)→0` over 0.65s ease, triggered by IntersectionObserver.

---

## SECTION 2: "What You Do" — 3-Column Card Grid

Background: `#0D0D0F`. Border-top: `1px solid rgba(255,255,255,0.07)`. Padding: 96px horizontal-padding.

**Section Header (margin-bottom 56px):**
- Micro-label: "WHAT AMBASSADORS DO" — JetBrains Mono 11px `#9A9A9E`, letter-spacing 0.12em, margin-bottom 16px
- H2: "Three things. Done well." — Plus Jakarta Sans 700 `clamp(32px, 4vw, 52px)`, line-height 1, letter-spacing -0.04em, white

**Card Grid:** `display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px`

**Each Card (3 total):**
Container: background `#111113`, border `1px solid rgba(255,255,255,0.07)`, border-radius 16px, overflow hidden.

- **Image area:** aspect-ratio 4/3, background `#161618`, `object-fit: cover`. At the very top of the image is a 3px-tall colored accent bar (full width, absolute positioned).
- **Text area:** padding 28px 28px 32px.
  - Title: Plus Jakarta Sans 700 21px white, letter-spacing -0.03em, line-height 1.2, margin-bottom 14px
  - Body: Inter 15px `#9A9A9E`, line-height 1.7

**Card 1:** Accent bar `#7C5CFF`. Title: "Be the face on campus." Body: "You're the first person students think of when they need tech. You represent REAVO's values — premium, trustworthy, community-first — not just its products." Image: a photo of a young ambassador with branded REAVO products.

**Card 2:** Accent bar `#3D8BFF`. Title: "Facilitate real sales." Body: "Connect fellow students to the right tech. Guide them, answer questions, and earn commission on every sale you help close. This is active work, not passive posting." Image: a photo of a student showing tech products to peers.

**Card 3:** Accent bar `#FFB800`. Title: "Build your leadership track." Body: "Run activations, support trade fair setups, and grow into an area coordinator. REAVO ambassadors don't stay still — the path goes up." Image: a photo of a student leading a campus event.

**Scroll Animation:** Cards stagger in with delays of 0ms, 80ms, 160ms using the same fade-slide animation (translateY 22px, 0.65s ease).

---

## SECTION 3: "What You Get" — 2-Column Perks Layout

Background: `#0A0A0C`. Border-top: `1px solid rgba(255,255,255,0.07)`. Padding: 96px horizontal-padding.

**Layout:** `grid-template-columns: 1fr 1fr; gap: 40px 72px; align-items: center`

**Left Column:**
- Micro-label: "WHAT YOU GET" — JetBrains Mono 11px `#9A9A9E`, letter-spacing 0.12em
- H2 (two lines):
  - "Real rewards."
  - "Not exposure."
  — Plus Jakarta Sans 700, `clamp(32px, 4vw, 52px)`, white, line-height 1, letter-spacing -0.04em
- Paragraph: `REAVO doesn't trade on "great for your CV." Ambassadors earn tangible value — money, access, network, and a real path forward.` — Inter 16px `#9A9A9E`, line-height 1.7

**Right Column — Perks list (vertical stack, no gap between rows):**
Each row: `display: flex; align-items: center; gap: 14px; padding: 16px 0`. Separated by `border-bottom: 1px solid rgba(255,255,255,0.07)` (last item has no border). Each has a small colored dot (8px circle) and text in Inter 15px `#F7F7F5`, line-height 1.4.

| Perk | Dot Color |
|------|-----------|
| Commission on every sale you facilitate | `#7C5CFF` |
| Early access to new REAVO products | `#3D8BFF` |
| Network of campus leaders across Nigeria | `#39D9C4` |
| Official REAVO brand kit and merch | `#FFB800` |
| Letters of recommendation for top performers | `#B4FF39` |
| Pathway to Area Coordinator role | `#FF6B4A` |

**Scroll Animation:** Perks stagger in with 60ms increments (0, 60, 120, 180, 240, 300ms).

---

## SECTION 4: "Apply Section" — 2-Column Form Layout

ID: `apply`. Background: `#0D0D0F`. Border-top: `1px solid rgba(255,255,255,0.07)`. Padding: 96px horizontal-padding.

**Layout:** `grid-template-columns: 1fr 1fr; gap: 40px 72px; align-items: start`

**Left Column — Info:**
- Micro-label: "HOW TO APPLY"
- H2 (two lines): "One form." / "No performance needed." — same heading style as other sections
- Paragraph: "Tell us who you are and why you'd make a great REAVO Ambassador on your campus. We'll review every application personally — no automated filters." — Inter 16px `#9A9A9E`, margin-bottom 32px

- **Criteria checklist (3 items, vertical, gap 16px):**
  Each row: flex, gap 12px. A purple CheckCircle icon (Lucide, 18px, `#7C5CFF`) + text in Inter 15px `#9A9A9E`.
  1. "Active student at a Nigerian university"
  2. "Genuine interest in technology"
  3. "Someone people on your campus actually listen to"

**Right Column — Application Form:**
Container: background `#111113`, border `1px solid rgba(255,255,255,0.08)`, border-radius 16px, padding 36px 32px. Flex column, gap 20px.

**Form Labels:** Plus Jakarta Sans 600 13px `#F7F7F5`, margin-bottom 8px, letter-spacing -0.01em, display block.

**Input Styles:** width 100%, box-sizing border-box, background `#111113`, border `1px solid rgba(255,255,255,0.1)`, border-radius 10px, padding 13px 16px, Inter 15px `#F7F7F5`, outline none. On focus: `border-color: #7C5CFF` (transition 0.2s). Placeholder text is muted.

**Fields:**
1. Label: "Your name" | input text | placeholder: "Tolu Adeyemi" | required
2. Label: "Your university" | input text | placeholder: "Covenant University" | required
3. Label: "Instagram or X handle" | input text | placeholder: "@yourhandle"
4. Label: "Email address" | input email | placeholder: "you@email.com" | required
5. Label: "Why do you want to be a REAVO Ambassador?" | textarea (4 rows) | placeholder: "Tell us about yourself and your campus..." | resize vertical, line-height 1.6

**Submit Button:** "Apply now →" (with ArrowRight icon). Same style as hero CTA: inline-flex, center-justified, gap 8px, Plus Jakarta Sans 600 15px, `#7C5CFF` background, white text, padding 14px 28px, border-radius 10px, border none, cursor pointer. Hover: opacity 0.85. Margin-top 4px.

**Success State (replaces form on submit):**
A centered card: background `#111113`, border `1px solid rgba(124,92,255,0.3)`, border-radius 16px, padding 48px 40px, text-align center.
- Symbol: "✦" at 40px, margin-bottom 20px
- H3: "Application received." — Plus Jakarta Sans 700 24px white, letter-spacing -0.03em
- Body: "We review every application personally. You'll hear from us at {submitted email}." — Inter 16px `#9A9A9E`

---

## GLOBAL ANIMATIONS & INTERACTIONS

1. **Scroll Reveal:** Every major content block animates in when it enters the viewport (threshold 0.1). Start state: `opacity: 0; transform: translateY(22px)`. End state: `opacity: 1; transform: none`. Duration: 0.65s ease. Fires once. Respects `prefers-reduced-motion`.

2. **Button Hover:** All CTA buttons: `transition: opacity 0.2s`. On hover → `opacity: 0.85`.

3. **Input Focus:** `transition: border-color 0.2s`. On focus → `border-color: #7C5CFF`.

4. **Nav Glassmorphism:** On scroll beyond 48px → `background: rgba(10,10,12,0.96)`, `backdrop-filter: blur(24px)`, `border-bottom: 1px solid rgba(255,255,255,0.07)`. Transition: 0.4s.

5. **No visible scrollbars:** `scrollbar-width: none; ::-webkit-scrollbar { display: none; }`. Smooth scrolling: `html { scroll-behavior: smooth; }`.

---

## DESIGN MOOD & OVERALL FEEL

The page should feel like a luxury tech brand's recruitment page — think Apple meets a venture studio's career page. Ultra-clean dark UI with generous whitespace. No clutter. The purple accent should feel electric but not overwhelming — it appears on CTAs, badge pills, the hero accent line, and icon highlights. Typography is sharp, tight-tracked for headings (-0.04em) and generous line-height for body copy (1.7). The dot-matrix pattern and radial glow in the hero give it a subtle "tech" texture without being busy. Cards are minimal with strong typography hierarchy. The overall scroll experience should feel smooth and cinematic — content slides up elegantly as you scroll.
