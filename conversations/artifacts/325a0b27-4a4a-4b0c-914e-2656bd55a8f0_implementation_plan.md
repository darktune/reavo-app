# Build Abraham Toluwani's Portfolio

Build premium, minimal, responsive personal portfolio.
Tech: Next.js, TypeScript, Tailwind CSS, Framer Motion.
Identity: Polymath, Builder, Computer Scientist, Game Dev, Creative.

## User Review Required

> [!IMPORTANT]
> Verify tech stack: Next.js (App Router), TypeScript, Tailwind, Framer Motion.
> Confirm installation in empty directory `c:\Users\USER\OneDrive\Documents\MY PORTFOLIO`.

## Proposed Changes

### Setup
- Initialize Next.js app in current directory.
- Install `framer-motion` (animations), `lucide-react` (icons), `clsx`, `tailwind-merge` (utility).

### Design System (Tailwind Config)
- **Colors**: bg-light (`#FAFAFA`), bg-dark (`#0A0A0A`), text-muted (`#8793A6`), accent (`#4A6BF3`).
- **Typography**: Space Grotesk (headings), Geist Mono (tech), Inter (body).
- **Layout**: 8px grid, Z/F pattern, Standout Rule (1 focal point/section).

### Data Architecture (`data/` directory)
- **Projects**: CivOS, D-MEX Protocol, Virtual Atelier, OEES, Paint Infusion, CodePlay Naija.
- **Skills**: Build, Create, Games, Explore.
- **Experiments (Lab)**: Pointillism art, Biz/Fashion, Trading (SMC), Face Emotion Detection.

### Component Tree
#### Layout
- `[NEW] components/layout/Nav.tsx`
- `[NEW] components/layout/Footer.tsx`
- `[NEW] components/layout/Section.tsx`

#### UI Primitives
- `[NEW] components/ui/Typography.tsx`
- `[NEW] components/ui/Button.tsx`
- `[NEW] components/ui/Reveal.tsx` (Framer Motion wrapper)

#### Domain
- `[NEW] components/domain/ProjectCard.tsx`
- `[NEW] components/domain/SkillGrid.tsx`
- `[NEW] components/domain/LabCard.tsx`

### Pages (`app/` directory)
- `[NEW] app/page.tsx`: Single page portfolio containing Hero, About, Selected Work, Skills, Lab, and Contact sections.
- `[NEW] app/layout.tsx`: Global layout, fonts, metadata.
- `[NEW] app/globals.css`: Global styles, reset, base variables.

## Verification Plan

### Automated
- `npm run build` -> verify strict TypeScript/Next.js build passes.

### Manual
- Desktop, Tablet, Mobile responsive checks.
- Verify animations (framer-motion) trigger correctly.
- Verify dark/light mode aesthetics.
- Validate Lighthouse performance/accessibility (semantic HTML, reduced motion).
