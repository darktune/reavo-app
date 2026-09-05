# 🎨 Loom — Stitch UI Design Prompt

> [!NOTE]
> This prompt was built by analyzing all **17 reference images** you saved. Your visual references reveal a very clear and consistent design language — here's what I extracted:

---

## 📸 What Your References Tell Me

Your moodboard consistently shows:

````carousel
### Color Palette References
Multiple images define your exact palette — burgundy wine tones ranging from deep maroon to cherry red, paired with ivory cream and soft whites. Gold accents appear in premium branding examples.

![Color palette swatches](C:/Users/USER/.gemini/antigravity/brain/3b1dc3c1-b1cd-465f-83ce-37c7853bbe2c/references/1088252697475146242.jpg)
<!-- slide -->
### Burgundy + Cream Core
The most recurring pairing: deep burgundy (`#66001F`) against cream (`#FEFCEF`). This is your brand DNA.

![Burgundy and cream](C:/Users/USER/.gemini/antigravity/brain/3b1dc3c1-b1cd-465f-83ce-37c7853bbe2c/references/1970393583952429.jpg)
<!-- slide -->
### Ivory Cream & Burgundy
Elegant serif typography on a clean split — Ivory Cream `#FFFAEF` and Burgundy `#850321`.

![Ivory and burgundy](C:/Users/USER/.gemini/antigravity/brain/3b1dc3c1-b1cd-465f-83ce-37c7853bbe2c/references/582582901839439009.jpg)
<!-- slide -->
### Brand Identity Inspiration
Premium fashion branding: burgundy backgrounds, gold foil monogram logos, cream labels, elegant packaging.

![Brand identity](C:/Users/USER/.gemini/antigravity/brain/3b1dc3c1-b1cd-465f-83ce-37c7853bbe2c/references/815644182549006414.jpg)
<!-- slide -->
### The Tricolor System
Black + Burgundy (`#6D001A`) + White — with silk/satin fabric textures as background elements.

![Black burgundy white](C:/Users/USER/.gemini/antigravity/brain/3b1dc3c1-b1cd-465f-83ce-37c7853bbe2c/references/670966044524888914.jpg)
<!-- slide -->
### Extended Palette
Deeper tones: Cotton `#EDEBDD`, Cherry Red `#810100`, Maroon `#630000`, Noir Black `#1B1717`.

![Extended palette](C:/Users/USER/.gemini/antigravity/brain/3b1dc3c1-b1cd-465f-83ce-37c7853bbe2c/references/621356079892906530.jpg)
<!-- slide -->
### Professional Layout Inspiration
"Vanillia" template — black & white photography with burgundy accent typography, editorial grid layouts.

![Vanillia template](C:/Users/USER/.gemini/antigravity/brain/3b1dc3c1-b1cd-465f-83ce-37c7853bbe2c/references/1138214505808644649.jpg)
<!-- slide -->
### Gradient Background
Soft burgundy-to-cream gradient mesh — perfect for glassmorphism backgrounds.

![Gradient mesh](C:/Users/USER/.gemini/antigravity/brain/3b1dc3c1-b1cd-465f-83ce-37c7853bbe2c/references/738731145157222085.jpg)
````

---

## ✂️ Copy This Into Stitch

```
LOOM — 3D Fashion E-Commerce Platform UI Design

═══════════════════════════════════════════════════
BRAND IDENTITY
═══════════════════════════════════════════════════

App Name: LOOM
Tagline: "Where Fashion Meets Dimension"
Industry: Premium 3D fashion e-commerce for bespoke African tailoring
Flagship Brand: Abraham's Collection
Mood: Luxurious, minimal, editorial, museum-gallery, high-fashion

═══════════════════════════════════════════════════
COLOR PALETTE (EXACT HEX VALUES)
═══════════════════════════════════════════════════

Primary:
  • Burgundy Wine:     #5B0F18  (deep, rich — primary brand color)
  • Cherry Burgundy:   #800020  (medium burgundy — CTAs, buttons)
  • Maroon:            #630000  (darker shade — hover states, depth)

Secondary:
  • Ivory Cream:       #FFFAEF  (warm white — primary light background)
  • Soft Cream:        #F8F1E7  (slightly warmer — card backgrounds)
  • Cotton:            #EDEBDD  (muted warm — secondary surfaces)

Neutrals:
  • Pure White:        #FFFFFF  (text on dark, highlights)
  • Baby Barn Owl:     #C4C1B8  (muted gray-beige — secondary text)
  • Intrigue:          #635B51  (warm gray — subtle text, borders)
  • Noir Black:        #1B1717  (near-black — deep backgrounds)
  • Seal Brown:        #301415  (darkest burgundy-black — hero sections)

Accent:
  • Gold Foil:         #C9A96E  (gold — premium badges, monograms)

Glass Effects:
  • Glass Light:       rgba(255, 250, 239, 0.08)  (cream at 8% — frost on dark)
  • Glass Burgundy:    rgba(91, 15, 24, 0.15)     (burgundy tint — frost panels)
  • Backdrop Blur:     blur(24px)

═══════════════════════════════════════════════════
TYPOGRAPHY
═══════════════════════════════════════════════════

Display / Logo:
  • Font: "Playfair Display" (elegant serif — like the branding references)
  • Weight: 300 (light) to 700 (bold)
  • Use: LOOM wordmark, section headings, hero text
  • Style: Italic variants for editorial elegance

Body / UI:
  • Font: "Inter" or "Poppins"
  • Weight: 300 (light) to 500 (medium)
  • Use: Body text, buttons, labels, inputs
  • Letter-spacing: 0.02em for body, 0.15em for UPPERCASE labels

Monogram / Brand Mark:
  • Elegant interlocking "L" monogram in the style of the
    Joseane Lins branding reference — thin serif letterform
    inside a rounded oval frame, gold on burgundy

═══════════════════════════════════════════════════
DESIGN LANGUAGE & RULES
═══════════════════════════════════════════════════

Layout Philosophy:
  • NO traditional navbars or sidebars — the 3D canvas is ALWAYS the hero
  • Massive negative space — let the garments breathe
  • Editorial fashion magazine layouts (asymmetric grids, overlapping elements)
  • "Ghost Buttons" — thin 1px white/cream borders, transparent fill
  • Floating UI elements over the 3D canvas (glassmorphism panels)

Glassmorphism (inspired by iOS 26 + your gradient mesh reference):
  • Frosted glass panels: background rgba(255,250,239,0.08), backdrop-blur(24px)
  • Subtle 1px borders: rgba(255,255,255,0.1)
  • Border-radius: 20-28px on all cards, modals, drawers
  • No hard drop shadows — use soft burgundy-tinted box-shadows instead:
    box-shadow: 0 8px 32px rgba(91, 15, 24, 0.2)

Imagery Style (from your editorial references):
  • Black & white photography for fashion shots (high contrast)
  • Burgundy color accents overlaid on B&W photos
  • Silk/satin fabric textures as subtle background elements
  • Polaroid-style photo frames for lookbook images

Micro-interactions:
  • Buttons: scale(1.03) on hover with 0.3s ease
  • All interactive elements: subtle burgundy glow on hover
    (box-shadow: 0 0 20px rgba(128,0,32,0.3))
  • Modals: fade-in + slide-up (translateY(20px) → translateY(0))
  • Page transitions: smooth cross-fade with 0.5s duration

═══════════════════════════════════════════════════
SCREENS TO DESIGN (6 TOTAL)
═══════════════════════════════════════════════════

─── SCREEN 1: LANDING / HERO PAGE ───

Background: Deep Seal Brown (#301415) to Noir Black (#1B1717) gradient
Center: A 3D mannequin wearing an elegant garment occupies 60% of the
viewport, slowly rotating. Museum-style spotlight illumination from above.

Top-center: "LOOM" wordmark in Playfair Display, ultra-thin weight (300),
letter-spacing 0.3em, Pure White (#FFFFFF). Below it in small caps:
"WHERE FASHION MEETS DIMENSION" in Inter Light, #C4C1B8.

Above the wordmark: Small elegant "L" monogram in gold (#C9A96E)
inside a thin oval frame.

Bottom-center: A single ghost button with thin cream border —
"Enter the Atelier →" in Inter Light.

Subtle burgundy gradient glow emanating from beneath the mannequin
(radial gradient of #5B0F18 at 30% opacity).

Small floating text bottom-right: "Abraham's Collection" in
cream italics, very subtle.

No navbar. No footer. Pure immersion.

─── SCREEN 2: THE ATELIER (3D SHOWROOM) ───

Full-screen 3D canvas. Dark background (#1B1717) with soft museum
spotlights casting warm light on the central garment.

The garment (e.g., an Agbada or bespoke jacket) is centered and
rotatable by the user. Subtle grid lines on the floor to give
spatial context (very faint, #301415).

Floating UI elements (all glassmorphism):

  TOP-LEFT: Minimal breadcrumb — "LOOM / Agbada No. 01" in
  Inter Light, cream color, tiny size.

  TOP-RIGHT: Pill-shaped currency toggle:
  [ USD | ₦ NGN ] — cream border, burgundy highlight on active side.
  12px border-radius, 40px height.

  BOTTOM-RIGHT: Ghost button "Purchase — $450" with thin cream
  border. On hover, border transitions to burgundy with soft glow.

  When user clicks a hotspot on the 3D model (e.g., the chest area),
  a small glassmorphism info card pops up near the click point:
    ┌─────────────────────┐
    │ FABRIC: Aso-Oke     │
    │ WEIGHT: Medium      │
    │ CARE: Dry clean only│
    │ ● View Details      │
    └─────────────────────┘
  (Frosted glass, 20px radius, cream text on dark glass)

─── SCREEN 3: AI SIZING WIZARD (3-STEP MODAL) ───

Overlays on top of the dimmed 3D Atelier background (40% black overlay).

Centered glassmorphism modal:
  • Width: 520px (desktop), full-width (mobile)
  • Background: rgba(255,250,239,0.06) with backdrop-blur(24px)
  • Border: 1px solid rgba(255,255,255,0.08)
  • Border-radius: 28px
  • Subtle burgundy box-shadow

Header: "Your Digital Twin" in Playfair Display Italic, cream.
Three progress dots below (cream filled = active, outline = inactive).

STEP 1 — MEASUREMENTS:
  Clean input fields in a 2-column grid:
  [Height (cm)]  [Weight (kg)]
  [Chest (in)]   [Waist (in)]
  [Hip (in)]     [Shoulder (in)]

  Input fields: transparent background, thin bottom border only
  (#635B51), cream text. On focus, bottom border turns burgundy.

  Bottom: Burgundy filled button "Continue →" (#800020 background,
  white text, 16px border-radius).

STEP 2 — REFERENCE UPLOAD:
  Large dashed-border drop zone (center of modal):
  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
  │                               │
  │    📸 Drop reference photo    │
  │    or click to browse         │
  │                               │
  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
  (Dashed border in #635B51, icon in burgundy)
  
  Text below: "Upload a photo of clothing you love, and our AI
  will generate a concept on your mannequin" — Inter Light, #C4C1B8

STEP 3 — PREVIEW:
  Split layout: Left side shows the 3D mannequin scaled to the
  user's proportions. Right side shows a summary:
    Height: 178cm ✓
    Chest: 40in ✓
    Build: Athletic ✓
  
  Gold "L" badge: "Your Digital Twin is Ready"
  Burgundy button: "Enter the Atelier →"

─── SCREEN 4: AI CONCEPT GENERATOR ───

Glassmorphism panel (same style as sizing wizard) overlaying the
3D scene.

Top: "Describe Your Dream" in Playfair Display Italic, cream.

Large text input area:
  Placeholder: "I want a fitted Agbada with gold embroidery
  and a modern slim cut..."
  (Multi-line, transparent bg, cream text, burgundy caret)

Below input: "OR" divider line with burgundy text.

Image upload zone (smaller, horizontal):
  [ 📸 Upload Reference Image ]

Burgundy button: "✨ Generate Concept"

Below — RESULTS AREA:
  When generating: elegant loading animation — a thin burgundy
  line drawing itself in a circular pattern (like thread on a spool).
  Text: "Weaving your vision..." in cream italic.

  When complete: The 3D mannequin in the background updates with
  the AI-generated garment. A small glassmorphism card appears:
    "Fitted Agbada — Gold Trim"
    Estimated: $380 - $520
    [ Order Bespoke → ]

─── SCREEN 5: CHECKOUT DRAWER (KORA PAY) ───

Slide-in panel from the RIGHT side of the screen.
  • Width: 420px (desktop), full-width (mobile)
  • Background: rgba(27, 23, 23, 0.85) with backdrop-blur(32px)
  • Left edge: subtle 1px burgundy border glow
  • Animation: slides in from right with 0.4s ease

Close button: thin "✕" in cream, top-right corner.

Content (top to bottom):

  1. ORDER SUMMARY:
     Small garment thumbnail (3D render) in a rounded frame.
     "Bespoke Agbada — Gold Trim"
     Size: Custom (Digital Twin #0847)
     
     Price: $450.00 (or ₦680,000)
     (Dynamic based on currency toggle state)

  2. ESCROW BADGE:
     Rounded pill shape, thin gold border:
     🔒 "Bespoke Escrow Protected"
     Tiny text below: "Your funds are held securely until
     delivery is verified"

  3. KORA CHECKOUT:
     Embedded Kora Pay checkout iframe/form area.
     Clean white form on dark background.
     Card number, expiry, CVV fields.

  4. Bottom: Burgundy "Pay Securely — $450" full-width button.

─── SCREEN 6: MOBILE RESPONSIVE VIEW ───

Show the Landing Page and Atelier on a mobile viewport (375px).

Landing: "LOOM" wordmark stacks vertically, 3D mannequin fills
the screen, ghost button sits at bottom with thumb-friendly size.

Atelier: 3D canvas fills entire screen. Currency toggle and
Purchase button are fixed at bottom in a thin glassmorphism bar.
Hotspot info cards become bottom sheets instead of floating cards.

Sizing wizard becomes a full-screen modal with larger touch targets.
Checkout drawer becomes full-screen slide-up sheet.

═══════════════════════════════════════════════════
OVERALL MOOD KEYWORDS
═══════════════════════════════════════════════════

Luxurious • Editorial • Museum-Gallery • Burgundy Wine
Ivory Cream • Glassmorphism • Serif Elegance • Minimal
Fashion-Forward • Bespoke • Premium • African Heritage
3D Immersive • Dark Mode • Gold Accents • Silk Textures
```

---

## 💡 Tips for Using This in Stitch

1. **Paste the entire block above** into Stitch as your design prompt
2. **Generate all 6 screens** — then iterate on each one individually
3. **If Stitch asks for a reference image**, upload the gradient mesh image or the Joseane Lins branding image from your folder — they best capture the overall feel
4. **Export to Figma** when satisfied — then share the Figma link with me and I'll translate it pixel-for-pixel into code
