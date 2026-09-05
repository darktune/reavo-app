# Loom — Implementation Plan

> **Project**: Loom — A 3D Fashion E-commerce Platform
> **Hackathon**: Kora Hackathon | **Deadline**: June 5th (~8 days)
> **Colors**: White `#FFFFFF` + Burgundy `#800020`
> **Flagship Brand**: Abraham's Collection

---

## User Review Required

> [!IMPORTANT]
> **Approve this plan so I can begin scaffolding immediately.** Given the ~8-day deadline, every hour counts.

> [!WARNING]
> **3D Models**: You don't have `.glb` exports yet. I'll start with a **free mannequin model** and placeholder garments so you can see the full experience working. See the [3D Model Guide](#-3d-model-guide-for-you) below for how to create your own later.

> [!IMPORTANT]
> **Kora API Keys**: You'll need to sign up at [korapay.com](https://korapay.com) and get your test API keys. See the [Kora Setup Guide](#-kora-api-setup-guide) below. I'll build the integration with mock/test mode so it works without keys initially.

---

## Proposed Changes

### Scope — What I'll Build for the MVP

Given the deadline, here's the prioritized feature set:

| Priority | Feature | Status |
|----------|---------|--------|
| 🔴 P0 | Stunning UI — White & burgundy glassmorphism design | Will build |
| 🔴 P0 | 3D Garment Viewer — Rotate, zoom, inspect garments | Will build |
| 🔴 P0 | Kora Pay Checkout — Slide-in drawer with escrow flow | Will build |
| 🔴 P0 | Dynamic Currency Toggle (USD/NGN) | Will build |
| 🟡 P1 | AI Sizing Wizard — Measurement input → scaled mannequin | Will build |
| 🟡 P1 | AI Concept Generator — Text/image prompt → mock 3D preview | Will build (simulated) |
| 🟡 P1 | Responsive Design — Mobile + Desktop | Will build |
| 🟢 P2 | GSAP Animations — Cinematic transitions, scroll effects | Will build (essential ones) |
| ⚪ P3 | Real-Time Tailor Collaboration | Post-hackathon |
| ⚪ P3 | Full Aso-Ebi Group Payment Hub | Post-hackathon |

---

### Tech Stack

```
Frontend:  React 19 + Vite
3D:        React Three Fiber + Drei + Three.js
Animation: GSAP
Styling:   Tailwind CSS v4
Payments:  Kora Pay API
Backend:   Node.js + Express (API routes)
Deploy:    Vercel (frontend) + Render (backend)
```

---

### Project Structure

```
loom/
├── public/
│   └── models/           # .glb garment files
├── src/
│   ├── components/
│   │   ├── Scene3D/       # R3F canvas, lighting, garment loader
│   │   ├── GarmentViewer/ # Rotate/zoom/hotspot interaction
│   │   ├── SizingWizard/  # AI measurement onboarding (3-step)
│   │   ├── AIConceptor/   # Text/image → garment preview
│   │   ├── Checkout/      # Kora Pay slide-in drawer
│   │   ├── CurrencyToggle/# USD/NGN pill toggle
│   │   └── UI/            # Ghost buttons, modals, layout
│   ├── hooks/             # Custom hooks (useKora, useGarment, etc.)
│   ├── lib/               # Utils, API clients
│   ├── styles/            # Tailwind config, global CSS
│   ├── App.jsx
│   └── main.jsx
├── server/
│   ├── routes/
│   │   ├── payment.js     # /api/initialize-payment
│   │   └── webhook.js     # Kora webhook listener
│   └── index.js           # Express server
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

### Design System — White & Burgundy

```
Primary Colors:
  --burgundy:        #800020
  --burgundy-light:  #A0334D
  --burgundy-dark:   #5C0017
  --burgundy-glow:   rgba(128, 0, 32, 0.3)

Neutrals:
  --white:           #FFFFFF
  --off-white:       #FAFAFA
  --cream:           #F5F0EB
  --gray-100:        #F3F3F3
  --gray-200:        #E5E5E5
  --gray-400:        #9CA3AF
  --gray-800:        #1F1F1F
  --black:           #0A0A0A

Glass Effects:
  --glass-white:     rgba(255, 255, 255, 0.08)
  --glass-burgundy:  rgba(128, 0, 32, 0.1)
  --backdrop-blur:   blur(20px)

Typography:
  --font-display:    'Outfit', sans-serif  (headings)
  --font-body:       'Inter', sans-serif   (body)
```

**Design Aesthetic**: Dark mode with white text on near-black backgrounds, burgundy accents for CTAs and highlights, heavy glassmorphism on modals/drawers, museum-style 3D lighting.

---

### Pages & Components

#### Landing / Hero Page
- Full-screen 3D canvas as background (mannequin slowly rotating)
- Floating "LOOM" wordmark (Outfit font, thin weight)
- Ghost button: "Enter the Atelier →"
- Subtle burgundy gradient glow at bottom

#### The Atelier (Main 3D Showroom)
- Full-screen R3F canvas with museum lighting
- Garment model centered — user can orbit, zoom, pan
- Raycaster hotspots on garment → click to see fabric details
- Floating "Purchase" ghost button → triggers Kora checkout drawer
- Pill-shaped USD/NGN toggle in top-right corner

#### AI Sizing Wizard (3-step glassmorphism modal)
- **Step 1**: Enter height, weight, chest, waist, hip measurements
- **Step 2**: Optional reference photo upload
- **Step 3**: Preview — mannequin scales to their proportions
- Glassmorphism wizard with progress dots

#### AI Concept Generator
- Text input: "I want a fitted Agbada with gold trim"
- Or drag-and-drop reference image
- Simulated "generating..." animation → displays concept on mannequin
- (Mock for hackathon — real AI integration post-launch)

#### Checkout Drawer (Kora Pay)
- Slide-in from right, frosted glass background
- Order summary (garment name, size, price)
- Kora Checkout iframe embedded
- Dynamic currency display
- "Bespoke Escrow" badge showing funds are protected

---

## 🎨 Stitch UI Design Prompt (For You)

Copy and paste this into Stitch to generate your UI designs:

```
Design a premium, ultra-minimalist 3D fashion e-commerce app called "Loom".

COLOR PALETTE:
- Background: Near-black (#0A0A0A) 
- Primary accent: Burgundy (#800020)
- Text: White (#FFFFFF) and light gray (#9CA3AF)
- Glass panels: White at 8% opacity with 20px backdrop blur

DESIGN LANGUAGE:
- iOS 26 glassmorphism — frosted glass panels, floating components
- No traditional navbars or sidebars
- "Ghost Buttons" — transparent with thin white borders, no fill
- Typography: "Outfit" for headings (ultra-thin weight 200), "Inter" for body
- Massive negative space — the 3D model is always the hero
- Subtle burgundy glow effects on hover states
- Pill-shaped toggle switches

SCREENS TO DESIGN:

1. LANDING PAGE: Full dark background. A large 3D mannequin/garment 
   occupies 70% of the viewport (centered). "LOOM" wordmark floats 
   top-center in ultra-thin Outfit font. A single ghost button 
   "Enter the Atelier →" sits bottom-center. Subtle burgundy gradient 
   glow emanates from below the mannequin.

2. THE ATELIER (3D SHOWROOM): Full-screen 3D view of a garment on a 
   mannequin. Small floating glassmorphism info cards appear when 
   hotspots are clicked (showing fabric type, care instructions, 
   price). A "Purchase" ghost button floats bottom-right. A pill-shaped 
   "USD | NGN" currency toggle floats top-right. No navbar.

3. AI SIZING WIZARD: A centered glassmorphism modal (frosted glass, 
   rounded corners 24px) overlaying the dark 3D background. 3-step 
   wizard with progress dots at top. Step 1 shows clean input fields 
   for Height, Weight, Chest, Waist, Hip. Step 2 shows a drag-and-drop 
   zone for reference photos. Step 3 shows a preview of the scaled 
   mannequin. Burgundy "Continue" button.

4. CHECKOUT DRAWER: A slide-in panel from the right side (40% width), 
   frosted glass background. Shows order summary at top (garment 
   thumbnail, name, size, price). Below that, the Kora Pay checkout 
   form. A "Bespoke Escrow Protected ✓" badge in burgundy. 
   Close button (X) top-right.

5. AI CONCEPT GENERATOR: Centered glassmorphism card. Text input 
   field with placeholder "Describe your dream garment..." and an 
   image upload drop zone below it. A burgundy "Generate Concept" 
   button. Below, a preview area showing the AI-generated garment 
   concept on the user's mannequin.

STYLE RULES:
- Border radius: 16-24px on all cards and modals
- Subtle box shadows with burgundy tint
- Micro-animations: buttons scale up 1.02x on hover, modals fade + slide in
- All interactive elements have a subtle burgundy glow on hover
- Mobile responsive — modals become full-screen on mobile
```

---

## 🧊 3D Model Guide (For You)

Since you don't have `.glb` files yet, here are your options ranked by ease:

### Option 1: Free Models (Fastest — I Recommend This for the Hackathon)
- **Sketchfab** → Search "mannequin" or "fashion" → Download `.glb` format (many are free)
- **TurboSquid** → Free section has basic mannequin models
- I'll include a **free mannequin model** in the build so the app works immediately

### Option 2: AI 3D Generation (Medium Effort)
- **Meshy.ai** → Upload a photo of a garment → get a 3D `.glb` model in minutes
- **Tripo3D** → Text-to-3D: type "Nigerian Agbada on mannequin" → generates a 3D model
- **Luma Genie** → Similar text/image to 3D

### Option 3: Blender (Highest Quality, Most Effort)
- Model garments in Blender → File → Export → glTF 2.0 (.glb)
- Check "Apply Modifiers" and "Include Textures"
- Use Draco compression to keep files under 5MB

> [!TIP]
> **For the hackathon, start with Option 1 (free models) and upgrade to your own Blender models after.** The judges care more about the working concept than perfect 3D assets.

---

## 💳 Kora API Setup Guide

1. **Sign up** at [https://korapay.com](https://korapay.com) → Create a merchant account
2. **Get test keys** from Dashboard → Settings → API Keys → Copy your **Test Public Key** and **Test Secret Key**
3. **Create a `.env` file** in the project (I'll set this up for you):
   ```
   KORA_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
   KORA_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   ```
4. **Test mode** processes fake transactions so you can demo the full flow without real money

> [!TIP]
> I'll build the integration so it works in **mock mode** without keys initially. You can plug in your real test keys when ready.

---

## Verification Plan

### Automated Tests
- `npm run build` — Verify production build succeeds
- Browser test — Load the app and verify 3D scene renders
- Test Kora checkout flow in test mode

### Manual Verification
- Verify responsive layout on mobile viewport
- Test full user journey: Landing → Atelier → Sizing → Concept → Checkout
- Verify GSAP animations are smooth (60fps)
- Test currency toggle switches prices correctly
