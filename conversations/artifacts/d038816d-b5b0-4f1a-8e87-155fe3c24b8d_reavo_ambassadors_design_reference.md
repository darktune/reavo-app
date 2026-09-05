# REAVO Ambassadors Page — Complete Design Reference

> [!NOTE]
> Extracted from [https://emit-dome-71800164.figma.site/ambassadors](https://emit-dome-71800164.figma.site/ambassadors)
> Site: **REAVO Global Website Design** — Built with **Figma Make** (React + Tailwind CSS v4)
> Source files: `src/app/pages/Ambassadors.tsx` (4 components)

---

## 1. Global Design System

### 🎨 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| **Background** | `#0A0A0C` | Page base / deepest background |
| **Surface Elevated** | `#0D0D0F` | Section alternate backgrounds (WhatYouDo, Apply) |
| **Card Background** | `#111113` | Cards, form containers, elevated surfaces |
| **Inner Surface** | `#161618` | Card image placeholders, nested surfaces |
| **Primary Text** | `#F7F7F5` | Headings, labels, important text |
| **Secondary Text** | `#9A9A9E` | Body copy, descriptions, muted text |
| **Brand Accent (Purple)** | `#7C5CFF` | CTAs, badges, active states, brand identity |
| **Blue** | `#3D8BFF` | Secondary accent, "Students" category |
| **Teal** | `#39D9C4` | Tertiary accent, "Events" category |
| **Gold/Amber** | `#FFB800` | "Entrepreneurs" category |
| **Lime Green** | `#B4FF39` | "Gamers" category |
| **Coral** | `#FF6B4A` | "Schools" category |
| **Magenta** | `#C952FF` | "Photographers" category |
| **Destructive Red** | `#FF4444` | Error states |
| **WhatsApp Green** | `#25D366` | Chat widget |

### Border Colors
| Value | Usage |
|-------|-------|
| `rgba(255,255,255,0.07)` | Standard subtle dividers & borders |
| `rgba(255,255,255,0.08)` | Form container border |
| `rgba(255,255,255,0.1)` | Input field borders |
| `rgba(124,92,255,0.3)` | Ambassador badge border, success state border |
| `rgba(124,92,255,0.2)` | Purple accent borders |

### Selection & Overlay
| Value | Usage |
|-------|-------|
| `#7C5CFF33` | Text selection highlight (20% purple) |
| `rgba(10,10,12,0.96)` | Nav glassmorphism background |

---

### 🔤 Typography

#### Font Families
| Variable | Font | Usage |
|----------|------|-------|
| `C` | `'Plus Jakarta Sans', sans-serif` | Headings, brand title, buttons, labels |
| `D` | `'Inter', sans-serif` | Body text, descriptions, inputs |
| `F` | `'JetBrains Mono', monospace` | Badges, tags, stats, micro-labels |

**Google Fonts Import:**
- Plus Jakarta Sans: weights 500, 600, 700 (italic 500)
- Inter: weights 400, 500 (italic 400)
- JetBrains Mono: weights 400, 500

#### Type Scale

| Element | Font | Weight | Size | Line Height | Letter Spacing |
|---------|------|--------|------|-------------|----------------|
| **Hero H1** | Plus Jakarta Sans | 700 | `clamp(42px, 7vw, 88px)` | 0.95 | `-0.04em` |
| **Section H2** | Plus Jakarta Sans | 700 | `clamp(32px, 4vw, 52px)` | 1.0 | `-0.04em` |
| **Home Teaser H2** | Plus Jakarta Sans | 700 | `clamp(30px, 4vw, 50px)` | 1.05 | `-0.04em` |
| **Card H3** | Plus Jakarta Sans | 700 | `21px` | 1.2 | `-0.03em` |
| **Success H3** | Plus Jakarta Sans | 700 | `24px` | — | `-0.03em` |
| **Body Large** | Inter | 400 | `18px` | 1.7 | — |
| **Body** | Inter | 400 | `16px` | 1.7 | — |
| **Body Small** | Inter | 400 | `15px` | 1.7 | — |
| **Badge/Tag** | JetBrains Mono | 400 | `11px` | — | `0.1em`–`0.12em` |
| **Stat Number** | JetBrains Mono | 500 | `clamp(40px, 5vw, 60px)` | 1.0 | `-0.03em` |
| **Stat Label** | Inter | 400 | `13px` | — | — |
| **Nav Link** | Inter | 500 | `14px` | — | — |
| **Button** | Plus Jakarta Sans | 600 | `15px` | — | — |
| **Form Label** | Plus Jakarta Sans | 600 | `13px` | — | `-0.01em` |
| **Input Text** | Inter | 400 | `15px` | — | — |

---

### 📐 Layout Tokens

| Token | Value |
|-------|-------|
| **Max Width** (`te`) | `1200px` |
| **Horizontal Padding** (`Y`) | `clamp(20px, 4vw, 48px)` |
| **Nav Height** | `64px` |
| **Base Spacing Unit** | `4px` (0.25rem) |
| **Base Border Radius** | `8px` (0.5rem) |

---

## 2. Page Architecture

### Component Hierarchy
```
Ambassadors Page (nd)
├── AmbassadorHero (sd)    — Hero with radial glow + dot matrix
├── WhatYouDo (ld)         — 3-column card grid
├── WhatYouGet (dd)        — 2-column perks layout
└── ApplySection (gd)      — 2-column form + criteria
```

### Routing
```
/ ........................ Products (Home)
/about ................... About
/ambassadors ............. Ambassadors ← THIS PAGE
/partnerships ............ Partnerships
```

---

## 3. Section-by-Section Breakdown

---

### Section 1: AmbassadorHero (`sd`)

#### Layout
```css
section {
  padding: clamp(80px, 12vh, 120px) clamp(20px, 4vw, 48px) clamp(60px, 8vh, 96px);
  position: relative;
  overflow: hidden;
}
```

#### Background Effects

**Purple Radial Glow:**
```css
.glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse 55% 45% at 50% -5%,
    rgba(124, 92, 255, 0.16) 0%,
    transparent 65%
  );
}
```

**Dot Matrix Pattern:**
```css
.dots {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 32px 32px;
}
```

#### Content Container
```css
.container { max-width: 1200px; margin: 0 auto; position: relative; }
.content { max-width: 740px; }
```

#### Badge Pill
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  border: 1px solid rgba(124, 92, 255, 0.3);
  border-radius: 100px;
  padding: 6px 14px;
  margin-bottom: 48px;
}
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #7C5CFF;
}
.badge-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #7C5CFF;
  letter-spacing: 0.1em;
}
```

#### Text Content
| Element | Text |
|---------|------|
| Badge | `AMBASSADOR PROGRAM` |
| H1 Line 1 | `"This isn't a` |
| H1 Line 2 | `promo gig.` |
| H1 Line 3 (purple) | `It's a launchpad."` |
| Subtitle | `REAVO Ambassadors are student leaders who carry the brand on their campus — and earn real rewards, real network, and real experience doing it.` |
| CTA Button | `Apply now →` (anchors to `#apply`) |

#### H1 Styles
```css
h1 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: clamp(42px, 7vw, 88px);
  line-height: 0.95;
  letter-spacing: -0.04em;
  color: #F7F7F5;
  margin: 0 0 28px;
}
h1 span { color: #7C5CFF; }  /* "It's a launchpad." */
```

#### Subtitle Styles
```css
p {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  color: #9A9A9E;
  max-width: 500px;
  line-height: 1.7;
  margin: 0 0 44px;
}
```

#### Primary CTA Button
```css
.cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 600;
  font-size: 15px;
  background: #7C5CFF;
  color: #fff;
  padding: 13px 28px;
  border-radius: 10px;
  text-decoration: none;
  transition: opacity 0.2s;
}
.cta-primary:hover { opacity: 0.85; }
```
**Icon:** Lucide `ArrowRight`, size 16, strokeWidth 2.5

---

### Section 2: WhatYouDo (`ld`)

#### Layout
```css
section {
  padding: 96px clamp(20px, 4vw, 48px);
  background: #0D0D0F;
  border-top: 1px solid rgba(255,255,255, 0.07);
}
```

#### Section Header
| Element | Text |
|---------|------|
| Badge | `WHAT AMBASSADORS DO` |
| H2 | `Three things. Done well.` |

```css
.section-header { margin-bottom: 56px; }
.section-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #9A9A9E;
  letter-spacing: 0.12em;
  margin: 0 0 16px;
}
```

#### Card Grid
```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
```

#### Cards (×3)

**Card Container:**
```css
.card {
  background: #111113;
  border: 1px solid rgba(255,255,255, 0.07);
  border-radius: 16px;
  overflow: hidden;
}
```

**Card Image:**
```css
.card-image-container {
  background: #161618;
  aspect-ratio: 4/3;
  overflow: hidden;
  position: relative;
}
.card-image { width: 100%; height: 100%; object-fit: cover; display: block; }
.card-accent-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--card-accent);
}
```

**Card Body:**
```css
.card-body { padding: 28px 28px 32px; }
.card-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 21px;
  color: #F7F7F5;
  letter-spacing: -0.03em;
  margin: 0 0 14px;
  line-height: 1.2;
}
.card-body-text {
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: #9A9A9E;
  line-height: 1.7;
  margin: 0;
}
```

#### Card Data

| # | Title | Body | Accent | Image |
|---|-------|------|--------|-------|
| 1 | Be the face on campus. | You're the first person students think of when they need tech. You represent REAVO's values — premium, trustworthy, community-first — not just its products. | `#7C5CFF` | `IMG_0040.76a84aa5.jpeg` |
| 2 | Facilitate real sales. | Connect fellow students to the right tech. Guide them, answer questions, and earn commission on every sale you help close. This is active work, not passive posting. | `#3D8BFF` | `IMG_0022.6635a07a.jpeg` |
| 3 | Build your leadership track. | Run activations, support trade fair setups, and grow into an area coordinator. REAVO ambassadors don't stay still — the path goes up. | `#FFB800` | `20.619ea173.jpeg` |

**Full Image URLs (prepend site origin):**
```
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0040.76a84aa5.jpeg
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0022.6635a07a.jpeg
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/20.619ea173.jpeg
```

---

### Section 3: WhatYouGet (`dd`)

#### Layout
```css
section {
  padding: 96px clamp(20px, 4vw, 48px);
  border-top: 1px solid rgba(255,255,255, 0.07);
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px 72px;
  align-items: center;
}
```

#### Left Column — Header

| Element | Text |
|---------|------|
| Badge | `WHAT YOU GET` |
| H2 Line 1 | `Real rewards.` |
| H2 Line 2 | `Not exposure.` |
| Paragraph | `REAVO doesn't trade on "great for your CV." Ambassadors earn tangible value — money, access, network, and a real path forward.` |

#### Right Column — Perks List

```css
.perk-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255,255,255, 0.07);
  /* last item: border-bottom: none */
}
.perk-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--perk-accent);
  flex-shrink: 0;
}
.perk-text {
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: #F7F7F5;
  line-height: 1.4;
}
```

| # | Perk | Dot Color |
|---|------|-----------|
| 1 | Commission on every sale you facilitate | `#7C5CFF` |
| 2 | Early access to new REAVO products | `#3D8BFF` |
| 3 | Network of campus leaders across Nigeria | `#39D9C4` |
| 4 | Official REAVO brand kit and merch | `#FFB800` |
| 5 | Letters of recommendation for top performers | `#B4FF39` |
| 6 | Pathway to Area Coordinator role | `#FF6B4A` |

---

### Section 4: ApplySection (`gd`)

#### Layout
```css
section#apply {
  padding: 96px clamp(20px, 4vw, 48px);
  background: #0D0D0F;
  border-top: 1px solid rgba(255,255,255, 0.07);
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px 72px;
  align-items: start;
}
```

#### Left Column — Info

| Element | Text |
|---------|------|
| Badge | `HOW TO APPLY` |
| H2 Line 1 | `One form.` |
| H2 Line 2 | `No performance needed.` |
| Paragraph | `Tell us who you are and why you'd make a great REAVO Ambassador on your campus. We'll review every application personally — no automated filters.` |

#### Criteria Checklist
```css
.criteria-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
/* Icon: Lucide CheckCircle, size 18, color #7C5CFF, flex-shrink 0, margin-top 1 */
.criteria-text {
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: #9A9A9E;
  line-height: 1.5;
}
```

| Criteria |
|----------|
| ✓ Active student at a Nigerian university |
| ✓ Genuine interest in technology |
| ✓ Someone people on your campus actually listen to |

#### Right Column — Application Form

**Form Container:**
```css
form {
  background: #111113;
  border: 1px solid rgba(255,255,255, 0.08);
  border-radius: 16px;
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
```

**Form Label:**
```css
label {
  display: block;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: #F7F7F5;
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}
```

**Input Styles:**
```css
input, textarea {
  width: 100%;
  box-sizing: border-box;
  background: #111113;
  border: 1px solid rgba(255,255,255, 0.1);
  border-radius: 10px;
  padding: 13px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: #F7F7F5;
  outline: none;
  transition: border-color 0.2s;
}
input:focus, textarea:focus { border-color: #7C5CFF; }
textarea { resize: vertical; line-height: 1.6; }
```

#### Form Fields

| # | Label | Name | Type | Placeholder | Required |
|---|-------|------|------|-------------|----------|
| 1 | Your name | `name` | text | `Tolu Adeyemi` | ✓ |
| 2 | Your university | `uni` | text | `Covenant University` | ✓ |
| 3 | Instagram or X handle | `handle` | text | `@yourhandle` | — |
| 4 | Email address | `email` | email | `you@email.com` | ✓ |
| 5 | Why do you want to be a REAVO Ambassador? | `why` | textarea (4 rows) | `Tell us about yourself and your campus...` | — |

#### Submit Button
```css
button[type="submit"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 600;
  font-size: 15px;
  background: #7C5CFF;
  color: #fff;
  padding: 14px 28px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 4px;
}
button:hover { opacity: 0.85; }
```
Text: `Apply now →` (with Lucide ArrowRight icon)

#### Success State
```css
.success-card {
  background: #111113;
  border: 1px solid rgba(124, 92, 255, 0.3);
  border-radius: 16px;
  padding: 48px 40px;
  text-align: center;
}
```

| Element | Content |
|---------|---------|
| Icon | `✦` (40px) |
| H3 | `Application received.` |
| Body | `We review every application personally. You'll hear from us at {email}.` |

---

## 4. Animation System

### Scroll Reveal (IntersectionObserver)
```javascript
// Trigger: threshold 0.1, fires once, respects prefers-reduced-motion
function fadeSlideIn(isVisible, delay = 0) {
  return {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'none' : 'translateY(22px)',
    transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`
  };
}
```

**Stagger Delays:**
- WhatYouDo cards: `0ms`, `80ms`, `160ms`
- WhatYouGet perks: `0ms`, `60ms`, `120ms`, `180ms`, `240ms`, `300ms`
- Apply form column: `120ms` delay

### Button Hover
```css
transition: opacity 0.2s;
/* :hover → opacity: 0.85 */
```

### Input Focus
```css
transition: border-color 0.2s;
/* :focus → border-color: #7C5CFF */
```

### Nav Glassmorphism
```css
nav {
  transition: background 0.4s, border-color 0.4s;
}
/* on scroll → background: rgba(10,10,12,0.96), backdropFilter: blur(24px) */
```

---

## 5. Navigation Component

### Sticky Nav Bar
```css
nav {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 clamp(20px, 4vw, 48px);
  /* transparent → glassmorphic on scroll */
}
```

### Logo
- **Icon:** 32×32 square with `border-radius: 7px`, colored background (rotates through category colors), contains white "R" letter
- **Brand Name:** `REAVO` (Plus Jakarta Sans, 700, 18px) + `GLOBAL` (JetBrains Mono, 9.5px, `#9A9A9E`)

### Nav Links
```
Products  →  /
About     →  /about
Ambassadors → /ambassadors
Partnerships → /partnerships
```

```css
.nav-link {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #9A9A9E; /* active: #F7F7F5 */
  text-decoration: none;
  transition: color 0.2s;
}
.nav-link:hover { color: #F7F7F5; }
```

---

## 6. All Image Assets (Full URLs)

### Ambassador Page Images
```
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0040.76a84aa5.jpeg
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0022.6635a07a.jpeg
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/20.619ea173.jpeg
```

### Community/Lifestyle Photos
```
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/DSC04369.b9a907ea.jpeg
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/6.a6921430.jpeg
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/26.37738781.jpeg
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/21.a3a213b3.jpeg
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/2.adc787b5.jpeg
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0408-1.5bc18a03.jpeg
```

### Campus Photos — Covenant University
```
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0203.318a82ed.jpeg
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0335.ea9bbfbb.jpeg
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0358.070b81ee.jpeg
```

### Campus Photos — Caleb University
```
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0303-1.0dbd5734.jpeg
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0311.1547b02a.jpeg
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0464.8079a1c8.jpeg
```

### Campus Photos — Landmark University
```
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0255.fb2308c7.jpeg
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0275.9046d256.jpeg
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0268.8da61c04.jpeg
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0419-1.e62ace62.jpeg
```

### About Page Images
```
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/24.b092a7df.jpeg
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0123.a3705df4.jpeg
https://emit-dome-71800164.figma.site/_components/v2/30d1827fe34837c08bb982e13e2d71d7d108eee4/IMG_0385.24964c0d.jpeg
```

### Product Images (Unsplash CDN)
```
https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&h=600&fit=crop&auto=format
https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop&auto=format
https://images.unsplash.com/photo-1606741965429-8d76ff50bb2f?w=480&h=480&fit=crop&auto=format
https://images.unsplash.com/photo-1606741965326-cb990ae01bb2?w=480&h=480&fit=crop&auto=format
https://images.unsplash.com/photo-1583394838336-acd977736f90?w=480&h=480&fit=crop&auto=format
https://images.unsplash.com/photo-1530435460869-d13625c69bbf?w=600&h=600&fit=crop&auto=format
https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop&auto=format
```

---

## 7. Icons (Lucide React v0.487.0)

| Icon | Usage | Props |
|------|-------|-------|
| `ArrowRight` | CTA buttons | size: 16, strokeWidth: 2.5 |
| `CheckCircle` | Criteria checklist | size: 18, color: `#7C5CFF` |
| `ShoppingBag` | Cart icon | — |
| `Trash2` | Cart remove | — |
| `X` | Close modals | — |
| `Send` | Chatbot send | — |
| `Menu` | Mobile nav toggle | — |

---

## 8. Key Design Patterns

### Dot Matrix Background
```css
background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
background-size: 32px 32px;
```

### Radial Glow
```css
/* Purple glow (Ambassador) */
background: radial-gradient(ellipse 55% 45% at 50% -5%, rgba(124,92,255,0.16) 0%, transparent 65%);

/* Blue glow (About) */
background: radial-gradient(ellipse 50% 40% at 50% -5%, rgba(61,139,255,0.12) 0%, transparent 65%);
```

### Pill Badge Pattern
```css
.pill-badge {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  border: 1px solid rgba(var(--accent-rgb), 0.3);
  border-radius: 100px;
  padding: 6px 14px;
}
```

### Card Accent Bar Pattern
```css
/* 3px colored bar at top of card image */
.accent-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--accent-color);
}
```

### Colored Dot + Text Row
```css
.dot-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255,255,255, 0.07);
}
```

---

## 9. Responsive Breakpoints

| Breakpoint | Width |
|-----------|-------|
| **sm** | `640px` (40rem) |
| **md** | `768px` (48rem) |

> [!IMPORTANT]
> The card grid uses `repeat(auto-fill, minmax(300px, 1fr))` for automatic responsive behavior without breakpoints. The 2-column grids (`1fr 1fr`) will need breakpoint handling for mobile.

---

## 10. Footer Quick Links

### Categories
Creators, Photographers, Gamers, Students, Entrepreneurs, Schools & Institutions, Events

### Company Links
- About REAVO → `/about`
- Ambassador Program → `/ambassadors`
- Partnerships → `/partnerships`

### Contact
- `contact@reavoglobal.com`
- `partnerships@reavoglobal.com`
- `@reavoglobal`
